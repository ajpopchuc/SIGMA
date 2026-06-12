<?php

use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::post('/login', 'App\Http\Controllers\loginController@login')->name('login');



Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/logout', 'App\Http\Controllers\loginController@logout')->name('logout');
    

    Route::prefix('usuarios')->group(function () {
        Route::post('/registrar', 'App\Http\Controllers\loginController@register')->name('register');
        Route::get('/todos', 'App\Http\Controllers\usuariosController@get_all')->name('usuarios.all');
        Route::get('/cambiar/{id}', 'App\Http\Controllers\usuariosController@change')->name('usuarios.change');
        Route::post('/actualizar/{id}', 'App\Http\Controllers\usuariosController@update')->name('usuarios.update');
        Route::post('/cambiar_contraseña/{id}', 'App\Http\Controllers\usuariosController@change_password')->name('usuarios.change_password');
    });
    
    Route::prefix('roles')->group(function (){
        Route::get('/todos', 'App\Http\Controllers\rolesController@get_rol_para_usuario')->name('roles.to.user');
        Route::post('/registrar','App\Http\Controllers\rolesController@crear_rol')->name('roles.create');
        Route::post('/actualizar/{id}','App\Http\Controllers\rolesController@actualizar_rol')->name('roles.update');
    });

    Route::prefix('facultades')->group(function () {
        Route::get('/todas', 'App\Http\Controllers\facultadesController@get_facultades')->name('facultades.all');
        Route::post('/crear', 'App\Http\Controllers\facultadesController@create')->name('facultades.create');
        Route::post('/edit/{id}', 'App\Http\Controllers\facultadesController@edit')->name('facultades.edit');
    });

    Route::prefix('campus')->group(function () {
        Route::get('/todos', 'App\Http\Controllers\campusController@get_campus')->name('campus.all');
        Route::post('/crear', 'App\Http\Controllers\campusController@create')->name('campus.create');
        Route::post('/editar/{id}', 'App\Http\Controllers\campusController@update')->name('campus.edit');
        Route::get('/cambiar/{id}', 'App\Http\Controllers\campusController@change')->name('campus.change');
    });
    
    Route::prefix('edificios')->group(function () {
        Route::get('/todos', 'App\Http\Controllers\edifciosController@get_edificios')->name('edificios.all');
        Route::get('/campus', 'App\Http\Controllers\edifciosController@get_campus')->name('campuss.all');
        Route::post('/crear', 'App\Http\Controllers\edifciosController@create')->name('edificios.create');
        Route::post('/editar/{id}', 'App\Http\Controllers\edifciosController@update')->name('edificios.edit');
        Route::get('/cambiar/{id}', 'App\Http\Controllers\edifciosController@change')->name('edificios.change');
    });

    Route::prefix('niveles')->group(function () {
        Route::get('/todos', 'App\Http\Controllers\nivelesController@get_niveles')->name('niveles.all');
        Route::get('/edificios', 'App\Http\Controllers\nivelesController@get_edificioss')->name('edificioss.all');
        Route::post('/crear', 'App\Http\Controllers\nivelesController@create')->name('niveles.create');
        Route::post('/editar/{id}', 'App\Http\Controllers\nivelesController@update')->name('niveles.edit');
        Route::get('/cambiar/{id}', 'App\Http\Controllers\nivelesController@change')->name('niveles.change');
    });

    Route::prefix('instalaciones')->group(function () {
        Route::get('/todos', 'App\Http\Controllers\instalacionesController@get_instalaciones')->name('instalaciones.all');
        Route::get('/niveles', 'App\Http\Controllers\instalacionesController@get_niveless')->name('niveless.all');
        Route::post('/crear', 'App\Http\Controllers\instalacionesController@create')->name('instalaciones.create');
        Route::post('/editar/{id}', 'App\Http\Controllers\instalacionesController@update')->name('instalaciones.edit');
        Route::get('/cambiar/{id}', 'App\Http\Controllers\instalacionesController@change')->name('instalaciones.change');
    });


    // Rutas para Activos aun a modificar "Marito"
    Route::prefix('activos')->group(function () {
        Route::get('/todos', 'App\Http\Controllers\activosController@get_activos')->name('activos.all');
        Route::post('/crear', 'App\Http\Controllers\activosController@create')->name('activos.create');
        Route::post('/editar/{id}', 'App\Http\Controllers\activosController@update')->name('activos.edit');
        Route::get('/cambiar/{id}', 'App\Http\Controllers\activosController@change')->name('activos.change');
        Route::get('/instalaciones', 'App\Http\Controllers\activosController@get_instalaciones')->name('instalacioness.all');
    });    

    // Rutas "AJPOP" -------------------------------------------------------------------------------------------------
    Route::prefix('recursos')->group(function () { 
        Route::get('/todos', 'App\Http\Controllers\recursosController@get_recursos')->name('recursos.all');
        Route::post('/crear', 'App\Http\Controllers\recursosController@create')->name('recursos.create');
        Route::post('/editar/{id}', 'App\Http\Controllers\recursosController@update')->name('recursos.edit');
        Route::get('/cambiar/{id}', 'App\Http\Controllers\recursosController@change')->name('recursos.change');
    });

    Route::prefix('presupuesto')->group(function () { 
        Route::get('/todos', 'App\Http\Controllers\presupuestosController@get_presupuestos')->name('presupuestos.all');
        Route::post('/crear', 'App\Http\Controllers\presupuestosController@create')->name('presupuestos.create');
        Route::post('/editar/{id}', 'App\Http\Controllers\presupuestosController@update')->name('presupuestos.edit');
        Route::post('/cambiar/{id}', 'App\Http\Controllers\presupuestosController@change')->name('presupuestos.change');
    });

    Route::prefix('ajustePresupuestos')->group(function () { 
        Route::get('/todos', 'App\Http\Controllers\ajustesPresupuestoController@get_ajustes_presupuestos')->name('ajustePresupuestos.all');
        Route::post('/crear', 'App\Http\Controllers\ajustesPresupuestoController@create')->name('ajustePresupuestos.create');
    });

    Route::get('/permisos', 'App\Http\Controllers\rolesController@obtener_permisos')->name('permisos.all');
    Route::get('/permisos/rol/{id}', 'App\Http\Controllers\rolesController@obtener_permisos_rol')->name('permisos.rol');

    //QRS
    Route::prefix('qr')->group(function () {
        Route::get('/test-qr-generation/{activo_id}', 'App\Http\Controllers\qrsController@testGenerate');
        Route::get('/generate/{activo_id}', 'App\Http\Controllers\qrsController@generate');
        Route::get('/{activo_id}', 'App\Http\Controllers\qrsController@get');
        Route::delete('/{activo_id}', 'App\Http\Controllers\qrsController@delete');
    });
    


//Mauricio
    ///Mantenimientos
    Route::prefix('mantenimientos')->group(function () {
        Route::get('/equipos', 'App\Http\Controllers\mantenimientosController@get_equipos')->name('mantenimientos.equipos');
        Route::get('/infraestructura', 'App\Http\Controllers\mantenimientosController@get_infraestructuras')->name('mantenimientos.infraestructura');
        Route::get('/externos', 'App\Http\Controllers\mantenimientosController@get_externos')->name('mantenimientos.externos');
        Route::get('/detalle/{id}', 'App\Http\Controllers\mantenimientosController@get_detalle_mantenimiento')->name('mantenimientos.detalle');
        // Route::post('/crear', 'App\Http\Controllers\mantenimientosController@create')->name('mantenimientos.create');
        // Route::post('/editar/{id}', 'App\Http\Controllers\mantenimientosController@update')->name('mantenimientos.edit');
        // Route::get('/cambiar/{id}', 'App\Http\Controllers\mantenimientosController@change')->name('mantenimientos.change');
    });
















































//frank
Route::prefix('inspecciones')->group(function () {
    Route::get('/equipos', 'App\Http\Controllers\inspeccionesController@get_equipos')->name('inspecciones.equipos');
    Route::get('/infraestructura', 'App\Http\Controllers\inspeccionesController@get_infraestructuras')->name('inspecciones.infraestructura');
    // Route::post('/crear', 'App\Http\Controllers\mantenimientosController@create')->name('mantenimientos.create');
    // Route::post('/editar/{id}', 'App\Http\Controllers\mantenimientosController@update')->name('mantenimientos.edit');
    // Route::get('/cambiar/{id}', 'App\Http\Controllers\mantenimientosController@change')->name('mantenimientos.change');
});



































































//Mario















































































//Ajpop
Route::prefix('proveedores')->group(function () { 
    Route::get('/todos', 'App\Http\Controllers\proveedoresController@get_proveedores')->name('proveedores.all');
    Route::post('/crear', 'App\Http\Controllers\proveedoresController@create')->name('proveedores.create');
    Route::post('/editar/{id}', 'App\Http\Controllers\proveedoresController@update')->name('proveedores.edit');
    Route::get('/cambiar/{id}', 'App\Http\Controllers\proveedoresController@change')->name('proveedores.change');
});






























































});