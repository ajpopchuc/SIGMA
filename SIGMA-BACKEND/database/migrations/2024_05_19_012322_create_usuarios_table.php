<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsuariosTable extends Migration
{
    public function up()
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id');
            $table->string('usuario', 45);
            $table->string('contraseña', 100);
            $table->unsignedBigInteger(column: 'id_rol');
            $table->string('estado', 45)->default('Activo');
            $table->timestamps();

            $table->foreign('id_rol')
            ->references('id')
            ->on('roles')
            ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('usuarios');
    }
}