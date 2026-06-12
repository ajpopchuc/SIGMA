<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateActivosTable extends Migration
{
    public function up()
    {
        Schema::create('activos', function (Blueprint $table) {
            $table->id('id');
            // Campos para los activos
            $table->string('nombre', 100); // Nombre del activo (e.g. "Televisión", "Escalera")
            $table->string('codigo', 45); // Código del activo (e.g. "TV-001", "ES-001")
            $table->string('descripcion', 300)->nullable();
            $table->decimal('precio', 10, 2); // Precio del activo
            $table->date('fecha_adquisicion'); // Fecha de adquisición del activo
            $table->unsignedBigInteger(column: 'id_instalacion');
            $table->string('estado', 45)->default('Activo'); // Estado del recurso
            $table->timestamps();

            $table->foreign('id_instalacion')
                  ->references('id')
                  ->on('instalaciones')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('activos');
    }
}
