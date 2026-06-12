<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInstalacionesTable extends Migration
{
    public function up()
    {
        Schema::create('instalaciones', function (Blueprint $table) {
            $table->id('id');
            $table->string('nombre', 100);
            $table->string('descripcion', 200)->nullable();
            $table->string('tipo_instalacion', 100);
            $table->unsignedBigInteger('id_nivel');
            $table->string('estado', 45)->default('Activo');
            $table->timestamps();

            $table->foreign('id_nivel')
                  ->references('id')
                  ->on('niveles')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('instalaciones');
    }
}

