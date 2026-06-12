<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMantenimientosDetalle extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('mantenimientos_detalle', function (Blueprint $table) {
            $table->id();
            $table->string('codigo',100);
            $table->string('material_o_servicio',100); //Si es material llenar abajo el id
            $table->unsignedBigInteger('id_recurso')->nullable();
            $table->integer('cantidad')->unsigned();
            $table->string('unidad',80);
            $table->decimal('precio_unitario',10,2);
            $table->decimal('total', 10,2);
            $table->unsignedBigInteger('id_mantenimiento');
            $table->timestamps();

            //ids
            $table->foreign('id_recurso')->references('id')->on('recursos')->onDelete('cascade');
            $table->foreign('id_mantenimiento','fk_mantenimiento_id')->references('id')->on('mantenimientos')->onDelete('cascade');            
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('mantenimientos_detalle');
    }
}
