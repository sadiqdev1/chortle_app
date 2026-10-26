<?php

namespace App\Policies;

use App\Models\Meme;
use App\Models\User;

class MemePolicy
{
    public function update(User $user, Meme $meme): bool
    {
        return $user->id === $meme->user_id;
    }

    public function delete(User $user, Meme $meme): bool
    {
        return $user->id === $meme->user_id;
    }
}
