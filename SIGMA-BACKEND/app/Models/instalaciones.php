<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class instalaciones extends Model 
{
    protected $table = 'instalaciones';
    protected $fillable = [
        'nombre',
        'descripcion',
        'tipo_instalacion',
        'id_nivel',
        'estado',
    ];
    public function niveles()
    {
        return $this->belongsTo(niveles::class, 'id_nivel'); // Asegúrate de que el nombre del modelo sea correcto
    }

}

