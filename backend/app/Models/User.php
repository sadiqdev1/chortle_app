<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
        'bio',
        'location',
        'preferences',
        'is_verified',
        'verification_status',
        'verified_at',
        'push_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'github_id',
        'ip_registered',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'preferences' => 'array',
            'last_login_at' => 'datetime',
            'banned_at' => 'datetime',
            'is_verified' => 'boolean',
            'verified_at' => 'datetime',
        ];
    }

    public function memes()
    {
        return $this->hasMany(Meme::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function memeViews()
    {
        return $this->hasMany(MemeView::class);
    }

    public function savedMemes()
    {
        return $this->hasMany(SavedMeme::class);
    }

    public function followers()
    {
        return $this->hasMany(Follow::class, 'following_id');
    }

    public function following()
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }

    public function searchHistories()
    {
        return $this->hasMany(SearchHistory::class);
    }

    public function verificationRequests()
    {
        return $this->hasOne(VerificationRequest::class);
    }

    /**
     * Cascade soft-deletes — when a user is deleted, clean up all their data.
     * This fires on both soft-delete and hard-delete.
     */
    protected static function booted(): void
    {
        static::deleting(function (User $user) {
            // Revoke all tokens
            $user->tokens()->delete();

            // Soft-delete all their memes (which will also orphan reactions/comments on them)
            $user->memes()->each(fn ($meme) => $meme->delete());

            // Delete their comments
            $user->comments()->delete();

            // Remove follows (both directions)
            \App\Models\Follow::where('follower_id', $user->id)
                ->orWhere('following_id', $user->id)
                ->delete();

            // Remove saved memes
            $user->savedMemes()->delete();
        });
    }
}
