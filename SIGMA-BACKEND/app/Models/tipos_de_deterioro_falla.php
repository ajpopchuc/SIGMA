<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class tipos_de_deterioro_falla extends Model
{
    protected $table = 'tipos_de_deterioro_falla'; // si es necesario
    protected $fillable = ['deteriorio_o_falla', 'created_at', 'updated_at']; // ajusta según tus columnas
    public function inspecciones_deterioro_fallas()
    {
        return $this->hasMany(inspecciones_deterioro_fallas::class, 'id_tipo_deteriorio_falla'); 
    }
}