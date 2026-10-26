<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Add Chortle's custom reaction types (fire 🔥, laugh 😂, skull 💀, heart ❤️)
 * while keeping the legacy Facebook-style types for backwards compatibility.
 *
 * Run: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE reactions
            MODIFY COLUMN type
            ENUM('like','love','haha','wow','sad','angry','fire','laugh','skull','heart')
            NOT NULL DEFAULT 'fire'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE reactions
            MODIFY COLUMN type
            ENUM('like','love','haha','wow','sad','angry')
            NOT NULL DEFAULT 'like'
        ");
    }
};
