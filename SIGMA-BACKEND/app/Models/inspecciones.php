<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class inspecciones extends Model
{
    protected $table = 'inspecciones';

    protected $fillable = [
        'fecha_inspeccion',
        'id_instalacion',
        'id_usuario',
        'id_activos',
        'tipo',
        'cantidad_inspeccion',
        'unidad_medida',
        'motivo',
        'descripcion',
        'condicion_general',
        'intervencion_requerida',
        'plazo_intervencion',
        'plazo',
        'tiempo_ejecucion',
        'observaciones',
        'id_calendario',
        'tipo_inspeccion',
        'estado'
    ];

    public function instalaciones()
    {
        return $this->belongsTo(instalaciones::class, 'id_instalacion');
    }

    public function usuarios()
    {
        return $this->belongsTo(usuarios::class, 'id_usuario');
    }

    public function inspecciones_deterioro_fallas()
    {
        return $this->hasMany(inspecciones_deterioro_fallas::class, 'id_inspeccion');
    }
}
