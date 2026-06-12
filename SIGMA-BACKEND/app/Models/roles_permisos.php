<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class roles_permisos extends Model 
{
    protected $table = 'roles_permisos';
    protected $fillable = [
        'id_rol',
        'id_permiso',
    ];
}