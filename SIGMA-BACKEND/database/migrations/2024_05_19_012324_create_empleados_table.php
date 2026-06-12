<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmpleadosTable extends Migration
{
    public function up()
    {
        Schema::create('empleados', function (Blueprint $table) {
            $table->id('id');
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('correo_electronico', 100);
            $table->unsignedBigInteger(column: 'id_usuario');
            $table->string('estado', 45)->default('Activo');
            $table->timestamps();

            $table->foreign('id_usuario')
            ->references('id')
            ->on('usuarios')
            ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('empleados');
    }
}