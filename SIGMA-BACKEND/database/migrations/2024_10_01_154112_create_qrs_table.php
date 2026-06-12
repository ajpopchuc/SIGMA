<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQrsTable extends Migration
{
    public function up()
    {
        Schema::create('qrs', function (Blueprint $table) {
            $table->id('id');
            $table->string('codigo_qr')->unique(); // Código QR generado
            $table->unsignedBigInteger(column: 'activo_id');
            $table->timestamps();

            $table->foreign('activo_id')
                    ->references('id')
                    ->on('activos')
                    ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('qrs');
    }
}
