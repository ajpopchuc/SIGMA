<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ajustesRecursos extends Model 
{
    protected $table = 'ajustes_recursos'; // Nombre de la tabla

    protected $fillable = [
        'id_recurso',
        'cantidad',
        'tipo',
        'motivo',
    ];

    public function recurso()
    {
        return $this->belongsTo(recursos::class, 'id_recurso', 'id');
    }

}
