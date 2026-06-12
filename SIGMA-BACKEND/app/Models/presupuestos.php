<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class presupuestos extends Model
{
    protected $table = 'presupuestos';

    protected $fillable = [
        'monto_presupuesto',
        'presupuesto_ejecutado',
        'monto_pendiente',
        'fecha_inicio',
        'fecha_fin',
        'periodo',
        'area',
        'estado'
    ];
}
