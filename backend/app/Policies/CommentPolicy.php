<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    public function delete(User $user, Comment $comment): bool
    {
        // Comment owner OR the meme owner can delete
        return $user->id === $comment->user_id
            || $user->id === $comment->meme?->user_id;
    }

    public function update(User $user, Comment $comment): bool
    {
        return $user->id === $comment->user_id;
    }
}
