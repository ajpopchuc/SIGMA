<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCampusTable extends Migration
{
    public function up()
    {
        Schema::create('campus', function (Blueprint $table) {
            $table->id('id');
            $table->string('nombre', 100);
            $table->string('descripcion', 200)->nullable();
            $table->string('estado', 45)->default('Activo');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('campus');
    }
}

