<?php

use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::post('/login', 'App\Http\Controllers\loginController@login')->name('login');



Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/logout', 'App\Http\Controllers\loginController@logout')->name('logout');
    

    Route::prefix('usuarios')->group(function () {
        Route::post('/registrar', 'App\Http\Controllers\loginController@register')->name('register');
        Route::post('/registrarProveedores', 'App\Http\Controllers\loginController@registerProveedorUser')->name('registerProveedorUser');
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
        Route::get('/ubicaciones', 'App\Http\Controllers\activosController@get_ubicaciones')->name('activos.ubicaciones');
    });    

    // Rutas "AJPOP" -------------------------------------------------------------------------------------------------
    Route::prefix('recursos')->group(function () { 
        Route::get('/todos', 'App\Http\Controllers\recursosController@get_recursos')->name('recursos.all');
        Route::post('/crear', 'App\Http\Controllers\recursosController@create')->name('recursos.create');
        Route::post('/editar/{id}', 'App\Http\Controllers\recursosController@update')->name('recursos.edit');
        Route::get('/cambiar/{id}', 'App\Http\Controllers\recursosController@change')->name('recursos.change');
        Route::get('/todosestado', 'App\Http\Controllers\recursosController@get_recursosByState')->name('recursos.allstate');
    });

    Route::prefix('presupuesto')->group(function () { 
        Route::get('/todos', 'App\Http\Controllers\presupuestosController@get_presupuestos')->name('presupuestos.all');
        Route::get('/activos', 'App\Http\Controllers\presupuestosController@get_presupuestos_activos')->name('presupuestos.activos');
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
        Route::post('/registrar/1', 'App\Http\Controllers\mantenimientosController@crear_mantenimiento_paso_1')->name('mantenimientos.crear_mantenimiento_paso_1');
        Route::post('/registrar/2', 'App\Http\Controllers\mantenimientosController@crear_mantenimiento_paso_2')->name('mantenimientos.crear_mantenimiento_paso_2');
        Route::post('/registrar/3', 'App\Http\Controllers\mantenimientosController@crear_mantenimiento_paso_3')->name('mantenimientos.crear_mantenimiento_paso_3');
        Route::post('/registrar/4', 'App\Http\Controllers\mantenimientosController@crear_mantenimiento_paso_4')->name('mantenimientos.crear_mantenimiento_paso_4');
        Route::post('/registrar/5', 'App\Http\Controllers\mantenimientosController@crear_mantenimiento_paso_5')->name('mantenimientos.crear_mantenimiento_paso_5');
        Route::post('/registrar/6', 'App\Http\Controllers\mantenimientosController@crear_mantenimiento_paso_6')->name('mantenimientos.crear_mantenimiento_paso_6');
        // Route::post('/editar/{id}', 'App\Http\Controllers\mantenimientosController@update')->name('mantenimientos.edit');
        // Route::get('/cambiar/{id}', 'App\Http\Controllers\mantenimientosController@change')->name('mantenimientos.change');
    });

    Route::prefix('ajusteRecursos')->group(function () { 
        Route::get('/todos', 'App\Http\Controllers\recursosController@get_ajustes_recursos')->name('ajusteRecursos.all');
        Route::post('/crear', 'App\Http\Controllers\recursosController@crear_ajuste_recurso')->name('ajusteRecursos.create');
    });

    Route::prefix('reportes')->group(function () {
        Route::post('/gasto_total', 'App\Http\Controllers\reportesController@get_gasto_total')->name('reportes.gasto_total');
        Route::post('/stock_recursos', 'App\Http\Controllers\reportesController@get_stock_recursos')->name('reportes.stock_recursos');
        Route::get('/usuarios', 'App\Http\Controllers\reportesController@get_usuarios')->name('reportes.usuarios');
        Route::post('/actividades_usuario', 'App\Http\Controllers\reportesController@get_actividades_usuario')->name('reportes.actividades_usuario');
        Route::post('/horas_hombre', 'App\Http\Controllers\reportesController@get_horas_hombre')->name('reportes.horas_hombre');











    });
        











































    
//frank
Route::prefix('inspecciones')->group(function () {
    Route::get('/equipos', 'App\Http\Controllers\inspeccionesController@get_equipos')->name('inspecciones.equipos');
    Route::get('/infraestructura', 'App\Http\Controllers\inspeccionesController@get_infraestructuras')->name('inspecciones.infraestructura');
    Route::get('/informacion_general/{id}', 'App\Http\Controllers\inspeccionesController@get_info_inspeccion')->name('inspecciones.get_info_inspeccion');
    Route::get('/ubicacionesInfraestructura', 'App\Http\Controllers\inspeccionesController@get_ubicaciones')->name('inspecciones.get_ubicaciones');
    Route::get('/informacion_general_equipos/{id}', 'App\Http\Controllers\inspeccionesController@get_info_inspeccion_equips')->name('inspecciones.get_info_inspeccion_equips');
    Route::post('/paso1', 'App\Http\Controllers\inspeccionesController@procesarDatosIniciales')->name('inspecciones.procesarDatosIniciales');
    Route::post('/paso2', 'App\Http\Controllers\inspeccionesController@procesarInstalacion')->name('inspecciones.procesarInstalacion');
    Route::post('/paso3', 'App\Http\Controllers\inspeccionesController@procesarDatosGenerales')->name('inspecciones.procesarDatosGenerales');
    Route::post('/paso4', 'App\Http\Controllers\inspeccionesController@procesarDeterioros')->name('inspecciones.procesarDeterioros');
    Route::post('/paso5', 'App\Http\Controllers\inspeccionesController@procesarCondiciones')->name('inspecciones.procesarCondiciones');
    Route::post('/paso6', 'App\Http\Controllers\inspeccionesController@procesarFotografiaFinal')->name('inspecciones.procesarFotografiaFinal');
    Route::post('/paso7', 'App\Http\Controllers\inspeccionesController@procesarFotografiasAdicionales')->name('inspecciones.procesarFotografiasAdicionales');
    Route::post('/paso8', 'App\Http\Controllers\inspeccionesController@finFechaInspeccion')->name('inspecciones.finFechaInspeccion');
    Route::post('/equipo/paso2', 'App\Http\Controllers\inspeccionesController@procesarInspeccionEquipo')->name('inspecciones.procesarInspeccionEquipo');
});

Route::prefix('tablero')->group(function () {
    Route::get('/inspecciones', 'App\Http\Controllers\tableroController@get_inpsecciones_tablero')->name('tablero.get_inpsecciones_tablero');
    Route::get('/mantenimietnos', 'App\Http\Controllers\tableroController@get_mantenimientos_tablero')->name('tablero.get_mantenimientos_tablero');
    Route::get('/superviciones', 'App\Http\Controllers\tableroController@get_supervisiones_tablero')->name('tablero.get_supervisiones_tablero');

});

 























































//Mario
//Compras
Route::prefix('compras')->group(function () {
    Route::post('/all', 'App\Http\Controllers\comprasController@get_all')->name('compras.all');
    Route::post('/register', 'App\Http\Controllers\comprasController@register')->name('compras.register');
    Route::post('/registerMantenimiento', 'App\Http\Controllers\comprasController@register_compra_mantenimiento')->name('compras.register_compra_mantenimiento');
    Route::get('/getByPresupuesto/{id_presupuesto}', 'App\Http\Controllers\comprasController@getByPresupuesto')->name('compras.getByPresupuesto');
    Route::get('/cancel/{id}', 'App\Http\Controllers\comprasController@cancel_purchase')->name('compras.cancel');
    Route::get('/{id}', 'App\Http\Controllers\comprasController@show')->name('compras.show');
});

//Supervisiones
Route::prefix('supervisiones')->group(function () {
    Route::get('/equipos', 'App\Http\Controllers\supervisionController@get_equipos')->name('supervisiones.equipos');
    Route::get('/infraestructura', 'App\Http\Controllers\supervisionController@get_infraestructuras')->name('supervisiones.infraestructura');
    Route::get('/detalle/{id}', 'App\Http\Controllers\supervisionController@get_detalle_supervision')->name('supervisiones.detalle');
    Route::post('/registrar', 'App\Http\Controllers\supervisionController@crear_supervision')->name('supervisiones.crear_supervision');
    //Route::put('/editar/{id}', 'App\Http\Controllers\supervisionController@editar_supervision')->name('supervisiones.editar_supervision');
});































































//Ajpop
Route::prefix('proveedores')->group(function () { 
    Route::get('/todos', 'App\Http\Controllers\proveedoresController@get_proveedores')->name('proveedores.all');
    Route::post('/crear', 'App\Http\Controllers\proveedoresController@create')->name('proveedores.create');
    Route::post('/editar/{id}', 'App\Http\Controllers\proveedoresController@update')->name('proveedores.edit');
    Route::get('/cambiar/{id}', 'App\Http\Controllers\proveedoresController@change')->name('proveedores.change');
    Route::get('/todosestado', 'App\Http\Controllers\proveedoresController@get_proveedoresBystate')->name('proveedores.allstate');
});

Route::prefix('calendarizacion')->group(function () { 
    Route::get('/todos', 'App\Http\Controllers\calendarizacionController@get_actividades')->name('calendarizacion.all');
    Route::get('/porId/{id}', 'App\Http\Controllers\calendarizacionController@get_actividad')->name('calendarizacion.one');
    Route::post('/crear', 'App\Http\Controllers\calendarizacionController@create')->name('calendarizacion.create');
    Route::post('/editar/{id}', 'App\Http\Controllers\calendarizacionController@update')->name('calendarizacion.edit');
    Route::get('/cambiar/{id}', 'App\Http\Controllers\calendarizacionController@change')->name('calendarizacion.change');
});
//Ajpop Alertas
Route::prefix('alertas')->group(function () { 
    Route::get('/actividades_vencidas', 'App\Http\Controllers\alertasController@obtener_actividades_vencidas')->name('alertas.actividades_vencidas');
    Route::get('/actividades_vencidas_por_tipo/{tipo}', 'App\Http\Controllers\alertasController@obtener_alertas_por_tipo')->name('alertas.actividades_vencidas_por_tipo');
    Route::get('/recursos_stock_minimo', 'App\Http\Controllers\alertasController@obtener_recursos_stock_minimo')->name('alertas.obtener_recursos_stock_minimo');
});






























































});