<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Facture {{ $invoiceNumber }} — Éveline Skincare</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 24px; color: #1a1a1e; font-size: 14px; line-height: 1.45; }
        .invoice-page { max-width: 800px; margin: 0 auto; }

        /* En-tête */
        .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid #C5A059; margin-bottom: 28px; }
        .company-block { flex: 1; }
        .company-name { font-size: 22px; font-weight: 700; color: #1a1a1e; margin: 0 0 8px 0; letter-spacing: 0.02em; }
        .company-details { font-size: 12px; color: #555; margin: 0; }
        .company-details span { display: block; margin-top: 2px; }
        .invoice-meta-block { text-align: right; }
        .invoice-title { font-size: 28px; font-weight: 700; color: #C5A059; margin: 0 0 16px 0; letter-spacing: 0.05em; }
        .invoice-meta { font-size: 13px; color: #333; margin: 0; }
        .invoice-meta .row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 4px; }
        .invoice-meta .label { font-weight: 600; color: #555; min-width: 140px; text-align: right; }
        .invoice-meta .value { color: #1a1a1e; }

        /* Blocs client et livraison */
        .two-cols { display: flex; gap: 32px; margin-bottom: 28px; }
        .col { flex: 1; padding: 16px; background: #f8f7f5; border-radius: 10px; border: 1px solid #ebe8e4; }
        .col-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #C5A059; margin: 0 0 10px 0; }
        .col p { margin: 0 0 4px 0; font-size: 13px; color: #333; }
        .col p strong { color: #1a1a1e; }

        /* Tableau des articles */
        .table-wrap { margin: 28px 0; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        thead th { background: #1a1a1e; color: #fff; text-align: left; padding: 12px 14px; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
        thead th:nth-child(4), thead th:nth-child(5), thead th:nth-child(6) { text-align: right; }
        tbody td { padding: 12px 14px; border-bottom: 1px solid #ebe8e4; vertical-align: top; }
        tbody td:nth-child(4), tbody td:nth-child(5), tbody td:nth-child(6) { text-align: right; }
        tbody tr:last-child td { border-bottom: 2px solid #C5A059; }
        .ref-cell { font-size: 12px; color: #666; }

        /* Totaux */
        .totals-wrap { margin-top: 24px; display: flex; justify-content: flex-end; }
        .totals { width: 320px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
        .totals-row.grand-total { font-size: 16px; font-weight: 700; border-top: 2px solid #C5A059; margin-top: 10px; padding-top: 12px; color: #1a1a1e; }

        /* Conditions et pied de page */
        .conditions { margin-top: 36px; padding: 16px; background: #f8f7f5; border-radius: 10px; font-size: 11px; color: #666; line-height: 1.5; }
        .conditions strong { color: #333; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #ebe8e4; font-size: 11px; color: #888; text-align: center; }
        .footer p { margin: 4px 0; }
        .footer .highlight { color: #C5A059; font-weight: 600; }

        .print-btn { margin-bottom: 20px; padding: 12px 24px; background: #C5A059; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
        .print-btn:hover { background: #b08d4a; }
        @media print { .print-btn { display: none; } body { padding: 16px; } }
    </style>
</head>
<body>
    <div class="invoice-page">
        <button class="print-btn" type="button" onclick="window.print()">Imprimer / Enregistrer en PDF</button>

        <header class="invoice-header">
            <div class="company-block">
                <h1 class="company-name">ÉVELINE SKINCARE</h1>
                <div class="company-details">
                    <span>www.evelinecosmetics.ma</span>
                    <span>contact@evelinecosmetics.ma</span>
                    <span>support@evelinecosmetics.ma · info@evelinecosmetics.ma</span>
                </div>
            </div>
            <div class="invoice-meta-block">
                <h2 class="invoice-title">FACTURE</h2>
                <div class="invoice-meta">
                    <div class="row"><span class="label">N° facture :</span><span class="value">{{ $invoiceNumber }}</span></div>
                    <div class="row"><span class="label">Date de facture :</span><span class="value">{{ $invoiceDate }}</span></div>
                    <div class="row"><span class="label">Date de commande :</span><span class="value">{{ $orderDate }}</span></div>
                    <div class="row"><span class="label">Statut :</span><span class="value">{{ $statusLabel }}</span></div>
                    <div class="row"><span class="label">Mode de paiement :</span><span class="value">{{ $paymentLabel }}</span></div>
                    @if($order->transaction_id ?? null)
                    <div class="row"><span class="label">Réf. transaction :</span><span class="value">{{ $order->transaction_id }}</span></div>
                    @endif
                </div>
            </div>
        </header>

        <div class="two-cols">
            <div class="col">
                <p class="col-title">Facturer à</p>
                @if($order->user)
                <p><strong>{{ trim(($order->user->first_name ?? '') . ' ' . ($order->user->last_name ?? '')) ?: '—' }}</strong></p>
                <p>{{ $order->user->email ?? '—' }}</p>
                <p>{{ $order->user->phone ?? '—' }}</p>
                @else
                <p>—</p>
                @endif
            </div>
            <div class="col">
                <p class="col-title">Adresse de livraison</p>
                @if($order->address)
                <p><strong>{{ $order->address->full_name }}</strong></p>
                <p>{{ $order->address->phone ?? '—' }}</p>
                <p>{{ $order->address->address_line }}</p>
                <p>{{ $order->address->postal_code }} {{ $order->address->city }}</p>
                <p>{{ $order->address->country }}</p>
                @else
                <p>—</p>
                @endif
            </div>
        </div>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Désignation</th>
                        <th>Réf.</th>
                        <th>Prix unit. MAD</th>
                        <th>Qté</th>
                        <th>Total MAD</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $item->product?->name ?? 'Produit' }}</td>
                        <td class="ref-cell">{{ $item->product?->sku ?? '—' }}</td>
                        <td>{{ number_format((float) $item->price, 2, ',', ' ') }}</td>
                        <td>{{ $item->quantity }}</td>
                        <td>{{ number_format((float) $item->price * $item->quantity, 2, ',', ' ') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="totals-wrap">
            <div class="totals">
                <div class="totals-row">
                    <span>Sous-total HT</span>
                    <span>{{ number_format((float) ($order->total_amount ?? 0), 2, ',', ' ') }} MAD</span>
                </div>
                <div class="totals-row">
                    <span>Livraison</span>
                    <span>0,00 MAD</span>
                </div>
                <div class="totals-row grand-total">
                    <span>TOTAL TTC</span>
                    <span>{{ number_format((float) ($order->total_amount ?? 0), 2, ',', ' ') }} MAD</span>
                </div>
            </div>
        </div>

        <div class="conditions">
            <strong>Conditions :</strong> Paiement à la commande. Les prix sont indiqués en MAD TTC. En cas de retard de paiement, des pénalités pourront être appliquées.
        </div>

        <footer class="footer">
            <p>Facture émise le <strong>{{ $printedAt }}</strong></p>
            <p>Merci pour votre confiance.</p>
            <p><span class="highlight">www.evelinecosmetics.ma</span> — contact@evelinecosmetics.ma · support@evelinecosmetics.ma · info@evelinecosmetics.ma</p>
        </footer>
    </div>
</body>
</html>
