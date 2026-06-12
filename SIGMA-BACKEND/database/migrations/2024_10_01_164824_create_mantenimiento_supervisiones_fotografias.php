<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMantenimientoSupervisionesFotografias extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('mantenimiento_supervisiones_inspecciones_fotografias', function (Blueprint $table) {
            $table->id();
            $table->integer('id_mantenimiento_supervision_inspeccion');
            $table->string('tipo',100); //mantenimiento, inspeccion, supervision
            $table->string('url', 300);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('mantenimiento_supervisiones_inspecciones_fotografias');
    }
}
