<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Make student_id nullable so Student ID is optional during registration
     * and can be completed or updated later in Profile Settings without
     * inventing placeholder IDs or violating the (school_id, student_id) unique index.
     */
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('student_id', 50)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('student_id', 50)->nullable(false)->change();
        });
    }
};
