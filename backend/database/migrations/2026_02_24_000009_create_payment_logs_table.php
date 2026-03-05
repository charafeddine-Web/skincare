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
        Schema::create('payment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->enum('action', ['initiated', 'authorized', 'captured', 'failed', 'refunded', 'cancelled', 'webhook'])->default('initiated');
            $table->string('status');
            $table->text('request')->nullable();
            $table->text('response')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index('payment_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_logs');
    }
};

