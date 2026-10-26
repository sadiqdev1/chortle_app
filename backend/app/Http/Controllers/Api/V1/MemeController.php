<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemeResource;
use App\Models\Meme;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
class MemeController extends Controller
{
    /* ──────────────────────────────────────────────────────────
     | Feed — cursor-paginated, supports category / q / following
     ─────────────────────────────────────────────────────────── */

public function index(Request $request)
{
    $validated = $request->validate([
        'category' => ['sometimes', 'string', 'max:50'],
        'tag'      => ['sometimes', 'string', 'max:40'],
        'q'        => ['sometimes', 'string', 'max:120'],
        'sort'     => ['sometimes', Rule::in(['latest', 'top'])],
        'feed'     => ['sometimes', Rule::in(['following'])],
        'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
    ]);

    $user = $request->user('sanctum');

    // A following feed requires authentication.
    if (
        ($validated['feed'] ?? null) === 'following'
        && ! $user
    ) {
        return response()->json([
            'message' => 'Authentication is required for the following feed.',
        ], 401);
    }

    $query = Meme::query()
        ->with('user:id,name,username,avatar,verification_status')
        ->withCount([
            'comments as comments_count' => fn ($query) =>
                $query->whereNull('parent_id'),
        ])
        ->when(
            $user !== null,
            fn ($query) => $query->withExists([
                'savedBy as isBookmarked' => fn ($query) =>
                    $query->where('user_id', $user->id),
            ])
        )
        ->where('status', 'approved');

    // Following feed
    if (($validated['feed'] ?? null) === 'following') {
        $followingIds = $user
            ->following()
            ->pluck('following_id');

        $query->whereIn('user_id', $followingIds);
    }

    // Filters
    $query
        ->when(
            $validated['category'] ?? null,
            fn ($query, $category) =>
                $query->where('category', $category)
        )
        ->when(
            $validated['tag'] ?? null,
            fn ($query, $tag) =>
                $query->whereJsonContains('tags', $tag)
        )
        ->when(
            $validated['q'] ?? null,
            fn ($query, $search) => $query->where(
                fn ($query) => $query
                    ->where('caption', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
            )
        );

    // Stable ordering for cursor pagination
    if (($validated['sort'] ?? 'latest') === 'top') {
        $query->orderByDesc('views_count')
              ->orderByDesc('id');
    } else {
        $query->orderByDesc('created_at')
              ->orderByDesc('id');
    }

    // Paginate before loading reaction counts.
    $memes = $query->cursorPaginate(
        $validated['per_page'] ?? 15
    );

    $memeIds = $memes->getCollection()->pluck('id');

    // Batch reaction counts for all memes on this page.

        // Batch reaction counts and current-user reactions for this page.
        $reactionCounts = collect();
        $myReactions = collect();

        if ($memeIds->isNotEmpty()) {
            $reactionQuery = DB::table('reactions')
                ->where('reactable_type', (new Meme())->getMorphClass())
                ->whereIn('reactable_id', $memeIds);

            $reactionCounts = (clone $reactionQuery)
                ->select('reactable_id', 'type')
                ->selectRaw('COUNT(*) as cnt')
                ->groupBy('reactable_id', 'type')
                ->get()
                ->groupBy('reactable_id')
                ->map(fn ($rows) => $rows
                    ->mapWithKeys(fn ($row) => [
                        $row->type => (int) $row->cnt,
                    ])
                    ->all()
                );

            // Only fetch personal reaction state for authenticated users.
            if ($user) {
                $myReactions = (clone $reactionQuery)
                    ->where('user_id', $user->id)
                    ->pluck('type', 'reactable_id');
            }
        }

        // Attach engagement state to each meme before resource serialization.
        $memes->getCollection()->each(
            function ($meme) use ($reactionCounts, $myReactions) {
                $meme->setAttribute(
                    'reaction_counts',
                    $reactionCounts->get($meme->id, [])
                );

                $meme->setAttribute(
                    'my_reaction',
                    $myReactions->get($meme->id)
                );
            }
        );

        return MemeResource::collection($memes);

}

    /* ──────────────────────────────────────────────────────────
     | Single meme — by slug
     ─────────────────────────────────────────────────────────── */

    public function show(Request $request, string $slug): JsonResponse
    {
        $meme = Meme::with('user:id,name,username,avatar,verification_status')
            ->withCount('comments')
            ->where('slug', $slug)
            ->where('status', 'approved')
            ->firstOrFail();

        // Passive view tracking — fire and forget
        $userId    = $request->user()?->id;
        $ipAddress = $request->ip();

        $alreadyViewed = \App\Models\MemeView::where('meme_id', $meme->id)
            ->where('viewed_at', '>=', now()->subMinutes(30))
            ->where(function ($query) use ($userId, $ipAddress) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('ip_address', $ipAddress);
                }
            })
            ->exists();

        if (! $alreadyViewed) {
            \App\Models\MemeView::create([
                'meme_id'    => $meme->id,
                'user_id'    => $userId,
                'ip_address' => $ipAddress,
                'user_agent' => $request->userAgent(),
                'viewed_at'  => now(),
            ]);
            $meme->increment('views_count');
        }

        return response()->json([
            'data' => new MemeResource($meme->refresh()),
        ]);
    }

    // Image URL must come from our upload domain or any trusted CDN
    private const ALLOWED_IMAGE_DOMAINS = [
        'storage.googleapis.com',
        'firebasestorage.googleapis.com',
        's3.amazonaws.com',
        'res.cloudinary.com',
        'uploadthing.com',
        'utfs.io',
        // Add your actual upload domain here, e.g.:
        'localhost',
        '127.0.0.1',
        '10.138.176.232',
    ];

    private static function validateImageUrl(string $url): bool
    {
        $host = parse_url($url, PHP_URL_HOST);
        if (! $host) return false;
        foreach (self::ALLOWED_IMAGE_DOMAINS as $domain) {
            if ($host === $domain || str_ends_with($host, ".{$domain}")) {
                return true;
            }
        }
        return false;
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'caption'        => ['sometimes', 'nullable', 'string', 'max:500'],
            'image_url'      => ['required', 'url', 'max:2048'],
            'category'       => ['sometimes', 'string', 'max:50'],
            'tags'           => ['sometimes', 'array', 'max:10'],
            'tags.*'         => ['string', 'max:40'],
            'allow_comments' => ['sometimes', 'boolean'],
        ]);

        // Guard: image_url must come from an allowed domain
        if (! self::validateImageUrl($validated['image_url'])) {
            return response()->json([
                'message' => 'Image URL domain is not allowed.',
                'errors'  => ['image_url' => ['Please upload images through the app.']],
            ], 422);
        }

        $user    = $request->user();
        $caption = $validated['caption'] ?? null;

        // Generate a unique slug
        $base = $caption ? Str::slug(Str::limit($caption, 60)) : '';
        $slug = ($base ?: 'meme') . '-' . Str::random(8);

        while (Meme::where('slug', $slug)->exists()) {
            $slug = ($base ?: 'meme') . '-' . Str::random(8);
        }

        $meme = Meme::create([
            'user_id'        => $user->id,
            'caption'        => $caption,
            'slug'           => $slug,
            'image_url'      => $validated['image_url'],
            'category'       => $validated['category'] ?? 'Funny',
            'tags'           => $validated['tags'] ?? null,
            'status'         => 'approved',
            'allow_comments' => $validated['allow_comments'] ?? true,
        ]);

        $meme->load('user:id,name,username,avatar,is_verified');
        $meme->loadCount('comments');

        return response()->json([
            'message' => 'Meme created successfully.',
            'data'    => new MemeResource($meme),
        ], 201);
    }

    /* ──────────────────────────────────────────────────────────
     | Update
     ─────────────────────────────────────────────────────────── */

    public function update(Request $request, string $slug): JsonResponse
    {
        $meme = Meme::where('slug', $slug)->firstOrFail();

        Gate::authorize('update', $meme);

        $validated = $request->validate([
            'caption'        => ['sometimes', 'nullable', 'string', 'max:500'],
            'image_url'      => ['sometimes', 'nullable', 'url', 'max:2048'],
            'category'       => ['sometimes', 'string', 'max:50'],
            'tags'           => ['sometimes', 'array', 'max:10'],
            'tags.*'         => ['string', 'max:40'],
            'allow_comments' => ['sometimes', 'boolean'],
        ]);

        $meme->update($validated);

        return response()->json([
            'message' => 'Meme updated.',
            'data'    => new MemeResource($meme->refresh()->load('user')->loadCount('comments')),
        ]);
    }

    /* ──────────────────────────────────────────────────────────
     | Delete
     ─────────────────────────────────────────────────────────── */

    public function destroy(string $slug): JsonResponse
    {
        $meme = Meme::where('slug', $slug)->firstOrFail();

        Gate::authorize('delete', $meme);

        $meme->delete();

        return response()->json(['message' => 'Meme deleted.']);
    }

    /* ──────────────────────────────────────────────────────────
     | User's memes (public)
     ─────────────────────────────────────────────────────────── */

    public function userMemes(string $username): JsonResponse
    {
        $user = User::where('username', $username)->firstOrFail();

        $memes = $user->memes()
            ->with('user:id,name,username,avatar,is_verified')
            ->withCount('comments')
            ->where('status', 'approved')
            ->latest()
            ->cursorPaginate(15);

        return response()->json($memes);
    }

    /* ──────────────────────────────────────────────────────────
     | Report
     ─────────────────────────────────────────────────────────── */

    public function report(Request $request, Meme $meme): JsonResponse
    {
        $validated = $request->validate([
            'reason'      => ['required', 'string', 'in:Spam,Harassment,Inappropriate,Copyright,Other'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $meme->reports()->firstOrCreate(
            ['reporter_id' => $request->user()->id],
            [
                'reason'      => $validated['reason'],
                'description' => $validated['description'] ?? null,
            ]
        );

        return response()->json(['message' => 'Reported. We\'ll review this post.']);
    }
}
