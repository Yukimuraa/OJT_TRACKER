<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Safely add workflow status column to existing problem_reports table
     * while preserving all existing submitted reports.
     */
    public function up(): void
    {
        Schema::table('problem_reports', function (Blueprint $table) {
            $table->string('status', 30)->default('Pending')->after('email');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('problem_reports', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn('status');
        });
    }
};
