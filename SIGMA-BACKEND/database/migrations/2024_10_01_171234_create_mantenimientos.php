<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMantenimientos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('mantenimientos', function (Blueprint $table) {
            $table->id();
            $table->date('fecha_mantenimiento')->nullable(); // Fecha cuando se realiza el mantenimiento
            $table->unsignedBigInteger('id_instalacion')->nullable();
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('id_activos',150)->nullable(); //1, 4, 5, 18
            $table->string('nivel_atendido',100)->nullable(); //Ninguno, Reparación, Limpeza, Sustitución
            $table->string('tipo',150)->nullable();
            $table->integer('cantidad_atendida')->unsigned()->nullable();
            $table->string('unidad_medida', 100)->nullable();
            $table->string('descripcion', 300)->nullable();
            $table->string('resumen_actividad', 100)->nullable(); //Aceptable, Regular, Deficiente
            $table->string('tiempo_ejecucion',100)->nullable(); 
            $table->string('monto_total',100)->nullable(); 
            $table->string('motivo_actividad',100)->nullable(); //Solicitud de Mantenimiento correctivo o Preventivo
            $table->string('observaciones', 300)->nullable();
            $table->unsignedBigInteger('id_calendario')->nullable();
            $table->string('tipo_mantenimiento', 50)->nullable(); //Preventivo, Correctivo
            $table->string('lugar_mantenimiento', 50)->nullable(); //Infraestructura o Equipos
            $table->tinyInteger('fue_supervisado')->default(0); //1: Activo, 0: Inactivo
            $table->string('estado', 45)->nullable(); // Estado del mantenimiento
            $table->timestamps();

            //ids
            $table->foreign('id_instalacion')->references('id')->on('instalaciones')->onDelete('cascade');
            $table->foreign('id_usuario')->references('id')->on('usuarios')->onDelete('cascade');  
            $table->foreign('id_calendario')->references('id')->on('calendarizacion')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('mantenimientos');
    }
}
