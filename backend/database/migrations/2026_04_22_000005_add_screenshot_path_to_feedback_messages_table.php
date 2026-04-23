<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('feedback_messages', 'screenshot_path')) {
            Schema::table('feedback_messages', function (Blueprint $table) {
                $table->string('screenshot_path')->nullable()->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('feedback_messages', 'screenshot_path')) {
            Schema::table('feedback_messages', function (Blueprint $table) {
                $table->dropColumn('screenshot_path');
            });
        }
    }
};
