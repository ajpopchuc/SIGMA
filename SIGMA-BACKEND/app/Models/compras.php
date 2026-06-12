<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class compras extends Model 
{
    protected $table = 'compras';
    protected $fillable = [
        'id_proveedor',
        'id_usuario',
        'id_presupuesto',
        'total',
        'estado',
        'area',
        'fecha_factura',
        'no_factura',
        'serie_factura',
        'otras_compras'
    ];

    
}

