<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class supervision extends Model 
{
    protected $table = 'supervision';
    protected $fillable = [
        'descripcion',
        'resumen_actividad',
        'observaciones',
        'tiempo_ejecucion',
        'lugar_mantenimiento',
        'id_mantenimiento',
        'id_calendario',
        'id_usuario'
    ];

     // Relación con el modelo Mantenimiento
     public function mantenimientos()
     {
        return $this->belongsTo(mantenimientos::class, 'id_mantenimiento');  // Ajusta los nombres si es necesario
     }
 
     // Relación con el modelo User
     public function usuarios()
    {
        return $this->belongsTo(usuarios::class, 'id_usuario'); 
    }

}

