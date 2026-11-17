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
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->string('student_id');
            $table->unsignedInteger('required_hours')->default(600);
            $table->decimal('hours_per_day', 4, 2)->default(8.00);
            $table->boolean('morning_enabled')->default(true);
            $table->time('morning_start')->nullable();
            $table->time('morning_end')->nullable();
            $table->boolean('afternoon_enabled')->default(true);
            $table->time('afternoon_start')->nullable();
            $table->time('afternoon_end')->nullable();
            $table->time('lunch_start')->nullable();
            $table->time('lunch_end')->nullable();
            $table->timestamps();

            // Student ID is unique within each school
            $table->unique(['school_id', 'student_id']);
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
