<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedMeme extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'meme_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function meme()
    {
        return $this->belongsTo(Meme::class);
    }
}
