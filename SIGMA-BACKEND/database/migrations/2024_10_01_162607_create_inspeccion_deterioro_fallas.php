<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInspeccionDeterioroFallas extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inspecciones_deterioro_fallas', function (Blueprint $table) {
            $table->id();
            $table->string('condicion_general', 100); // Ninguno, Leve, Grave
            $table->integer('porcentaje_deterioro');
            $table->string('observaciones', 300)->nullable();
            $table->unsignedBigInteger('id_inspeccion');
            $table->unsignedBigInteger('id_tipo_deteriorio_falla'); // Agregar columna para la relación

            // Clave foránea que referencia a la tabla 'tipos_de_deterioro_falla'
            $table->foreign('id_tipo_deteriorio_falla', 'fk_tipo_deteriorio_falla_id')
                ->references('id')
                ->on('tipos_de_deterioro_falla')
                ->onDelete('cascade');

            $table->timestamps();

            // Clave foránea existente que referencia a la tabla 'inspecciones'
            $table->foreign('id_inspeccion', 'fk_inspeccion_id')
                ->references('id')
                ->on('inspecciones')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('inspecciones_deterioro_fallas');
    }
}
