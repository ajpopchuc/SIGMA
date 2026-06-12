<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRecursosTable extends Migration
{
    public function up()
    {
        Schema::create('recursos', function (Blueprint $table) {
            $table->id('id');

            // Campos solicitados
            $table->string('codigo', 100)->nullable(); // Código del recurso
            $table->string('nombre', 100); // Nombre del recurso
            $table->string('area', 100); // area del recurso
            $table->string('descripcion', 300)->nullable(); // Descripción del recurso
            $table->integer('existencias'); // Número de existencias o stock
            $table->integer('existencias_minimas'); // Número de existencias o stock
            $table->integer('existencias_maximas'); // Número de existencias o stock
            $table->decimal('precio'); // Número de existencias o stock
            $table->string('estado', 45)->default('Activo'); // Estado del recurso

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('recursos');
    }
}
