<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class permisos extends Model 
{
    protected $table = 'permisos';
    protected $fillable = [
        'nombre',
        'modulo'
    ];
}