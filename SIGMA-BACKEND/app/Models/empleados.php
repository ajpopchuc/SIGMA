<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class empleados extends Model 
{
    protected $table = 'empleados';
    protected $fillable = [
        'nombre',
        'apellido',
        'correo_electronico',
        'id_usuario',
        'estado'
    ];
}