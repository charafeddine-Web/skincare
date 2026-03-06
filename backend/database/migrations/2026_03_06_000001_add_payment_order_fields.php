<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add currency to orders and allow 'failed' status.
     * Payments table already has order_id, amount, status, transaction_id, cmi_response (response_data).
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'currency')) {
                $table->string('currency', 3)->default('MAD')->after('total_amount');
            }
        });

        // Add 'failed' to order status for payment failure handling
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            Schema::getConnection()->statement(
                "ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'paid', 'failed', 'cancelled') DEFAULT 'pending'"
            );
        }
        if ($driver === 'pgsql') {
            // Laravel may create enum as varchar with check; try common constraint name
            try {
                Schema::getConnection()->statement(
                    "ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check"
                );
            } catch (\Throwable $e) {
                // ignore if constraint name differs
            }
            Schema::getConnection()->statement(
                "ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status::text = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'cancelled'::text]))"
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'currency')) {
                $table->dropColumn('currency');
            }
        });
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'pgsql') {
            try {
                Schema::getConnection()->statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
                Schema::getConnection()->statement(
                    "ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status::text = ANY (ARRAY['pending'::text, 'paid'::text, 'cancelled'::text]))"
                );
            } catch (\Throwable $e) {
                //
            }
        }
        if ($driver === 'mysql') {
            Schema::getConnection()->statement(
                "ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending'"
            );
        }
    }
};
