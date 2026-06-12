<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class edificios extends Model 
{
    protected $table = 'edificios';
    protected $fillable = [
        'nombre',
        'descripcion',
        'id_campus',
        'estado'
    ];
// En el modelo Edificios
public function campus()
{
    return $this->belongsTo(campus::class, 'id_campus'); // Asegúrate de que el nombre del modelo sea correcto
}
public function niveles()
{
    return $this->hasMany(niveles::class, 'id_edificio');
}
}

