<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meme extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'caption',
        'slug',
        'image_url',
        'views_count',
        'category',
        'tags',
        'status',
        'allow_comments',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'views_count' => 'integer',
            'is_featured' => 'string',
            'allow_comments' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function views()
    {
        return $this->hasMany(MemeView::class);
    }

    public function savedBy()
    {
        return $this->hasMany(SavedMeme::class);
    }

    public function reactions()
    {
        return $this->morphMany(\App\Models\Reaction::class, 'reactable');
    }

    public function reports()
    {
        return $this->hasMany(\App\Models\Report::class);
    }
}
