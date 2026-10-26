
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meme_views', function (Blueprint $table) {
            $table->id();

            $table->foreignId('meme_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->string('session_id')->nullable();

            $table->timestamp('viewed_at')->useCurrent();

            $table->index(['meme_id', 'user_id']);
            $table->index(['meme_id', 'ip_address']);
            $table->index(['meme_id', 'session_id']);
            $table->index('viewed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meme_views');
    }
};
