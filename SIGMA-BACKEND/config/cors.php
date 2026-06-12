<?php

return [
    'paths' => ['*'],  // Permitir todas las rutas
    'allowed_methods' => ['*'],  // Permitir todos los métodos
    'allowed_origins' => ['*'],  // Permitir todos los orígenes
    'allowed_origins_patterns' => [],  // No es necesario configurar patrones
    'allowed_headers' => ['*'],  // Permitir todos los encabezados
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,  // Asegúrate de que sea false si usas '*'
];
