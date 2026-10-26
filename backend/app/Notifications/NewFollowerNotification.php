<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Fired when someone follows you.
 */
class NewFollowerNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly User $actor,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'actor_name'     => $this->actor->name,
            'actor_username' => $this->actor->username,
            'actor_avatar'   => $this->actor->avatar,
            'message'        => "{$this->actor->name} started following you",
        ];
    }
}
