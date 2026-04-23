<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('Task & Expense');
            $table->string('support_email')->nullable();
            $table->string('currency_code', 10)->default('BDT');
            $table->boolean('allow_registration')->default(true);
            $table->boolean('maintenance_mode')->default(false);
            $table->text('report_footer')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
