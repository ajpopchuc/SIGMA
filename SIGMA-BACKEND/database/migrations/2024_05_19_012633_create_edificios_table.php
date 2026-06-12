<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEdificiosTable extends Migration
{
    public function up()
    {
        Schema::create('edificios', function (Blueprint $table) {
            $table->id('id');
            $table->string('nombre', 100);
            $table->string('descripcion', 200)->nullable();
            $table->unsignedBigInteger('id_campus');
            $table->string('estado', 45)->default('Activo');
            $table->timestamps();

            $table->foreign('id_campus')
                  ->references('id')
                  ->on('campus')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('edificios');
    }
}

