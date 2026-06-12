<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class detalle_compras extends Model 
{
    protected $table = 'detalle_compras';
    protected $fillable = [
        'id_recurso',
        'cantidad',
        'unidad_medida',
        'precio_unitario',
        'total',
        'id_compra',
    ];

    
}