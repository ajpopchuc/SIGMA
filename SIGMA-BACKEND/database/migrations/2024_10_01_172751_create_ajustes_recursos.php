<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAjustesRecursos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ajustes_recursos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_recurso');
            $table->integer('cantidad'); //cantidad de recursos a ajustar
            $table->string('tipo', 45); //tipo de ajuste Agregar o Quitar
            $table->string('motivo', 1000); //motivo del ajuste
            $table->timestamps();
            //id
            $table->foreign('id_recurso')->references('id')->on('recursos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ajustes_recursos');
    }
}
