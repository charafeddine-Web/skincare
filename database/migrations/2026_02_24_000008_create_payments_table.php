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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id')->nullable()->unique();
            $table->string('reference')->unique();
            $table->decimal('amount', 12, 2);
            $table->string('currency')->default('MAD');
            $table->enum('status', ['pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->enum('payment_method', ['cmi', 'card'])->default('cmi');
            $table->string('card_brand')->nullable();
            $table->string('card_last4')->nullable();
            $table->string('response_code')->nullable();
            $table->text('response_message')->nullable();
            $table->text('cmi_response')->nullable(); // JSON response from CMI
            $table->timestamp('authorized_at')->nullable();
            $table->timestamp('captured_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->ip_address('ip_address')->nullable();
            $table->text('metadata')->nullable(); // JSON additional data
            $table->timestamps();

            // Indexes
            $table->index('order_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

