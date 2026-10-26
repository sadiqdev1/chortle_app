<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Meme;
use App\Notifications\NewReactionNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    /**
     * POST /memes/{meme}/like — toggle reaction on a meme.
     */
    public function toggleMeme(Request $request, Meme $meme): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'type' => ['sometimes', 'string', 'in:like,love,haha,wow,sad,angry,fire,laugh,skull,heart'],
        ]);

        $type = $request->input('type', 'fire');

        $existing = $meme->reactions()
            ->where('user_id', $user->id)
            ->first();

        $wasNew = false;

        if ($existing) {
            if ($existing->type === $type) {
                $existing->delete();
                $reacted = false;
            } else {
                $existing->update(['type' => $type]);
                $reacted = true;
            }
        } else {
            $meme->reactions()->create([
                'user_id' => $user->id,
                'type'    => $type,
            ]);
            $reacted = true;
            $wasNew  = true;
        }

        // Notify the meme owner on first reaction (not on toggle/change)
        if ($wasNew && $meme->user_id !== $user->id) {
            $meme->user->notify(new NewReactionNotification($user, $meme, $type));
        }

        return response()->json([
            'reacted'         => $reacted,
            'reactions_count' => $meme->reactions()->count(),
        ]);
    }

    /**
     * POST /comments/{comment}/like — toggle like on a comment.
     */
    public function toggleComment(Request $request, Comment $comment): JsonResponse
    {
        $user = $request->user();

        $existing = $comment->reactions()
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            $comment->reactions()->create([
                'user_id' => $user->id,
                'type'    => 'like',
            ]);
            $liked = true;
        }

        return response()->json([
            'liked'       => $liked,
            'likes_count' => $comment->reactions()->count(),
        ]);
    }
}
