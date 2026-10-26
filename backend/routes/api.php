<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\MemeController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\FollowController;
use App\Http\Controllers\Api\V1\LikeController;
use App\Http\Controllers\Api\V1\BookmarkController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\AppealController;
use App\Http\Controllers\Api\V1\VerificationController;
use App\Http\Controllers\Api\V1\UploadController;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::prefix('auth')->group(function () {

        Route::post('/register', [AuthController::class, 'register'])
            ->middleware('throttle:10,1');

        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:20,1');

        Route::post('/verify-email', [AuthController::class, 'verifyEmail'])
            ->middleware('throttle:10,1');

        // Development only
        Route::get('/dev/otp', [AuthController::class, 'devGetOtp'])
            ->middleware('throttle:30,1');

        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
            ->middleware('throttle:5,1');

        Route::post('/reset-password', [AuthController::class, 'resetPassword'])
            ->middleware('throttle:10,1');

        // OAuth
        Route::get('/{provider}/redirect', [AuthController::class, 'oauthRedirect']);
        Route::get('/{provider}/callback', [AuthController::class, 'oauthCallback']);

        Route::middleware(['auth:sanctum', 'throttle:30,1'])->group(function () {
            Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Public content routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('throttle:60,1')->group(function () {

        // Users — specific routes before dynamic username routes
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/suggested', [UserController::class, 'suggested']);
        Route::get('/users/check-username', [UserController::class, 'checkUsername']);
        Route::get('/users/{username}/memes', [MemeController::class, 'userMemes']);
        Route::get('/users/{username}', [UserController::class, 'show']);

        // Memes
        Route::get('/memes', [MemeController::class, 'index']);
        Route::get('/memes/{meme:slug}', [MemeController::class, 'show']);

        // Comments
        Route::get('/memes/{meme:slug}/comments', [CommentController::class, 'index']);
        Route::get('/comments/{comment}/replies', [CommentController::class, 'replies']);
    });

    /*
    |--------------------------------------------------------------------------
    | Protected routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

            // File uploads
        Route::post('/upload', [UploadController::class, 'store'])
            ->middleware('throttle:10,1');

        Route::delete('/upload', [UploadController::class, 'destroy'])
            ->middleware('throttle:10,1');

        // Memes
        Route::post('/memes', [MemeController::class, 'store'])
            ->middleware('throttle:6,1');

        Route::delete('/memes/{slug}', [MemeController::class, 'destroy'])
            ->middleware('throttle:6,1');

        Route::post('/memes/{slug}/report', [MemeController::class, 'report'])
            ->middleware('throttle:5,1');

        // Comments
        Route::post('/memes/{slug}/comments', [CommentController::class, 'store'])
            ->middleware('throttle:30,1');

        Route::patch('/comments/{comment}', [CommentController::class, 'update']);
        Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

        // Reactions
        Route::post('/memes/{meme}/like', [LikeController::class, 'toggleMeme']);
        Route::post('/comments/{comment}/like', [LikeController::class, 'toggleComment']);

        // Bookmarks
        Route::get('/bookmarks', [BookmarkController::class, 'index']);
        Route::post('/memes/{meme}/bookmark', [BookmarkController::class, 'toggle']);

        // Profile
        Route::get('/profile', [UserController::class, 'profile']);
        Route::patch('/profile', [UserController::class, 'update']);
        Route::put('/profile', [UserController::class, 'update']);
        Route::delete('/profile', [UserController::class, 'destroy']);
        Route::put('/profile/password', [UserController::class, 'changePassword'])
            ->middleware('throttle:6,1');

        // Push notification token
        Route::post('/profile/push-token', [UserController::class, 'storePushToken']);
        Route::delete('/profile/push-token', [UserController::class, 'removePushToken']);

        // Follow
        Route::post('/users/{user:username}/follow', [FollowController::class, 'toggle']);
        Route::get('/users/{user:username}/followers', [FollowController::class, 'followers']);
        Route::get('/users/{user:username}/following', [FollowController::class, 'following']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);

        // Appeals
        Route::get('/appeal', [AppealController::class, 'show']);
        Route::post('/appeal', [AppealController::class, 'submit']);

        // Verification
        Route::get('/verification/status', [VerificationController::class, 'status']);
        Route::post('/verification/request', [VerificationController::class, 'request'])
            ->middleware('throttle:3,1');
        Route::post('/verification/cancel', [VerificationController::class, 'cancel']);
    });
});
