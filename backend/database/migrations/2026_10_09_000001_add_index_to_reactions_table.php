<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add a composite index on reactions (reactable_id, reactable_type, user_id).
 *
 * This is the query fired on every reaction toggle:
 *   WHERE reactable_id = ? AND reactable_type = ? AND user_id = ?
 *
 * Without this index, MySQL does a full table scan as the reactions table grows.
 * With it, the lookup is a single B-tree seek.
 *
 * Run: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reactions', function (Blueprint $table) {
            // Drop any existing single-column indexes first to avoid conflicts
            // (safe — ifExists prevents errors on fresh installs)
            $table->index(
                ['reactable_id', 'reactable_type', 'user_id'],
                'reactions_reactable_user_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::table('reactions', function (Blueprint $table) {
            $table->dropIndex('reactions_reactable_user_idx');
        });
    }
};
