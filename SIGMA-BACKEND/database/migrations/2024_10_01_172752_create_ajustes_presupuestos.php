<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAjustesPresupuestos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ajustes_presupuestos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_presupuesto');
            $table->decimal('cantidad',10,2); //cantidad de recursos a ajustar
            $table->string('tipo', 45); //tipo de ajuste Agregar o Quitar
            $table->string('motivo', 1000); //motivo del ajuste
            $table->timestamps();
            //id
            $table->foreign('id_presupuesto')->references('id')->on('presupuestos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('logs');
    }
}
