<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\Meme;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class NewCommentNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly User $actor,
        public readonly Meme $meme,
        public readonly Comment $comment,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'kind'           => 'comment',
            'actor_id'       => $this->actor->id,
            'actor_name'     => $this->actor->name,
            'actor_username' => $this->actor->username,
            'actor_avatar'   => $this->actor->avatar,
            'meme_id'        => $this->meme->id,
            'meme_slug'      => $this->meme->slug,
            'meme_image'     => $this->meme->image_url,
            'comment_id'     => $this->comment->id,
            'message'        => Str::limit($this->comment->body, 80),
        ];
    }
}
