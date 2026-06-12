<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ajustesPresupuesto extends Model 
{
    protected $table = 'ajustes_presupuestos'; // Nombre de la tabla

    protected $fillable = [
        'id_presupuesto',
        'cantidad',
        'tipo',
        'motivo',
    ];

}
