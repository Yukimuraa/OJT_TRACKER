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
        Schema::table('dttr_templates', function (Blueprint $table) {
            $table->string('file_name')->nullable()->after('file_path');
            $table->unsignedInteger('file_size_kb')->nullable()->after('file_name');
            $table->json('field_map')->nullable()->after('file_size_kb');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dttr_templates', function (Blueprint $table) {
            $table->dropColumn(['file_name', 'file_size_kb', 'field_map']);
        });
    }
};
