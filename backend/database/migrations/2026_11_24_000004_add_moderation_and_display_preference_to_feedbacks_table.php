<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Safely extend feedbacks table with display preference and moderation columns.
     */
    public function up(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            if (! Schema::hasColumn('feedbacks', 'display_name_preference')) {
                $table->string('display_name_preference', 20)
                    ->default('anonymous')
                    ->after('comment');
            }

            if (! Schema::hasColumn('feedbacks', 'moderation_status')) {
                $table->string('moderation_status', 20)
                    ->default('Pending')
                    ->after('display_name_preference');
            }

            if (! Schema::hasColumn('feedbacks', 'moderated_by')) {
                $table->foreignId('moderated_by')
                    ->nullable()
                    ->after('moderation_status')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('feedbacks', 'moderated_at')) {
                $table->timestamp('moderated_at')
                    ->nullable()
                    ->after('moderated_by');
            }
        });

        Schema::table('feedbacks', function (Blueprint $table) {
            $table->index(['moderation_status', 'created_at'], 'feedbacks_moderation_created_idx');
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            try {
                DB::statement('ALTER TABLE feedbacks ADD CONSTRAINT feedbacks_rating_range CHECK (rating >= 1 AND rating <= 5)');
            } catch (\Throwable) {
                // Constraint may already exist or engine skips duplicate check names
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            try {
                DB::statement('ALTER TABLE feedbacks DROP CHECK feedbacks_rating_range');
            } catch (\Throwable) {
                // Ignore if check constraint does not exist
            }
        }

        Schema::table('feedbacks', function (Blueprint $table) {
            $table->dropIndex('feedbacks_moderation_created_idx');
            if (Schema::hasColumn('feedbacks', 'moderated_by')) {
                $table->dropConstrainedForeignId('moderated_by');
            }
            foreach (['moderated_at', 'moderation_status', 'display_name_preference'] as $column) {
                if (Schema::hasColumn('feedbacks', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
