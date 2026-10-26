<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemeView extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'meme_id',
        'user_id',
        'ip_address',
        'user_agent',
        'session_id',
        'viewed_at',
    ];

    protected function casts(): array
    {
        return [
            'viewed_at' => 'datetime',
        ];
    }

    public function meme()
    {
        return $this->belongsTo(Meme::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
