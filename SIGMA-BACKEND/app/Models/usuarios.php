<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class usuarios extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;
    protected $table = 'usuarios';
    protected $fillable = [
        'usuario',
        'contraseña',
        'estado',
        'id_rol',
    ];

    public function getAuthPassword()
    {
        return $this->contraseña;
    }

    public function rol()
    {
        return $this->belongsTo(roles::class, 'id_rol');
    }
}