<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('caption', 200)->nullable();

            $table->string('slug', 220)->unique();

            $table->string('image_url')->nullable();

            $table->string('category', 50)->default('Funny');

            $table->unsignedBigInteger('views_count')->default(0);

            $table->json('tags')->nullable();

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
            ])->default('approved');

            $table->boolean('allow_comments')->default(true);

            $table->softDeletes();
            $table->timestamps();

            $table->index('status');
            $table->index('category');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memes');
    }
};
