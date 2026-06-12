<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNivelesTable extends Migration
{
    public function up()
    {
        Schema::create('niveles', function (Blueprint $table) {
            $table->id('id');
            $table->string('nombre', 100);
            $table->string('descripcion', 200)->nullable();
            $table->unsignedBigInteger('id_edificio');
            $table->string('estado', 45)->default('Activo');
            $table->timestamps();

            $table->foreign('id_edificio')
                  ->references('id')
                  ->on('edificios')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('niveles');
    }
}

