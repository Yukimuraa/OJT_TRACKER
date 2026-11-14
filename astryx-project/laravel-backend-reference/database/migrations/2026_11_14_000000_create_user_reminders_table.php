<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Table: user_reminders
     */
    public function up(): void
    {
        Schema::create('user_reminders', function (Blueprint $table) {
            $table->id();
            // Foreign key referencing the authenticated student user
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            
            // Daily reminder active status
            $table->boolean('reminders_enabled')->default(false);
            
            // 24-hour format time string (default: 5:00 PM)
            $table->string('reminder_time', 5)->default('17:00');
            
            // User local IANA timezone
            $table->string('timezone', 64)->default('Asia/Manila');
            
            // Date of the last dispatched reminder to avoid duplicates on the same day
            $table->date('last_notified_date')->nullable();
            
            // Web Push Subscription endpoint and crypto keys
            $table->json('push_subscription')->nullable();
            
            $table->timestamps();

            // Strict uniqueness: exactly one reminder config per user
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_reminders');
    }
};

