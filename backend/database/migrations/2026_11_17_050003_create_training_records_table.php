<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('training_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('training_date');
            $table->time('morning_arrival')->nullable();
            $table->time('morning_departure')->nullable();
            $table->time('afternoon_arrival')->nullable();
            $table->time('afternoon_departure')->nullable();
            $table->decimal('hours', 6, 2)->default(0.00);
            $table->string('activity_category', 100)->nullable();
            $table->text('description');
            $table->timestamp('client_updated_at')->nullable();
            $table->unsignedInteger('sync_version')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'training_date', 'deleted_at'], 'tr_user_date_del_unique');
            $table->index(['user_id', 'training_date']);
            $table->index('client_updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_records');
    }
};
