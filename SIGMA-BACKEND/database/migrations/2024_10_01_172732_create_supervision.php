<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSupervision extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('supervision', function (Blueprint $table) {
            $table->id();
            $table->string('descripcion', 300);
            $table->string('resumen_actividad', 100); //Aceptable, Regular, Deficiente, Deficiente calendarizado
            $table->string('observaciones', 300)->nullable();
            $table->string('tiempo_ejecucion',100);
            $table->string('lugar_mantenimiento', 50); //Infraestructura o Equipos
            $table->unsignedBigInteger('id_mantenimiento');
            $table->unsignedBigInteger('id_calendario');
            $table->unsignedBigInteger('id_usuario');
            $table->timestamps();

            //id
            $table->foreign('id_mantenimiento')->references('id')->on('mantenimientos')->onDelete('cascade');
            $table->foreign('id_calendario')->references('id')->on('calendarizacion')->onDelete('cascade');
            $table->foreign('id_usuario')->references('id')->on('usuarios')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('supervision');
    }
}
