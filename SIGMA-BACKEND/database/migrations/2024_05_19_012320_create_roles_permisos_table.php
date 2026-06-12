<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRolesPermisosTable extends Migration
{
    public function up()
    {
        Schema::create('roles_permisos', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger('id_rol');
            $table->unsignedBigInteger('id_permiso');
            $table->timestamps();
            
            $table->foreign('id_rol')
                  ->references('id')
                  ->on('roles')
                  ->onDelete('cascade');

            $table->foreign('id_permiso')
            ->references('id')
            ->on('permisos')
            ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('roles_permisos');
    }
}