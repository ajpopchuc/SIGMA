<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class roles extends Model 
{
    protected $table = 'roles';
    protected $fillable = [
        'nombre'
    ];
}