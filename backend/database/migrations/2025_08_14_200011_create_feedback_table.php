<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', [
                'Bug Report',
                'Feature Request',
                'General Feedback',
                'UI/UX Suggestion',
                'Other',
            ])->default('General Feedback');
            $table->text('message');
            $table->unsignedTinyInteger('rating')->nullable(); // 1–5 stars
            $table->enum('status', ['new', 'in_review', 'resolved'])->default('new');
            $table->timestamps();

            $table->index('status');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
