<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture #{{ $order->id }}</title>
    <style>
        body { font-family: sans-serif; padding: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #C5A059; padding-bottom: 10px; }
        .logo { font-size: 24px; font-weight: bold; color: #1A1A1E; }
        .invoice-info { text-align: right; }
        .details { margin-top: 30px; display: flex; justify-content: space-between; }
        .table { width: 100%; margin-top: 30px; border-collapse: collapse; }
        .table th { background: #F7F3EF; text-align: left; padding: 10px; border-bottom: 2px solid #EFE9E3; }
        .table td { padding: 10px; border-bottom: 1px solid #EFE9E3; }
        .totals { float: right; margin-top: 20px; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .bold { font-weight: bold; }
        .footer { margin-top: 50px; font-size: 10px; color: #A8A09A; text-align: center; }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()" style="margin-bottom: 20px; padding: 10px; background: #C5A059; color: white; border: none; border-radius: 5px; cursor: pointer;">Imprimer / Sauvegarder PDF</button>

    <div class="header">
        <div class="logo">ÉVELINE SKINCARE</div>
        <div class="invoice-info">
            <h1 style="margin: 0; color: #C5A059;">FACTURE</h1>
            <p>N° #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</p>
            <p>Date: {{ $order->created_at->format('d/m/Y') }}</p>
        </div>
    </div>

    <div class="details">
        <div class="billing">
            <h4 style="margin-bottom: 5px;">Client:</h4>
            <p style="margin: 2px 0;">{{ $order->user->first_name }} {{ $order->user->last_name }}</p>
            <p style="margin: 2px 0;">{{ $order->user->email }}</p>
            <p style="margin: 2px 0;">{{ $order->user->phone }}</p>
        </div>
        <div class="shipping" style="text-align: right;">
            <h4 style="margin-bottom: 5px;">Adresse de livraison:</h4>
            <p style="margin: 2px 0;">{{ $order->address->first_name }} {{ $order->address->last_name }}</p>
            <p style="margin: 2px 0;">{{ $order->address->address }}</p>
            <p style="margin: 2px 0;">{{ $order->address->city }}, {{ $order->address->postal_code }}</p>
            <p style="margin: 2px 0;">{{ $order->address->country }}</p>
        </div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Produit</th>
                <th>Prix Unitaire</th>
                <th>Quantité</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>{{ number_format($item->unit_price, 2) }} DH</td>
                <td>{{ $item->quantity }}</td>
                <td style="text-align: right;">{{ number_format($item->total_price, 2) }} DH</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span>Sous-total:</span>
            <span>{{ number_format($order->total_amount, 2) }} DH</span>
        </div>
        <div class="totals-row">
            <span>Livraison ({{ $order->shippingMethod->name ?? 'Standard' }}):</span>
            <span>0.00 DH</span> <!-- Shipping cost should be included in order if implemented -->
        </div>
        <div class="totals-row bold" style="font-size: 1.2rem; border-top: 2px solid #C5A059; margin-top: 10px; padding-top: 10px;">
            <span>TOTAL:</span>
            <span>{{ number_format($order->total_amount, 2) }} DH</span>
        </div>
    </div>

    <div style="clear: both;"></div>

    <div class="footer">
        <p>Merci pour votre confiance chez Éveline Skincare.</p>
        <p>Site web : www.evelineskincare.ma | Email : contact@evelineskincare.ma</p>
    </div>
</body>
</html>
