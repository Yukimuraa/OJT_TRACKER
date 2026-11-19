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
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('student_id');
            $table->json('working_days')->nullable()->after('hours_per_day');
            $table->string('program', 150)->nullable()->after('working_days');
            $table->string('year_level', 50)->nullable()->after('program');
            $table->string('school_department', 150)->nullable()->after('year_level');
            $table->string('company_name', 255)->nullable()->after('company_id');
            $table->text('company_address')->nullable()->after('company_name');
            $table->string('company_department', 150)->nullable()->after('company_address');
            $table->string('supervisor_name', 150)->nullable()->after('company_department');
            $table->string('supervisor_email', 150)->nullable()->after('supervisor_name');
            $table->string('internship_role', 150)->nullable()->after('supervisor_email');
            $table->date('target_end_date')->nullable()->after('internship_role');
            $table->boolean('onboarding_completed')->default(false)->after('target_end_date');
            $table->unsignedTinyInteger('onboarding_step')->default(0)->after('onboarding_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'start_date',
                'working_days',
                'program',
                'year_level',
                'school_department',
                'company_name',
                'company_address',
                'company_department',
                'supervisor_name',
                'supervisor_email',
                'internship_role',
                'target_end_date',
                'onboarding_completed',
                'onboarding_step',
            ]);
        });
    }
};
