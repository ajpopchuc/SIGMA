<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class activos extends Model 
{
    protected $table = 'activos';
    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'precio',
        'fecha_adquisicion',
        'id_instalacion',
        'estado'
    ];

    public function instalacion()
    {
        return $this->belongsTo(instalaciones::class, 'id_instalacion'); 
    }
}

