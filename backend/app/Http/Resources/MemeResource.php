<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'caption'        => $this->caption,
            'slug'           => $this->slug,
            'image_url'      => $this->image_url,
            'category'       => $this->category,
            'tags'           => $this->tags ?? [],
            'views_count'    => (int) ($this->views_count ?? 0),
            'allow_comments' => (bool) $this->allow_comments,
            'status'         => $this->status,
            'created_at'     => $this->created_at?->toISOString(),

            
            // Engagement
            'comments_count' => (int) ($this->comments_count ?? 0),
            'reactions'      => $this->getAttribute('reaction_counts') ?? [],
            'my_reaction'    => $this->getAttribute('my_reaction'),
            'isBookmarked'   => (bool) (
                $this->getAttribute('isBookmarked') ?? false
            ),


            // Author — included when the relationship is loaded.
            'user' => new UserResource(
                $this->whenLoaded('user')
            ),
        ];
    }
}
