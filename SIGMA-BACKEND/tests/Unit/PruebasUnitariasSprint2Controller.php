<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Http\Controllers\mantenimientosController;
use App\Http\Controllers\comprasController;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\User;
use App\Http\Controllers\supervisionController;

class PruebasUnitariasSprint2Controller extends TestCase
{
    /**
     * A basic unit test example.
     *
     * @return void
     */
    public function test_example()
    {
        $this->assertTrue(true);
    }

    public function test_get_equipos()
    {
        $controller = new mantenimientosController();
        $response = $controller->get_equipos();
        $this->assertNotEmpty($response->getContent());
        // ...aserciones adicionales...
    }

    public function test_get_infraestructuras()
    {
        $controller = new mantenimientosController();
        $response = $controller->get_infraestructuras();
        $this->assertNotEmpty($response->getContent());
        // ...aserciones adicionales...
    }

    public function test_get_externos()
    {
        $controller = new mantenimientosController();
        $response = $controller->get_externos();
        $this->assertNotEmpty($response->getContent());
        // ...aserciones adicionales...
    }

    public function test_get_detalle_mantenimiento()
    {
        $controller = new mantenimientosController();
        $response = $controller->get_detalle_mantenimiento(1); // ID de prueba
        $this->assertNotEmpty($response->getContent());
        // ...aserciones adicionales...
    }

    public function test_crear_mantenimiento()
    {
        // Simular el almacenamiento para archivos
        Storage::fake('public');

        $controller = new mantenimientosController();

        // Crear archivos simulados para las fotografías
        $fotografia_inicial = [UploadedFile::fake()->image('foto_inicial.jpg')];
        $fotografia_final = [UploadedFile::fake()->image('foto_final.jpg')];
        $fotografias_adicionales = [UploadedFile::fake()->image('foto_adicional.jpg')];

        // Datos de prueba
        $request = new Request([
            'id_instalacion' => 1,
            'id_activos' => '1,2,3',
            'nivel_atendido' => 'Alto',
            'tipo' => 'Correctivo',
            'cantidad_atendida' => 5,
            'unidad_medida' => 'Unidades',
            'descripcion' => 'Mantenimiento de prueba',
            'resumen_actividad' => 'Resumen de actividad de prueba',
            'tiempo_ejecucion' => 2.5,
            'monto_total' => 1500.00,
            'motivo_actividad' => 'Prueba de mantenimiento',
            'observaciones' => 'Sin observaciones',
            'id_calendario' => 1,
            'tipo_mantenimiento' => 'Preventivo',
            'lugar_mantenimiento' => 'Equipo',
            'detalle_mantenimiento' => json_encode([
                [
                    'codigo' => 'RC001',
                    'material_o_servicio' => 'Servicio de prueba',
                    'id_recurso' => 1,
                    'cantidad' => 2,
                    'unidad' => 'Pieza',
                    'precio_unitario' => 100,
                    'total' => 200
                ]
            ]),
        ]);

        // Agregar archivos al request
        $request->files->set('fotografia_inicial', $fotografia_inicial);
        $request->files->set('fotografia_final', $fotografia_final);
        $request->files->set('fotografias_adicionales', $fotografias_adicionales);

        // Simular usuario autenticado
        $user = new User(['id' => 1]);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        // Ejecutar el método del controlador
        $response = $controller->crear_mantenimiento($request);

        // Verificar que la respuesta sea exitosa
        $this->assertEquals(200, $response->getStatusCode());

        // Verificar el mensaje de éxito
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('Mantenimiento creado correctamente', $data['success']);

        // ...aserciones adicionales...
    }

    // TODO: Agregar las demás pruebas

    public function test_show_compra()
    {
        $controller = new comprasController();
        $response = $controller->show(1); // ID de prueba
        $this->assertNotEmpty($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_register_compra()
    {
        $controller = new comprasController();
        
        $request = new Request([
            'id_proveedor' => 1,
            'total' => 1000.00,
            'area' => 'Carpinteria',
            'fecha_factura' => '2024-01-20',
            'no_factura' => 'F001',
            'serie_factura' => 'A',
            'items' => [
                [
                    'id_recurso' => 1,
                    'cantidad' => 5,
                    'unidad_medida' => 'Unidad',
                    'precio_unitario' => 200.00,
                    'total' => 1000.00
                ]
            ]
        ]);

        // Simular usuario autenticado
        $user = new User(['id' => 1]);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $response = $controller->register($request);
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_cancel_purchase()
    {
        $controller = new comprasController();
        $response = $controller->cancel_purchase(1); // ID de prueba
        $this->assertNotEmpty($response->getContent());
    }

    public function test_get_all_compras()
    {
        $_POST['estado'] = 'Activo';
        $controller = new comprasController();
        $response = $controller->get_all();
        $this->assertNotEmpty($response->getContent());
        
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('meta', $data);
        $this->assertArrayHasKey('data', $data);
    }

    public function test_get_by_presupuesto()
    {
        $controller = new comprasController();
        $response = $controller->getByPresupuesto(1); // ID de presupuesto de prueba
        $this->assertNotEmpty($response->getContent());
    }

    public function test_register_compra_mantenimiento()
    {
        $controller = new comprasController();
        
        $request = new Request([
            'id_proveedor' => 1,
            'total' => 1000.00,
            'area' => 'Carpinteria',
            'fecha_factura' => '2024-01-20',
            'no_factura' => '5001',
            'serie_factura' => 'A',
            'id_mantenimiento' => 1,
            'items' => [
                [
                    'cantidad' => 1,
                    'unidad' => 'Servicio',
                    'precio_unitario' => 1000.00,
                    'total' => 1000.00,
                    'material_o_servicio' => 'Servicio'
                ]
            ]
        ]);

        // Simular usuario autenticado
        $user = new User(['id' => 1]);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $response = $controller->register_compra_mantenimiento($request);
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_get_supervisiones()
    {
        $controller = new supervisionController();
        $response = $controller->get_supervisiones();
        $this->assertNotEmpty($response->getContent());
        
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('meta', $data);
        $this->assertArrayHasKey('data', $data);
    }

    public function test_get_equipos_supervision()
    {
        $controller = new supervisionController();
        $response = $controller->get_equipos();
        $this->assertNotEmpty($response->getContent());
        
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('meta', $data);
        $this->assertArrayHasKey('data', $data);
    }

    public function test_get_infraestructuras_supervision()
    {
        $controller = new supervisionController();
        $response = $controller->get_infraestructuras();
        $this->assertNotEmpty($response->getContent());
        
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('meta', $data);
        $this->assertArrayHasKey('data', $data);
    }

    public function test_get_detalle_supervision()
    {
        $controller = new supervisionController();
        $response = $controller->get_detalle_supervision(1); // ID de prueba
        $this->assertNotEmpty($response->getContent());
    }

    public function test_crear_supervision()
    {
        Storage::fake('public');
        
        $controller = new supervisionController();
        
        $fotografia_inicial = [UploadedFile::fake()->image('foto_inicial.jpg')];
        $fotografia_final = [UploadedFile::fake()->image('foto_final.jpg')];
        $fotografias_adicionales = [UploadedFile::fake()->image('foto_adicional.jpg')];

        $request = new Request([
            'descripcion' => 'Supervisión de prueba',
            'resumen_actividad' => 'Resumen de supervisión',
            'observaciones' => 'Sin observaciones',
            'tiempo_ejecucion' => 1.5,
            'lugar_mantenimiento' => 'Equipo',
            'id_mantenimiento' => 1,
            'id_calendario' => 1,
        ]);

        $request->files->set('fotografia_inicial', $fotografia_inicial);
        $request->files->set('fotografia_final', $fotografia_final);
        $request->files->set('fotografias_adicionales', $fotografias_adicionales);

        $user = new User(['id' => 1]);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $response = $controller->crear_supervision($request);
        $this->assertEquals(200, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('Supervisión creada correctamente', $data['success']);
    }

    public function test_get_inspecciones_equipos()
    {
        $controller = new inspeccionesController();
        $response = $controller->get_equipos();
        $this->assertNotEmpty($response->getContent());
        
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('meta', $data);
        $this->assertArrayHasKey('data', $data);
    }

    public function test_get_inspecciones_infraestructura()
    {
        $controller = new inspeccionesController();
        $response = $controller->get_infraestructuras();
        $this->assertNotEmpty($response->getContent());
        
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('meta', $data);
        $this->assertArrayHasKey('data', $data);
    }

    public function test_get_info_inspeccion()
    {
        $controller = new inspeccionesController();
        
        // Simular usuario autenticado
        $request = new Request();
        $user = new User(['id' => 1]);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $response = $controller->get_info_inspeccion($request, 1); // ID de prueba
        $this->assertNotEmpty($response->getContent());
        
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('data', $data);
    }

    public function test_crear_inspeccion_infraestructura()
    {
        Storage::fake('public');
        
        $controller = new inspeccionesController();
        
        $fotografia_inicial = [UploadedFile::fake()->image('foto_inicial.jpg')];
        $fotografia_final = [UploadedFile::fake()->image('foto_final.jpg')];
        $fotografias_adicionales = [UploadedFile::fake()->image('foto_adicional.jpg')];

        $request = new Request([
            'id_instalacion' => 1,
            'tipo' => 'Preventiva',
            'cantidad_inspeccion' => 1,
            'unidad_medida' => 'Unidad',
            'motivo' => 'Inspección de prueba',
            'descripcion' => 'Descripción de prueba',
            'condicionGeneral' => 'Aceptable',
            'intervencion' => 'Mantenimiento preventivo',
            'plazoIntervencion' => 'Programable',
            'deterioroDatas' => json_encode([
                [
                    'id' => 1,
                    'condicion' => 'leve',
                    'observaciones' => 'Observación de prueba'
                ]
            ]),
            'id_calendario' => 1
        ]);

        $request->files->set('fotografia_inicial', $fotografia_inicial);
        $request->files->set('fotografia_final', $fotografia_final);
        $request->files->set('fotografias_adicionales', $fotografias_adicionales);

        $user = new User(['id' => 1]);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $response = $controller->crearInspeccionInfraestructura($request);
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_crear_inspeccion_equipos()
    {
        Storage::fake('public');
        
        $controller = new inspeccionesController();
        
        $fotografia_inicial = [UploadedFile::fake()->image('foto_inicial.jpg')];
        $fotografia_final = [UploadedFile::fake()->image('foto_final.jpg')];
        $fotografias_adicionales = [UploadedFile::fake()->image('foto_adicional.jpg')];

        $request = new Request([
            'id_instalacion' => 1,
            'tipo' => 'Preventiva',
            'cantidad_inspeccion' => 1,
            'unidad_medida' => 'Unidad',
            'motivo' => 'Inspección de equipo',
            'descripcion' => 'Descripción de prueba',
            'condicionGeneral' => 'Aceptable',
            'intervencion' => 'Mantenimiento preventivo',
            'plazoIntervencion' => 'Programable',
            'deterioroDatas' => json_encode([
                [
                    'id' => 1,
                    'condicion' => 'leve',
                    'observaciones' => 'Observación de prueba'
                ]
            ]),
            'id_calendario' => 1,
            'elementos' => '1,2,3'
        ]);

        $request->files->set('fotografia_inicial', $fotografia_inicial);
        $request->files->set('fotografia_final', $fotografia_final);
        $request->files->set('fotografias_adicionales', $fotografias_adicionales);

        $user = new User(['id' => 1]);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $response = $controller->crearInspeccionEquipos($request);
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_get_ubicaciones()
    {
        $controller = new inspeccionesController();
        $response = $controller->get_ubicaciones();
        $this->assertNotEmpty($response->getContent());
        
        $data = json_decode($response->getContent(), true);
        $this->assertIsArray($data);
    }
}
