<?php

return [
    /*
    | Seuil (€) au-delà duquel la livraison est gratuite
    */
    'free_shipping_threshold' => (float) env('SHIPPING_FREE_THRESHOLD', 60),

    /*
    | Frais de livraison par défaut (€) si sous le seuil.
    | Peut être surchargé par le premier mode de livraison actif en base.
    */
    'default_fee' => (float) env('SHIPPING_DEFAULT_FEE', 5.90),
];
