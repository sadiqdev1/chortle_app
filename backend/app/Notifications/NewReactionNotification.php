<?php

namespace App\Notifications;

use App\Models\Meme;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Fired when someone reacts to your meme.
 * Only sent on the first reaction (not on every change) to avoid spam.
 */
class NewReactionNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly User   $actor,
        public readonly Meme   $meme,
        public readonly string $reactionType,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $emoji = match ($this->reactionType) {
            'fire'  => '🔥',
            'laugh' => '😂',
            'skull' => '💀',
            'heart' => '❤️',
            default => '👍',
        };

        return [
            'actor_name'     => $this->actor->name,
            'actor_username' => $this->actor->username,
            'actor_avatar'   => $this->actor->avatar,
            'meme_slug'      => $this->meme->slug,
            'meme_image'     => $this->meme->image_url,
            'message'        => "{$emoji} {$this->actor->name} reacted to your meme",
            'reaction_type'  => $this->reactionType,
        ];
    }
}
