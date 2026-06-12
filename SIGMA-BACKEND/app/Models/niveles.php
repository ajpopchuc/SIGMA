<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class niveles extends Model 
{
    protected $table = 'niveles';
    protected $fillable = [
        'nombre',
        'descripcion',
        'id_edificio',
        'estado',
    ];
    // Change method name to 'edificio'
    public function edificio()
    {
        return $this->belongsTo(edificios::class, 'id_edificio'); 
    }
    public function instalaciones()
{
    return $this->hasMany(instalaciones::class, 'id_nivel');
}
}

