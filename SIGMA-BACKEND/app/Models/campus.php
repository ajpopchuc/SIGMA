<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class campus extends Model 
{
    protected $table = 'campus';
    protected $fillable = [
        'nombre',
        'descripcion',
        'estado',
    ];

    public function edificios()
    {
        return $this->hasMany(edificios::class, 'id_campus');
    }
}

