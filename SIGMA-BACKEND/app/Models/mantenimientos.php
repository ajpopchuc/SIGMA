<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class mantenimientos extends Model 
{
    protected $table = 'mantenimientos';
    protected $fillable = [
        'fecha_mantenimiento',
        'id_instalacion',
        'id_usuario',
        'id_activos',
        'nivel_atendido',
        'tipo',
        'cantidad_atendida',
        'unidad_medida',
        'descripcion',
        'resumen_actividad',
        'tiempo_ejecucion',
        'monto_total',
        'motivo_actividad',
        'observaciones',
        'id_calendario',
        'tipo_mantenimiento',
        'lugar_mantenimiento',
        'estado',
    ];

    public function instalaciones()
    {
        return $this->belongsTo(instalaciones::class, 'id_instalacion'); 
    }

    public function usuarios()
    {
        return $this->belongsTo(usuarios::class, 'id_usuario'); 
    }
}
