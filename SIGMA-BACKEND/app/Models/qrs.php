<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class qrs extends Model 
{
    protected $table = 'qrs';
    protected $fillable = [
        'codigo_qr',
        'activo_id',
    ];
}

