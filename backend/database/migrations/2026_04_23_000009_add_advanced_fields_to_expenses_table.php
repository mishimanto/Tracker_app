<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('recurring_template_id')
                ->nullable()
                ->after('category_id')
                ->constrained('recurring_expense_templates')
                ->nullOnDelete();
            $table->string('attachment_path')->nullable()->after('receipt_image');
            $table->string('attachment_name')->nullable()->after('attachment_path');
            $table->string('attachment_mime_type')->nullable()->after('attachment_name');
            $table->boolean('is_auto_generated')->default(false)->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('recurring_template_id');
            $table->dropColumn([
                'attachment_path',
                'attachment_name',
                'attachment_mime_type',
                'is_auto_generated',
            ]);
        });
    }
};
