<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds detailed product information fields for skincare products
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->text('active_ingredients')->nullable()->after('description');
            $table->text('inci_list')->nullable()->after('active_ingredients');
            $table->text('usage_instructions')->nullable()->after('inci_list');
            $table->enum('skin_type', ['sèche', 'grasse', 'mixte', 'sensible', 'normale'])->nullable()->after('usage_instructions');
            $table->enum('application_time', ['matin', 'soir', 'jour/nuit'])->nullable()->after('skin_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'active_ingredients',
                'inci_list',
                'usage_instructions',
                'skin_type',
                'application_time',
            ]);
        });
    }
};

