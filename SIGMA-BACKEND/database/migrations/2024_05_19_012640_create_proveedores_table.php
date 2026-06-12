<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProveedoresTable extends Migration
{
    public function up()
    {
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id('id');
            $table->unsignedBigInteger(column: 'id_usuario')->nullable();
            $table->string('nombre_proveedor', 100);
            $table->string('nombre_persona_contacto', 100);
            $table->string('correo_contacto', 100)->nullable();
            $table->string('pbx', 20)->nullable();
            $table->string('telefono_persona_contacto', 20);
            $table->string('direccion', 200);
            $table->string('descripcion', 200)->nullable();
            $table->string('tipo_proveedor', 100);
            $table->string('estado', 45)->default('Activo');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('proveedores');
    }
}