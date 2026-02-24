<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'transaction_id',
        'reference',
        'amount',
        'currency',
        'status',
        'payment_method',
        'card_brand',
        'card_last4',
        'response_code',
        'response_message',
        'cmi_response',
        'authorized_at',
        'captured_at',
        'failed_at',
        'ip_address',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'authorized_at' => 'datetime',
        'captured_at' => 'datetime',
        'failed_at' => 'datetime',
        'cmi_response' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relations
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function logs()
    {
        return $this->hasMany(PaymentLog::class);
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSuccessful($query)
    {
        return $query->whereIn('status', ['authorized', 'captured']);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeRefunded($query)
    {
        return $query->where('status', 'refunded');
    }

    /**
     * Accessors
     */
    public function getIsSuccessfulAttribute()
    {
        return in_array($this->status, ['authorized', 'captured']);
    }

    public function getIsFailedAttribute()
    {
        return $this->status === 'failed';
    }

    public function getIsPendingAttribute()
    {
        return $this->status === 'pending';
    }

    /**
     * Generate unique payment reference
     */
    public static function generateReference()
    {
        return 'PAY-' . strtoupper(uniqid()) . '-' . time();
    }
}

