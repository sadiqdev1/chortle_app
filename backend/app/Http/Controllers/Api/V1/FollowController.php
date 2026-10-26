<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Follow;
use App\Models\User;
use App\Notifications\NewFollowerNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function toggle(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        if ($authUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot follow yourself.',
            ], 422);
        }

        $existing = Follow::where('follower_id', $authUser->id)
            ->where('following_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $following = false;
        } else {
            Follow::create([
                'follower_id' => $authUser->id,
                'following_id' => $user->id,
            ]);

            $following = true;

            // Notify the user they have a new follower
            $user->notify(new NewFollowerNotification($authUser));
        }

        return response()->json([
            'message' => $following ? 'Followed successfully.' : 'Unfollowed successfully.',
            'following' => $following,
        ]);
    }

    public function followers(User $user): JsonResponse
    {
        $followers = $user->followers()
            ->with('follower:id,name,username,avatar,bio,location')
            ->paginate(20);

        $followers->setCollection(
            $followers->getCollection()->map(
                fn (Follow $follow) => $follow->follower
            )
        );

        return response()->json([
            'data' => $followers->items(),
            'current_page' => $followers->currentPage(),
            'last_page' => $followers->lastPage(),
            'per_page' => $followers->perPage(),
            'total' => $followers->total(),
        ]);
    }

    public function following(User $user): JsonResponse
    {
        $following = $user->following()
            ->with('following:id,name,username,avatar,bio,location')
            ->paginate(20);

        $following->setCollection(
            $following->getCollection()->map(
                fn (Follow $follow) => $follow->following
            )
        );

        return response()->json([
            'data' => $following->items(),
            'current_page' => $following->currentPage(),
            'last_page' => $following->lastPage(),
            'per_page' => $following->perPage(),
            'total' => $following->total(),
        ]);
    }
}
