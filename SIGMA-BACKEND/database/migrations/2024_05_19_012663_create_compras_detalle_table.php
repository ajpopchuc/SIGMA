<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateComprasDetalleTable extends Migration
{
    public function up()
    {
        Schema::create('detalle_compras', function (Blueprint $table) {
            $table->id('id');
            // Campos solicitados
            $table->unsignedBigInteger('id_recurso')->nullable();
            $table->integer('cantidad');
            $table->string('unidad_medida', 100)->nullable();
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('total', 10, 2);
            $table->unsignedBigInteger('id_compra');
            $table->string('material_o_servicio', 255)->nullable();
            $table->timestamps();

            $table->foreign('id_compra')
            ->references('id')
            ->on('compras')
            ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('detalle_compras');
    }
}
