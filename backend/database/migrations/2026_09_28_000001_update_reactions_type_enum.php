<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Keep the original Facebook-style reaction names.
 * The frontend maps: 👍 like | ❤️ love | 😂 haha | 😮 wow | 😢 sad | 😡 angry
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE reactions
            MODIFY COLUMN type
            ENUM('like','love','haha','wow','sad','angry')
            NOT NULL DEFAULT 'like'
        ");
    }

    public function down(): void
    {
        // No-op — this is the canonical schema
    }
};
