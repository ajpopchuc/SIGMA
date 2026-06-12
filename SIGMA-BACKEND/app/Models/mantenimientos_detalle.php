<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class mantenimientos_detalle extends Model 
{
    protected $table = 'mantenimientos_detalle';
    protected $fillable = [
        'codigo',
        'material_o_servicio',
        'id_recurso',
        'cantidad',
        'unidad',
        'precio_unitario',
        'total',
        'id_mantenimiento',
    ];

    public function recursos()
    {
        return $this->belongsTo(recursos::class, 'id_recurso'); 
    }
}