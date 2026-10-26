<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemeResource;
use App\Models\Meme;
use App\Models\SavedMeme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    /**
     * GET /bookmarks — list authenticated user's saved memes.
     */
    public function index(Request $request): JsonResponse
    {
        $savedMemes = $request->user()
            ->savedMemes()
            ->with('meme.user:id,name,username,avatar')
            ->latest('created_at')
            ->paginate(20);

        // Map SavedMeme rows to their Meme, then wrap in a Resource collection
        $memes = $savedMemes->getCollection()->map(fn ($s) => $s->meme)->filter();

        $paginatedData = $savedMemes->toArray();
        $paginatedData['data'] = MemeResource::collection($memes)->resolve();

        return response()->json($paginatedData);
    }

    /**
     * POST /memes/{meme}/bookmark — toggle bookmark on a meme.
     */
    public function toggle(Request $request, Meme $meme): JsonResponse
    {
        $userId = $request->user()->id;

        $existing = SavedMeme::where('user_id', $userId)
            ->where('meme_id', $meme->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $bookmarked = false;
        } else {
            SavedMeme::create([
                'user_id' => $userId,
                'meme_id' => $meme->id,
            ]);
            $bookmarked = true;
        }

        return response()->json(['bookmarked' => $bookmarked]);
    }
}
