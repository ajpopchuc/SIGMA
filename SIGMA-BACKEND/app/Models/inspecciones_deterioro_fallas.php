<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class inspecciones_deterioro_fallas extends Model
{
    protected $table = 'inspecciones_deterioro_fallas';

    protected $fillable = [
        'id_tipo_deteriorio_falla', // asegúrate de incluir esta columna en la tabla
        'condicion_general',
        'porcentaje_deterioro',
        'observaciones',
        'id_inspeccion',
    ];

    public function inspecciones()
    {
        return $this->belongsTo(inspecciones::class, 'id_inspeccion');
    }

    public function tipos_de_deterioro_falla()
    {
        return $this->belongsTo(tipos_de_deterioro_falla::class, 'id_tipo_deteriorio_falla');
    }
}
