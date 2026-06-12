<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class recursos extends Model
{
    protected $table = 'recursos';

    protected $fillable = [
        'codigo',
        'nombre',
        'area',
        'descripcion',
        'existencias',
        'existencias_minimas',
        'existencias_maximas',
        'precio',
        'estado',
    ];

    public $timestamps = true;
}
