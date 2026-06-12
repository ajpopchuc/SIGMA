<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCalendarizacionTable extends Migration
{
    public function up()
    {
        Schema::create('calendarizacion', function (Blueprint $table) {
            $table->id('id');
            $table->date('fecha_inicio'); // Fecha programada para el mantenimiento
            $table->date('fecha_final'); // Fecha programada para el mantenimiento
            $table->boolean('es_recurrente')->default(false); // Indica si el mantenimiento es recurrente
            $table->integer('tiempo_recurrencia')->nullable(); // Tiempo de recurrencia en meses (e.g., en dias)
            $table->text('observaciones')->nullable(); // Observaciones o notas adicionales sobre el mantenimiento
            $table->string('tipo_actividad', 40); // Tipo de mantenimiento (e.g., preventivo, correctivo)
            $table->unsignedBigInteger('id_usuario'); // Llave foránea a la tabla de usuarios
            $table->string('estado', 45)->default('Pendiente'); // Estado pendiente, en proceso, finalizado 
            $table->unsignedBigInteger('id_inspeccion')->nullable(); // Llave foránea a la tabla de inspeccion
            $table->unsignedBigInteger('id_mantenimiento')->nullable(); // Llave foránea a la tabla de mantenimiento
            $table->unsignedBigInteger('id_supervision')->nullable(); // Llave foránea a la tabla de supervision
            $table->integer('pasoActividad')->default(0); // Paso o etapa actual de la actividad
            $table->timestamps();

            $table->foreign('id_usuario')
                  ->references('id')
                  ->on('usuarios')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('calendarizacion');
    }
}
