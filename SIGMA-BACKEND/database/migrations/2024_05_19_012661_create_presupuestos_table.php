<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePresupuestosTable extends Migration
{
    public function up()
    {
        Schema::create('presupuestos', function (Blueprint $table) {
            $table->id('id');

            // Campos solicitados
            $table->string('area', 50); // Electricidad, Obra Gris/Albanileria, Fontaneria, Carpiteria
            $table->decimal('monto_presupuesto', 10, 2); // Presupuesto total asignado
            $table->decimal('presupuesto_ejecutado', 10, 2)->default(0); // Total gastado hasta el momento
            $table->decimal('monto_pendiente', 10, 2); // Cantidad restante del presupuesto
            $table->date('fecha_inicio'); // Fecha de inicio del presupuesto (puede ser inicio de año o semestre)
            $table->date('fecha_fin'); // Fecha de fin del presupuesto (puede ser fin de año o semestre)
            $table->string('periodo', 45); // "Anual" o "Semestral", o lo que prefieras para identificar el tipo de periodo
            $table->string('estado', 45)->default('Activo'); // Estado del recurso
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('presupuestos');
    }
}
