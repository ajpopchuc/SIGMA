<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-db', function () {
    try {
        // Intentar obtener el PDO
        $pdo = DB::getPdo();

        // Obtener la configuración de la base de datos
        $config = config('database.connections.mysql');

        // Mensaje de éxito con detalles de conexión
        return response()->json([
            'message' => 'Conexión a la base de datos exitosa.',
            'database' => $config['database'],
            'username' => $config['username'],
            'host' => $config['host'],
            'port' => $config['port'],
        ]);
    } catch (\Exception $e) {
        // Manejo del error de conexión
        return response()->json([
            'message' => 'Error de conexión: ' . $e->getMessage(),
            'database' => config('database.connections.mysql.database'), // Puede ser null si no hay conexión
            'username' => config('database.connections.mysql.username'), // Puede ser null si no hay conexión
            'host' => config('database.connections.mysql.host'), // Puede ser null si no hay conexión
            'port' => config('database.connections.mysql.port'), // Puede ser null si no hay conexión
        ], 500);
    }
});

Route::get('/qrcodes/{filename}', function ($filename) {
    $path = storage_path('app/public/qrcodes/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }

    return response()->file($path, [
        'Content-Type' => 'image/svg+xml',
        'Access-Control-Allow-Origin' => '*', 
    ]);
});
