<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // auth('sanctum')->user() works even on public routes after the guard
        // has been resolved by UserController::show.
        $authUser    = auth('sanctum')->user();
        $isFollowing = false;

        if ($authUser && $authUser->id !== $this->id) {
            $isFollowing = $this->followers()
                ->where('follower_id', $authUser->id)
                ->exists();
        }

        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'email'               => $this->email,
            'username'            => $this->username,
            'verification_status' => $this->verification_status,
            'is_verified'         => $this->is_verified,
            'avatar'              => $this->avatar,
            'bio'                 => $this->bio,
            'location'            => $this->location,
            'preferences'         => $this->preferences,

            // Consistent snake_case counts the frontend expects
            'followers_count'     => $this->followers()->count(),
            'following_count'     => $this->following()->count(),
            'memes_count'         => $this->memes()->count(),

            // Relationship state for the viewing user
            'is_following'        => $isFollowing,

            'last_login_at'       => $this->last_login_at?->format('Y-m-d H:i:s'),
            'created_at'          => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
