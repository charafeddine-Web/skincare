<?php

namespace App\Events;

use App\Models\Payment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentSucceeded
{
    use Dispatchable, InteractsWithBroadcasting, SerializesModels;

    public Payment $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('payment.' . $this->payment->id);
    }

    public function broadcastAs()
    {
        return 'payment.succeeded';
    }
}

