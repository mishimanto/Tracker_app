<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_expense_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('expense_categories');
            $table->decimal('amount', 10, 2);
            $table->string('description');
            $table->enum('payment_method', ['cash', 'card', 'bank', 'mobile'])->default('cash');
            $table->text('notes')->nullable();
            $table->enum('frequency', ['weekly', 'monthly'])->default('monthly');
            $table->unsignedTinyInteger('interval')->default(1);
            $table->date('start_date');
            $table->date('next_run_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'is_active', 'next_run_date'], 'ret_user_active_next_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_expense_templates');
    }
};
