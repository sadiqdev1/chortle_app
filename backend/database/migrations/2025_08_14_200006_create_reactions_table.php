<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('reactable'); // reactable_type + reactable_id (Meme or Comment)
            $table->enum('type', ['like', 'love', 'haha', 'wow', 'sad', 'angry'])->default('like');
            $table->timestamps();

            // One reaction per user per reactable
            $table->unique(['user_id', 'reactable_type', 'reactable_id']);
            $table->index('reactable_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};
