<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

// use Illuminate\Support\Facades\Password;
class UserController extends Controller
{
    public function profile(Request $request)
    {
        return new UserResource($request->user());
    }

    /**
     * GET /users/{username} — public profile lookup.
     * Username is a route segment, not a query param.
     */
    public function show(Request $request, string $username): JsonResponse
    {
        $user = User::where('username', $username)->firstOrFail();

        // Attempt sanctum auth so UserResource can compute is_following for guests
        auth('sanctum')->setRequest($request)->user();

        return response()->json(['data' => new UserResource($user)]);
    }

    /**
     * GET /users?q=search  — search users by name or username
     * GET /users           — returns suggested creators
     */
    public function index(Request $request): JsonResponse
    {
        $q = $request->query('q', '');

        if ($q) {
            $users = User::where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('username', 'like', "%{$q}%");
            })
            ->limit(20)
            ->get();

            return response()->json(['data' => UserResource::collection($users)]);
        }

        return $this->suggested($request);
    }

    /**
     * GET /users/suggested — top creators to follow
     */
    public function suggested(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $users = User::withCount('memes')
            ->having('memes_count', '>', 0)
            ->when($authUser, function ($q) use ($authUser) {
                $followingIds = $authUser->following()->pluck('following_id');
                $q->whereNotIn('id', $followingIds)
                  ->where('id', '!=', $authUser->id);
            })
            ->orderByDesc('memes_count')
            ->limit(10)
            ->get();

        return response()->json(['data' => UserResource::collection($users)]);
    }

    /**
     * GET /users/check-username?username=sadiqdev
     */
    public function checkUsername(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:30', 'alpha_dash'],
        ]);

        $taken = User::where('username', $validated['username'])->exists();

        return response()->json([
            'username'  => $validated['username'],
            'available' => ! $taken,
        ]);
    }

    /**
     * Put or Patch /profile — update own profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'username'    => ['sometimes', 'string', 'max:30', 'alpha_dash', Rule::unique('users', 'username')->ignore($user->id)],
            'bio'         => ['sometimes', 'string', 'max:150'],
            'location'    => ['sometimes', 'string', 'max:50'],
            'avatar'      => ['sometimes', 'nullable', 'url', 'max:2048'],
            'preferences' => ['sometimes', 'json', 'max:1024'],
            'email'       => ['sometimes', 'string', 'lowercase', 'email:rfc,dns', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $emailChanged = isset($validated['email']) && $validated['email'] !== $user->email;
        if ($emailChanged) $validated['email_verified_at'] = null;

        $user->update($validated);

        if ($emailChanged) {
            $user->tokens()->delete();
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => $emailChanged ? 'Profile updated. Please verify your new email address.' : 'Profile updated.',
            'data'    => ['user' => new UserResource($user->fresh())],
        ]);
    }

    /**
     * POST /profile/push-token
     */
    public function storePushToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'push_token' => ['required', 'string', 'max:512'],
        ]);

        $request->user()->update(['push_token' => $validated['push_token']]);

        return response()->json(['message' => 'Push token registered.']);
    }

    /**
     * DELETE /profile/push-token
     */
    public function removePushToken(Request $request): JsonResponse
    {
        $request->user()->update(['push_token' => null]);

        return response()->json(['message' => 'Push token removed.']);
    }

    /**
     * PUT /profile/password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = $request->user();
        $user->update(['password' => Hash::make($validated['password'])]);
        $user->tokens()->delete();

        return response()->json(['message' => 'Password changed. Please log in again.']);
    }

    /**
     * DELETE /profile
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Account deleted. You have 30 days to recover it by contacting support.']);
    }
}
