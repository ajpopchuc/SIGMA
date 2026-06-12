<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class proveedores extends Model
{
    protected $table = 'proveedores';

    protected $fillable = [
        'nombre_proveedor',
        'nombre_persona_contacto',
        'correo_contacto',
        'pbx',
        'telefono_persona_contacto',
        'direccion',
        'descripcion',
        'tipo_proveedor',
        'estado'
    ];

    public $timestamps = true;
}