<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Meme;
use App\Models\User;
use App\Notifications\CommentReplyNotification;
use App\Notifications\NewCommentNotification;
use App\Services\Sanitiser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * GET /memes/{meme}/comments
     */
    public function index(Meme $meme): JsonResponse
    {
        abort_unless($meme->status === 'approved', 404);

        $comments = $meme->comments()
            ->whereNull('parent_id')
            ->with('user:id,name,username,avatar,verification_status')
            ->withCount('replies')
            ->latest()
            ->paginate(20);

        return response()->json(
            CommentResource::collection($comments)
                ->response()
                ->getData(true)
        );
    }

    /**
     * GET /comments/{comment}/replies
     */
    public function replies(Comment $comment): JsonResponse
    {
        abort_if(
            $comment->parent_id !== null,
            422,
            'This comment is itself a reply.'
        );

        $comment->loadMissing('meme');

        abort_unless(
            $comment->meme?->status === 'approved',
            404
        );

        $replies = $comment->replies()
            ->with('user:id,name,username,avatar,verification_status')
            ->oldest()
            ->paginate(20);

        return response()->json(
            CommentResource::collection($replies)
                ->response()
                ->getData(true)
        );
    }

    /**
     * POST /memes/{slug}/comments
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $user = $request->user();

        abort_unless($user instanceof User, 401);

        $meme = Meme::query()
            ->where('slug', $slug)
            ->where('status', 'approved')
            ->firstOrFail();

        abort_if(
            ! $meme->allow_comments,
            403,
            'Comments are disabled for this meme.'
        );

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:2000'],
            'parent_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:comments,id',
            ],
        ]);

        $parent = null;

        if (! empty($validated['parent_id'])) {
            $parent = Comment::query()
                ->where('meme_id', $meme->id)
                ->whereNull('parent_id')
                ->findOrFail($validated['parent_id']);
        }

        $body = trim(
            Sanitiser::commentBody($validated['body'])
        );

        abort_if(
            $body === '',
            422,
            'Your comment must contain readable text.'
        );

        $comment = $meme->comments()->create([
            'user_id'   => $user->id,
            'body'      => $body,
            'parent_id' => $parent?->id,
        ]);

        $comment->load('user:id,name,username,avatar,verification_status');

        // Notify the parent comment's author when someone replies.
        if ($parent) {
            $recipient = $parent->user;

            if ($recipient && $recipient->id !== $user->id) {
                $recipient->notify(
                    new CommentReplyNotification(
                        $user,
                        $meme,
                        $comment
                    )
                );
            }
        } else {
            // Notify the meme owner about a new top-level comment.
            $recipient = $meme->user;

            if ($recipient && $recipient->id !== $user->id) {
                $recipient->notify(
                    new NewCommentNotification(
                        $user,
                        $meme,
                        $comment
                    )
                );
            }
        }

        return response()->json([
            'message' => 'Comment created successfully.',
            'comment' => (new CommentResource($comment))->resolve($request),
        ], 201);
    }

    /**
     * PATCH /comments/{comment}
     */
    public function update(
        Request $request,
        Comment $comment
    ): JsonResponse {
        $user = $request->user();

        abort_unless($user instanceof User, 401);

        // Only the author can edit their comment.
        abort_unless($comment->user_id === $user->id, 403);

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:2000'],
        ]);

        $body = trim(
            Sanitiser::commentBody($validated['body'])
        );

        abort_if(
            $body === '',
            422,
            'Your comment must contain readable text.'
        );

        $comment->update([
            'body' => $body,
        ]);

        $comment->load(
            'user:id,name,username,avatar,verification_status'
        );

        return response()->json([
            'message' => 'Comment updated successfully.',
            'comment' => (new CommentResource($comment))->resolve($request),
        ]);
    }

    /**
     * DELETE /comments/{comment}
     */
    public function destroy(
        Request $request,
        Comment $comment
    ): JsonResponse {
        $user = $request->user();

        abort_unless($user instanceof User, 401);

        $comment->loadMissing('meme');

        // Allow the comment author or the meme owner to delete it.
        abort_unless(
            $comment->user_id === $user->id
                || $comment->meme?->user_id === $user->id,
            403
        );

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully.',
        ]);
    }
}
