<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateComprasTable extends Migration
{
    public function up()
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id('id');

            // Campos solicitados
            $table->unsignedBigInteger('id_proveedor');
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_presupuesto'); // Presupuesto al que pertenece, aun ver si es necesario agregar la realcion de llave foranea
            $table->decimal('total', 10, 2);
            $table->string('estado', 45)->default('Activo'); // Estado del recurso
            $table->string('area', 50); // Electricidad, Obra Gris/Albanileria, Fontaneria, Carpiteria
            $table->date('fecha_factura'); // fecha
            $table->string('no_factura', 45); //Numero_factura 
            $table->string('serie_factura', 45); // Serie
            $table->text('otras_compras')->nullable(); // Otras compras que no sean materiales como calzado, lentes, etc 
            $table->timestamps();

            $table->foreign('id_proveedor')
            ->references('id')
            ->on('proveedores')
            ->onDelete('cascade');

            $table->foreign('id_usuario')
            ->references('id')
            ->on('usuarios')
            ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('compras');
    }
}
