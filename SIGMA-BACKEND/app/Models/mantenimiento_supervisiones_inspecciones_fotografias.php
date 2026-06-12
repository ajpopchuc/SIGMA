<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class mantenimiento_supervisiones_inspecciones_fotografias extends Model
{

    protected $table = 'mantenimiento_supervisiones_inspecciones_fotografias';

    protected $fillable = [
        'id_mantenimiento_supervision_inspeccion',
        'tipo',
        'url',
    ];

}