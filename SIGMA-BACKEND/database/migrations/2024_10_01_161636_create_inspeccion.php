<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInspeccion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inspecciones', function (Blueprint $table) {
            $table->id();
            $table->date('fecha_inspeccion')->nullable(); // Fecha programada para el mantenimiento
            $table->unsignedBigInteger('id_instalacion')->nullable();
            $table->unsignedBigInteger('id_usuario');
            $table->string('id_activos',150)->nullable(); //1, 4, 5, 18
            $table->string('tipo',150)->nullable();
            $table->integer('cantidad_inspeccion')->unsigned()->nullable();
            $table->string('unidad_medida', 100)->nullable();
            $table->string('motivo',100)->nullable(); //Inspección periódica (preventiva) Solicitud de Mantenimiento (Correctivo)
            //Si es solicitud de mantenimiento habilitar boton para generar calendarizacion de mantenimiento
            $table->string('descripcion', 300)->nullable();
            $table->string('condicion_general', 100)->nullable(); //Aceptable, Regular, Deficiente
            $table->string('intervencion_requerida',100)->nullable(); //Ninguna, Reparación, Limpeza, Sustitución
            $table->string('plazo_intervencion',100)->nullable(); //Plazo Intervención: Ninguno, Programable, Urgente
            $table->string('plazo',100)->nullable(); //Plazo de intervención
            $table->string('tiempo_ejecucion',100)->nullable(); //Tiempo de ejecución
            $table->string('observaciones', 300)->nullable();
            $table->unsignedBigInteger('id_calendario');
            $table->string('tipo_inspeccion', 50)->nullable(); //Infraestructura o Equipos
            $table->string('estado', 45)->default('Realizado'); // Estado del mantenimiento
            $table->timestamps();


            //idcampus idusuario
            
            $table->foreign('id_instalacion')
            ->references('id')
            ->on('instalaciones')
            ->onDelete('cascade');

            $table->foreign('id_usuario')
            ->references('id')
            ->on('usuarios')
            ->onDelete('cascade');

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
        Schema::dropIfExists('inspecciones');
    }
}
