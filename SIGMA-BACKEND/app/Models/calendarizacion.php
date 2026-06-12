<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class calendarizacion extends Model
{
    protected $table = 'calendarizacion';

    protected $fillable = [
        'fecha_inicio',
        'fecha_final',
        'es_recurrente',
        'tiempo_recurrencia',
        'observaciones',
        'tipo_actividad',
        'id_usuario',
        'estado',
        'id_inspeccion',
        'id_mantenimiento',
        'id_supervision',
        'pasoActividad'
    ];

    public $timestamps = true;
}
