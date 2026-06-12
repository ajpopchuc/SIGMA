<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Usuarios;
use App\Models\empleados;
use Illuminate\Support\Facades\Hash;
use App\Models\Permisos;
use App\Models\Roles;
use App\Models\roles_permisos;
use App\Models\recursos;
use App\Models\logs;
use App\Models\ajustesRecursos;
use App\Models\presupuesto;

class PruebasUnitariasSprint1Controller extends TestCase
{
    use RefreshDatabase;

    public function test_login_successful()
    {
        // Crear un usuario y empleado asociado
        $user = Usuarios::create([
            'usuario' => 'testuser',
            'contraseña' => bcrypt('password123'),
            'id_rol' => 1,
            'estado' => 'Activo'
        ]);

        empleados::create([
            'nombre' => 'Test',
            'apellido' => 'User',
            'correo_electronico' => 'testuser@example.com',
            'id_usuario' => $user->id,
            'estado' => 'Activo'
        ]);

        // Enviar solicitud de inicio de sesión
        $response = $this->postJson('/login', [
            'usuario' => 'testuser',
            'password' => 'password123'
        ]);

        // Verificar respuesta exitosa
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'id_usuario',
                     'nombre_usuario',
                     'rol',
                     'token',
                     'permisos'
                 ]);
    }

    public function test_login_with_invalid_credentials()
    {
        // Enviar solicitud con credenciales inválidas
        $response = $this->postJson('/login', [
            'usuario' => 'wronguser',
            'password' => 'wrongpassword'
        ]);

        // Verificar respuesta de error
        $response->assertStatus(401)
                 ->assertJson([
                     'error' => 'Usuario o contraseña incorrectos'
                 ]);
    }

    public function test_logout_successful()
    {
        // Crear y autenticar usuario
        $user = Usuarios::create([
            // ...datos del usuario...
        ]);
        $this->actingAs($user);

        // Enviar solicitud de cierre de sesión


        // Verificar respuesta exitosa
        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Sesión cerrada correctamente'
                 ]);
    }

    public function test_register_successful()
    {
        // Enviar solicitud de registro
        $response = $this->postJson('/register', [
            'usuario' => 'newuser',
            'contraseña' => 'password123',
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'correo_electronico' => 'juan.perez@example.com',
            'id_rol' => 1
        ]);

        // Verificar respuesta exitosa
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Empleado creado correctamente',
                     'status' => 200
                 ]);

        // Verificar que el usuario y empleado existen en la base de datos
        $this->assertDatabaseHas('usuarios', ['usuario' => 'newuser']);
        $this->assertDatabaseHas('empleados', ['correo_electronico' => 'juan.perez@example.com']);
    }

    public function test_register_with_existing_email()
    {
        // Crear empleado con correo existente
        empleados::create([
            'nombre' => 'Ana',
            'apellido' => 'Gómez',
            'correo_electronico' => 'ana.gomez@example.com',
            'id_usuario' => null,
            'estado' => 'Activo'
        ]);

        // Enviar solicitud de registro con correo ya utilizado
        $response = $this->postJson('/register', [
            'usuario' => 'anotheruser',
            'contraseña' => 'password123',
            'nombre' => 'Ana',
            'apellido' => 'Gómez',
            'correo_electronico' => 'ana.gomez@example.com',
            'id_rol' => 1
        ]);

        // Verificar respuesta de error de validación
        $response->assertStatus(422)
                 ->assertJsonStructure(['message', 'errors']);
    }

    public function test_get_all_users()
    {
        // Crear usuarios y empleados
        $user1 = Usuarios::create([
            'usuario' => 'user1',
            'contraseña' => bcrypt('password1'),
            'id_rol' => 1,
            'estado' => 'Activo'
        ]);
        empleados::create([
            'nombre' => 'Usuario',
            'apellido' => 'Uno',
            'correo_electronico' => 'user1@example.com',
            'id_usuario' => $user1->id,
            'estado' => 'Activo'
        ]);

        $user2 = Usuarios::create([
            'usuario' => 'user2',
            'contraseña' => bcrypt('password2'),
            'id_rol' => 2,
            'estado' => 'Activo'
        ]);
        empleados::create([
            'nombre' => 'Usuario',
            'apellido' => 'Dos',
            'correo_electronico' => 'user2@example.com',
            'id_usuario' => $user2->id,
            'estado' => 'Activo'
        ]);

        // Autenticar y realizar solicitud
        $response = $this->actingAs($user1)->getJson('/usuarios');

        // Verificar respuesta
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'meta',
                     'data' => [
                         '*' => [
                             'id',
                             'nombre',
                             'apellido',
                             'usuario',
                             // ...otros campos...
                         ]
                     ]
                 ]);
    }

    public function test_change_user_state()
    {
        // Crear usuario y empleado
        $user = Usuarios::create([
            'usuario' => 'testuser',
            'contraseña' => bcrypt('password123'),
            'id_rol' => 2,
            'estado' => 'Activo'
        ]);
        empleados::create([
            'nombre' => 'Test',
            'apellido' => 'User',
            'correo_electronico' => 'testuser@example.com',
            'id_usuario' => $user->id,
            'estado' => 'Activo'
        ]);

        // Crear administrador y autenticar
        $admin = Usuarios::create([
            'usuario' => 'admin',
            'contraseña' => bcrypt('adminpass'),
            'id_rol' => 1, // Suponiendo que rol 1 es administrador
            'estado' => 'Activo'
        ]);

        // Realizar solicitud para cambiar estado
        $response = $this->actingAs($admin)->putJson("/usuarios/{$user->id}/change");

        // Verificar respuesta
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Estado actualizado correctamente',
                     'status' => 200
                 ]);

        // Confirmar cambio de estado
        $user->refresh();
        $this->assertEquals('Inactivo', $user->estado);
    }

    public function test_update_user()
    {
        // Crear usuario y empleado
        $user = Usuarios::create([
            'usuario' => 'olduser',
            'contraseña' => bcrypt('password123'),
            'id_rol' => 2,
            'estado' => 'Activo'
        ]);
        $empleado = empleados::create([
            'nombre' => 'Old',
            'apellido' => 'User',
            'correo_electronico' => 'olduser@example.com',
            'id_usuario' => $user->id,
            'estado' => 'Activo'
        ]);

        // Datos de actualización
        $data = [
            'usuario' => 'newuser',
            'nombre' => 'New',
            'apellido' => 'User',
            'correo_electronico' => 'newuser@example.com',
            'id_rol' => 3
        ];

        // Autenticar y realizar solicitud
        $response = $this->actingAs($user)->putJson("/usuarios/{$user->id}", $data);

        // Verificar respuesta
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Empleado actualizado correctamente',
                     'status' => 200
                 ]);

        // Confirmar cambios en la base de datos
        $user->refresh();
        $empleado->refresh();
        $this->assertEquals('newuser', $user->usuario);
        $this->assertEquals('New', $empleado->nombre);
        $this->assertEquals('User', $empleado->apellido);
        $this->assertEquals('newuser@example.com', $empleado->correo_electronico);
        $this->assertEquals(3, $user->id_rol);
    }

    public function test_change_password_successful()
    {
        // Crear usuario
        $user = Usuarios::create([
            'usuario' => 'testuser',
            'contraseña' => bcrypt('oldpassword'),
            'id_rol' => 2,
            'estado' => 'Activo'
        ]);

        // Datos de cambio de contraseña
        $data = [
            'nueva_contrasena' => 'newpassword123',
            'confirmar_contrasena' => 'newpassword123'
        ];

        // Autenticar y realizar solicitud
        $response = $this->actingAs($user)->postJson("/usuarios/{$user->id}/change_password", $data);

        // Verificar respuesta
        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Contraseña actualizada correctamente',
                     'status' => 200
                 ]);

        // Confirmar cambio de contraseña
        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->contraseña));
    }

    public function test_change_password_with_invalid_confirmation()
    {
        // Crear usuario
        $user = Usuarios::create([
            'usuario' => 'testuser',
            'contraseña' => bcrypt('oldpassword'),
            'id_rol' => 2,
            'estado' => 'Activo'
        ]);

        // Datos con confirmación incorrecta
        $data = [
            'nueva_contrasena' => 'newpassword123',
            'confirmar_contrasena' => 'wrongconfirmation'
        ];

        // Autenticar y realizar solicitud
        $response = $this->actingAs($user)->postJson("/usuarios/{$user->id}/change_password", $data);

        // Verificar error de validación
        $response->assertStatus(422)
                 ->assertJsonStructure(['message', 'errors']);
    }

    public function test_obtener_permisos()
    {
        // Crear permisos de prueba
        permisos::create(['nombre' => 'Crear Usuarios']);
        permisos::create(['nombre' => 'Editar Usuarios']);

        // Enviar solicitud para obtener permisos
        $response = $this->getJson('/permisos');

        // Verificar respuesta
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => ['id', 'nombre']
                 ]);
    }

    public function test_obtener_permisos_rol()
    {
        // Crear rol y permisos
        $permiso = permisos::create(['nombre' => 'Eliminar Usuarios']);
        $rol = roles::create(['nombre' => 'Administrador']);
        roles_permisos::create([
            'id_rol' => $rol->id,
            'id_permiso' => $permiso->id
        ]);

        // Enviar solicitud para obtener permisos del rol
        $response = $this->getJson("/roles/{$rol->id}/permisos");

        // Verificar respuesta
        $response->assertStatus(200)
                 ->assertJson([$permiso->id]);
    }

    public function test_crear_rol()
    {
        // Autenticar como administrador
        $admin = Usuarios::create([
            'usuario' => 'admin',
            'contraseña' => bcrypt('adminpass'),
            'id_rol' => 1, // Suponiendo que rol 1 es administrador
            'estado' => 'Activo'
        ]);
        $this->actingAs($admin);

        // Crear permisos de prueba
        $permiso1 = permisos::create(['nombre' => 'Ver Usuarios']);
        $permiso2 = permisos::create(['nombre' => 'Crear Roles']);

        // Enviar solicitud para crear un nuevo rol
        $response = $this->postJson('/roles', [
            'nombre' => 'Nuevo Rol',
            'permisos' => [$permiso1->id, $permiso2->id],
        ]);

        // Verificar respuesta y cambios en la base de datos
        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Rol creado correctamente',
                     'status' => 200
                 ]);
        $this->assertDatabaseHas('roles', ['nombre' => 'Nuevo Rol']);
        $this->assertDatabaseHas('roles_permisos', [
            'id_rol' => roles::where('nombre', 'Nuevo Rol')->first()->id,
            'id_permiso' => $permiso1->id
        ]);
    }

    public function test_actualizar_rol()
    {
        // Autenticar como administrador
        $admin = Usuarios::create([
            'usuario' => 'admin',
            'contraseña' => bcrypt('adminpass'),
            'id_rol' => 1,
            'estado' => 'Activo'
        ]);
        $this->actingAs($admin);

        // Crear rol y permisos iniciales
        $rol = roles::create(['nombre' => 'Rol Antiguo']);
        $permiso1 = permisos::create(['nombre' => 'Editar Usuarios']);
        roles_permisos::create([
            'id_rol' => $rol->id,
            'id_permiso' => $permiso1->id
        ]);

        // Crear nuevo permiso
        $permiso2 = permisos::create(['nombre' => 'Eliminar Usuarios']);

        // Enviar solicitud para actualizar el rol
        $response = $this->putJson("/roles/{$rol->id}", [
            'nombre' => 'Rol Actualizado',
            'permisos' => [$permiso2->id],
        ]);

        // Verificar respuesta y cambios en la base de datos
        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Rol actualizado correctamente',
                     'status' => 200
                 ]);
        $this->assertDatabaseHas('roles', ['nombre' => 'Rol Actualizado']);
        $this->assertDatabaseMissing('roles_permisos', [
            'id_rol' => $rol->id,
            'id_permiso' => $permiso1->id
        ]);
        $this->assertDatabaseHas('roles_permisos', [
            'id_rol' => $rol->id,
            'id_permiso' => $permiso2->id
        ]);
    }

    public function test_get_recursos_by_state()
    {
        recursos::create([
            'nombre' => 'Recurso 1',
            'descripcion' => 'Descripción 1',
            'existencias' => 10,
            'existencias_minimas' => 1,
            'existencias_maximas' => 20,
            'precio' => 100.0,
            'estado' => 'Activo'
        ]);

        $response = $this->getJson('/recursos?estado=Activo');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'data' => [
                         '*' => [
                             'id',
                             'nombre',
                             'descripcion',
                             'existencias',
                             'existencias_minimas',
                             'existencias_maximas',
                             'precio',
                             'estado'
                         ]
                     ]
                 ]);
    }

    public function test_create_recurso()
    {
        $user = Usuarios::factory()->create();

        $data = [
            'nombre' => 'Nuevo Recurso',
            'descripcion' => 'Descripción del nuevo recurso',
            'existencias' => 10,
            'existencias_minimas' => 1,
            'existencias_maximas' => 20,
            'precio' => 100.0,
            'estado' => 'Activo'
        ];

        $response = $this->actingAs($user)->postJson('/recursos', $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Recurso creado correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('recursos', ['nombre' => 'Nuevo Recurso']);
    }

    public function test_update_recurso()
    {
        $user = Usuarios::factory()->create();
        $recurso = recursos::factory()->create();

        $data = [
            'nombre' => 'Recurso Actualizado',
            'descripcion' => 'Descripción actualizada',
            'existencias' => 15,
            'existencias_minimas' => 2,
            'existencias_maximas' => 25,
            'precio' => 150.0,
            'estado' => 'Activo'
        ];

        $response = $this->actingAs($user)->putJson("/recursos/{$recurso->id}", $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Recurso actualizado correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('recursos', ['nombre' => 'Recurso Actualizado']);
    }

    public function test_change_recurso_state()
    {
        $user = Usuarios::factory()->create();
        $recurso = recursos::factory()->create(['estado' => 'Activo']);

        $response = $this->actingAs($user)->putJson("/recursos/{$recurso->id}/change");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Estado actualizado correctamente',
                     'status' => 200
                 ]);

        $recurso->refresh();
        $this->assertEquals('Inactivo', $recurso->estado);
    }

    public function test_crear_ajuste_recurso()
    {
        $user = Usuarios::factory()->create();
        $recurso = recursos::factory()->create(['existencias' => 10]);

        $data = [
            'id_recurso' => $recurso->id,
            'cantidad' => 5,
            'tipo' => 'Aumento',
            'motivo' => 'Ajuste de prueba'
        ];

        $response = $this->actingAs($user)->postJson('/ajustes_recursos', $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Ajuste realizado correctamente',
                     'status' => 200
                 ]);

        $recurso->refresh();
        $this->assertEquals(15, $recurso->existencias);
    }

    public function test_get_ajustes_recursos()
    {
        $recurso = recursos::factory()->create();
        ajustesRecursos::factory()->create(['id_recurso' => $recurso->id]);

        $response = $this->getJson('/ajustes_recursos');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'id',
                         'id_recurso',
                         'recurso',
                         'cantidad',
                         'tipo',
                         'motivo',
                         'created_at'
                     ]
                 ]);
    }

    public function test_create_presupuesto()
    {
        $user = Usuarios::factory()->create();

        $data = [
            'monto_presupuesto' => 1000.00,
            'fecha_inicio' => '2023-01-01',
            'fecha_fin' => '2023-12-31',
            'periodo' => 'Anual',
            'area' => 'Finanzas'
        ];

        $response = $this->actingAs($user)->postJson('/presupuestos', $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Presupuesto creado correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('presupuestos', ['area' => 'Finanzas']);
    }

    public function test_update_presupuesto()
    {
        $user = Usuarios::factory()->create();
        $presupuesto = presupuestos::factory()->create();

        $data = [
            'monto_presupuesto' => 2000.00,
            'fecha_inicio' => '2023-01-01',
            'fecha_fin' => '2023-12-31',
            'periodo' => 'Anual',
            'estado' => 'Activo'
        ];

        $response = $this->actingAs($user)->putJson("/presupuestos/{$presupuesto->id}", $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Presupuesto actualizado correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('presupuestos', ['monto_presupuesto' => 2000.00]);
    }

    public function test_get_presupuestos()
    {
        $user = Usuarios::factory()->create();
        presupuestos::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/presupuestos');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'id',
                         'monto_presupuesto',
                         'fecha_inicio',
                         'fecha_fin',
                         'periodo',
                         'area',
                         'estado'
                     ]
                 ]);
    }

    public function test_get_presupuesto()
    {
        $user = Usuarios::factory()->create();
        $presupuesto = presupuestos::factory()->create();

        $response = $this->actingAs($user)->getJson("/presupuestos/{$presupuesto->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $presupuesto->id,
                     'monto_presupuesto' => $presupuesto->monto_presupuesto,
                     'fecha_inicio' => $presupuesto->fecha_inicio,
                     'fecha_fin' => $presupuesto->fecha_fin,
                     'periodo' => $presupuesto->periodo,
                     'area' => $presupuesto->area,
                     'estado' => $presupuesto->estado
                 ]);
    }

    public function test_get_presupuestos_activos()
    {
        $user = Usuarios::factory()->create();
        presupuestos::factory()->create(['estado' => 'Activo']);
        presupuestos::factory()->create(['estado' => 'Inactivo']);

        $response = $this->actingAs($user)->getJson('/presupuestos/activos');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'id',
                         'monto_presupuesto',
                         'fecha_inicio',
                         'fecha_fin',
                         'periodo',
                         'area',
                         'estado'
                     ]
                 ]);
    }

    public function test_get_ajustes_presupuestos()
    {
        $ajuste1 = ajustesPresupuesto::create([
            'id_presupuesto' => 1,
            'cantidad' => 100,
            'tipo' => 'Aumento',
            'motivo' => 'Ajuste de prueba 1'
        ]);

        $ajuste2 = ajustesPresupuesto::create([
            'id_presupuesto' => 2,
            'cantidad' => 50,
            'tipo' => 'Reduccion',
            'motivo' => 'Ajuste de prueba 2'
        ]);

        $response = $this->getJson('/ajustes_presupuestos');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'id',
                         'id_presupuesto',
                         'cantidad',
                         'tipo',
                         'motivo',
                         'created_at',
                         'updated_at'
                     ]
                 ]);
    }

    public function test_create_ajuste_presupuesto()
    {
        $user = Usuarios::factory()->create();
        $presupuesto = presupuestos::factory()->create(['area' => 'Finanzas', 'estado' => 'Activo']);

        $data = [
            'area' => 'Finanzas',
            'cantidad' => 200,
            'tipo' => 'Aumento',
            'motivo' => 'Ajuste de prueba'
        ];

        $response = $this->actingAs($user)->postJson('/ajustes_presupuestos', $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Ajuste de presupuesto creado y presupuesto actualizado correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('ajustes_presupuestos', ['motivo' => 'Ajuste de prueba']);
        $this->assertDatabaseHas('presupuestos', ['area' => 'Finanzas', 'monto_presupuesto' => $presupuesto->monto_presupuesto + 200]);
    }

    public function test_get_proveedores_by_state()
    {
        proveedores::create([
            'nombre_proveedor' => 'Proveedor 1',
            'estado' => 'Activo'
        ]);

        $response = $this->getJson('/proveedores?estado=Activo');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'data' => [
                         '*' => [
                             'id',
                             'nombre_proveedor',
                             // ...otros campos...
                         ]
                     ]
                 ]);
    }

    public function test_get_proveedores()
    {
        proveedores::create([
            'nombre_proveedor' => 'Proveedor 1',
            'estado' => 'Activo'
        ]);

        $response = $this->getJson('/proveedores');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'id',
                         'nombre_proveedor',
                         // ...otros campos...
                     ]
                 ]);
    }

    public function test_get_proveedor()
    {
        $proveedor = proveedores::create([
            'nombre_proveedor' => 'Proveedor 1',
            'estado' => 'Activo'
        ]);

        $response = $this->getJson("/proveedores/{$proveedor->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $proveedor->id,
                     'nombre_proveedor' => $proveedor->nombre_proveedor,
                     // ...otros campos...
                 ]);
    }

    public function test_create_proveedor()
    {
        $user = Usuarios::factory()->create();

        $data = [
            'nombre_proveedor' => 'Nuevo Proveedor',
            'nombre_persona_contacto' => 'Contacto',
            'correo_contacto' => 'contacto@example.com',
            'pbx' => '12345678',
            'telefono_persona_contacto' => '87654321',
            'direccion' => 'Dirección',
            'descripcion' => 'Descripción',
            'tipo_proveedor' => 'Tipo',
            'estado' => 'Activo'
        ];

        $response = $this->actingAs($user)->postJson('/proveedores', $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Proveedor creado correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('proveedores', ['nombre_proveedor' => 'Nuevo Proveedor']);
    }

    public function test_update_proveedor()
    {
        $user = Usuarios::factory()->create();
        $proveedor = proveedores::factory()->create();

        $data = [
            'nombre_proveedor' => 'Proveedor Actualizado',
            'nombre_persona_contacto' => 'Contacto Actualizado',
            'correo_contacto' => 'contacto_actualizado@example.com',
            'pbx' => '12345678',
            'telefono_persona_contacto' => '87654321',
            'direccion' => 'Dirección Actualizada',
            'descripcion' => 'Descripción Actualizada',
            'tipo_proveedor' => 'Tipo Actualizado',
            'estado' => 'Activo'
        ];

        $response = $this->actingAs($user)->putJson("/proveedores/{$proveedor->id}", $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Proveedor actualizado correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('proveedores', ['nombre_proveedor' => 'Proveedor Actualizado']);
    }

    public function test_change_proveedor_state()
    {
        $user = Usuarios::factory()->create();
        $proveedor = proveedores::factory()->create(['estado' => 'Activo']);

        $response = $this->actingAs($user)->putJson("/proveedores/{$proveedor->id}/change");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Estado actualizado correctamente',
                     'status' => 200
                 ]);

        $proveedor->refresh();
        $this->assertEquals('Inactivo', $proveedor->estado);
    }

    public function test_get_actividades()
    {
        $user = Usuarios::factory()->create();
        $this->actingAs($user);

        $response = $this->getJson('/actividades');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'id',
                         'fecha_inicio',
                         'fecha_final',
                         'es_recurrente',
                         'tiempo_recurrencia',
                         'observaciones',
                         'tipo_actividad',
                         'id_usuario',
                         'estado',
                         'id_inspeccion',
                         'id_mantenimiento',
                         'id_supervision',
                         'fecha_limite'
                     ]
                 ]);
    }

    public function test_get_actividad()
    {
        $actividad = calendarizacion::factory()->create();

        $response = $this->getJson("/actividades/{$actividad->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $actividad->id,
                     'fecha_inicio' => $actividad->fecha_inicio,
                     'fecha_final' => $actividad->fecha_final,
                     'es_recurrente' => $actividad->es_recurrente,
                     'tiempo_recurrencia' => $actividad->tiempo_recurrencia,
                     'observaciones' => $actividad->observaciones,
                     'tipo_actividad' => $actividad->tipo_actividad,
                     'id_usuario' => $actividad->id_usuario,
                     'estado' => $actividad->estado,
                     'id_inspeccion' => $actividad->id_inspeccion,
                     'id_mantenimiento' => $actividad->id_mantenimiento,
                     'id_supervision' => $actividad->id_supervision,
                     'fecha_limite' => $actividad->fecha_limite
                 ]);
    }

    public function test_create_actividad()
    {
        $user = Usuarios::factory()->create();
        $this->actingAs($user);

        $data = [
            'fecha_inicio' => '2023-01-01',
            'fecha_final' => '2023-01-02',
            'es_recurrente' => false,
            'tiempo_recurrencia' => null,
            'observaciones' => 'Observaciones de prueba',
            'tipo_actividad' => 'Mantenimiento a infraestructura',
            'id_usuario' => $user->id,
            'estado' => 'Pendiente',
            'id_inspeccion' => null,
            'id_mantenimiento' => null,
            'id_supervision' => null,
            'fecha_limite' => '2023-12-31'
        ];

        $response = $this->postJson('/actividades', $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Actividad creada correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('calendarizacion', ['observaciones' => 'Observaciones de prueba']);
    }

    public function test_update_actividad()
    {
        $user = Usuarios::factory()->create();
        $this->actingAs($user);
        $actividad = calendarizacion::factory()->create();

        $data = [
            'fecha_inicio' => '2023-01-01',
            'fecha_final' => '2023-01-02',
            'es_recurrente' => false,
            'tiempo_recurrencia' => null,
            'observaciones' => 'Observaciones actualizadas',
            'tipo_actividad' => 'Mantenimiento a infraestructura',
            'id_usuario' => $user->id,
            'estado' => 'Pendiente',
            'id_inspeccion' => null,
            'id_mantenimiento' => null,
            'id_supervision' => null,
            'fecha_limite' => '2023-12-31'
        ];

        $response = $this->putJson("/actividades/{$actividad->id}", $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Actividad actualizada correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('calendarizacion', ['observaciones' => 'Observaciones actualizadas']);
    }

    public function test_change_actividad_state()
    {
        $user = Usuarios::factory()->create();
        $this->actingAs($user);
        $actividad = calendarizacion::factory()->create(['estado' => 'Pendiente']);

        $response = $this->putJson("/actividades/{$actividad->id}/change");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Estado actualizado correctamente',
                     'status' => 200
                 ]);

        $actividad->refresh();
        $this->assertEquals('Realizado', $actividad->estado);
    }

    public function test_get_activos()
    {
        // Crear instalación y activo de prueba
        $instalacion = instalaciones::create([
            'nombre' => 'Instalación Test',
            'estado' => 'Activo'
        ]);

        $activo = activos::create([
            'nombre' => 'Activo Test',
            'codigo' => 'TEST001',
            'descripcion' => 'Descripción de prueba',
            'precio' => 1000.00,
            'fecha_adquisicion' => '2023-01-01',
            'id_instalacion' => $instalacion->id,
            'estado' => 'Activo'
        ]);

        $response = $this->getJson('/activos');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'meta' => ['page', 'pages', 'perpage', 'total'],
                     'data' => [
                         '*' => [
                             'id',
                             'nombre',
                             'codigo',
                             'descripcion',
                             'precio',
                             'fecha_adquisicion',
                             'id_instalacion',
                             'nombre_instalacion',
                             'estado',
                             'created_at',
                             'updated_at'
                         ]
                     ]
                 ]);
    }

    public function test_get_ubicaciones()
    {
        // Crear datos de prueba
        $campus = campus::create(['nombre' => 'Campus Test']);
        $edificio = edificios::create([
            'nombre' => 'Edificio Test',
            'id_campus' => $campus->id
        ]);
        $nivel = niveles::create([
            'nombre' => 'Nivel Test',
            'id_edificio' => $edificio->id
        ]);
        $instalacion = instalaciones::create([
            'nombre' => 'Instalación Test',
            'id_nivel' => $nivel->id,
            'estado' => 'Activo'
        ]);

        $response = $this->getJson('/ubicaciones');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'id',
                         'nombre',
                         'edificios' => [
                             '*' => [
                                 'id',
                                 'nombre',
                                 'niveles' => [
                                     '*' => [
                                         'id',
                                         'nombre',
                                         'instalaciones' => [
                                             '*' => [
                                                 'id',
                                                 'nombre'
                                             ]
                                         ]
                                     ]
                                 ]
                             ]
                         ]
                     ]
                 ]);
    }

    public function test_create_activo()
    {
        $user = Usuarios::factory()->create();
        $instalacion = instalaciones::create([
            'nombre' => 'Instalación Test',
            'estado' => 'Activo'
        ]);

        $data = [
            'nombre' => 'Nuevo Activo',
            'codigo' => 'TEST001',
            'descripcion' => 'Descripción del nuevo activo',
            'precio' => 1000.00,
            'fecha_adquisicion' => '2023-01-01',
            'id_instalacion' => $instalacion->id,
            'generarQR' => true
        ];

        $response = $this->actingAs($user)->postJson('/activos', $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Activo creado correctamente con código QR',
                     'status' => 200
                 ])
                 ->assertJsonStructure([
                     'success',
                     'status',
                     'activo',
                     'qr_url'
                 ]);

        $this->assertDatabaseHas('activos', [
            'nombre' => 'Nuevo Activo',
            'codigo' => 'TEST001'
        ]);

        $this->assertDatabaseHas('logs', [
            'id_usuario' => $user->id,
            'modulo' => 'Gestión de activos'
        ]);
    }

    public function test_update_activo()
    {
        $user = Usuarios::factory()->create();
        $instalacion = instalaciones::create([
            'nombre' => 'Instalación Test',
            'estado' => 'Activo'
        ]);

        $activo = activos::create([
            'nombre' => 'Activo Original',
            'codigo' => 'TEST001',
            'descripcion' => 'Descripción original',
            'precio' => 1000.00,
            'fecha_adquisicion' => '2023-01-01',
            'id_instalacion' => $instalacion->id,
            'estado' => 'Activo'
        ]);

        $data = [
            'nombre' => 'Activo Actualizado',
            'codigo' => 'TEST002',
            'descripcion' => 'Descripción actualizada',
            'precio' => 2000.00,
            'fecha_adquisicion' => '2023-02-01',
            'id_instalacion' => $instalacion->id
        ];

        $response = $this->actingAs($user)->putJson("/activos/{$activo->id}", $data);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Datos actualizados correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('activos', [
            'id' => $activo->id,
            'nombre' => 'Activo Actualizado',
            'codigo' => 'TEST002'
        ]);
    }

    public function test_change_activo_state()
    {
        $user = Usuarios::factory()->create();
        $instalacion = instalaciones::create([
            'nombre' => 'Instalación Test',
            'estado' => 'Activo'
        ]);

        $activo = activos::create([
            'nombre' => 'Activo Test',
            'codigo' => 'TEST001',
            'descripcion' => 'Descripción de prueba',
            'precio' => 1000.00,
            'fecha_adquisicion' => '2023-01-01',
            'id_instalacion' => $instalacion->id,
            'estado' => 'Activo'
        ]);

        $response = $this->actingAs($user)->putJson("/activos/{$activo->id}/change");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => 'Estado actualizado correctamente',
                     'status' => 200
                 ]);

        $this->assertDatabaseHas('activos', [
            'id' => $activo->id,
            'estado' => 'Inactivo'
        ]);
    }

    // ...otras pruebas unitarias...

    public function test_get_niveles()
    {
        // Crear datos de prueba
        $campus = campus::create(['nombre' => 'Campus Test']);
        $edificio = edificios::create([
            'nombre' => 'Edificio Test',
            'id_campus' => $campus->id
        ]);
        $nivel = niveles::create([
            'nombre' => 'Nivel Test',
            'descripcion' => 'Descripción nivel test',
            'id_edificio' => $edificio->id,
            'estado' => 'Activo'
        ]);

        $response = $this->getJson('/niveles');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'meta' => ['page', 'pages', 'perpage', 'total'],
                    'data' => [
                        '*' => [
                            'id',
                            'nombre',
                            'descripcion',
                            'id_edificio',
                            'nombre_edificio',
                            'campues_id',
                            'estado',
                            'created_at',
                            'updated_at'
                        ]
                    ]
                ]);
    }

    public function test_create_nivel()
    {
        $user = Usuarios::factory()->create();
        $edificio = edificios::factory()->create();

        $data = [
            'nombre' => 'Nuevo Nivel',
            'descripcion' => 'Descripción del nuevo nivel',
            'id_edificio' => $edificio->id
        ];

        $response = $this->actingAs($user)->postJson('/niveles', $data);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => 'Nivel creado correctamente',
                    'status' => 200
                ]);

        $this->assertDatabaseHas('niveles', [
            'nombre' => 'Nuevo Nivel',
            'descripcion' => 'Descripción del nuevo nivel'
        ]);
    }

    public function test_update_nivel()
    {
        $user = Usuarios::factory()->create();
        $edificio = edificios::factory()->create();
        $nivel = niveles::create([
            'nombre' => 'Nivel Original',
            'descripcion' => 'Descripción original',
            'id_edificio' => $edificio->id,
            'estado' => 'Activo'
        ]);

        $data = [
            'nombre' => 'Nivel Actualizado',
            'descripcion' => 'Descripción actualizada',
            'id_edificio' => $edificio->id
        ];

        $response = $this->actingAs($user)->putJson("/niveles/{$nivel->id}", $data);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => 'Datos actualizados correctamente',
                    'status' => 200
                ]);
    }

    public function test_get_instalaciones()
    {
        $campus = campus::factory()->create();
        $edificio = edificios::factory()->create(['id_campus' => $campus->id]);
        $nivel = niveles::factory()->create(['id_edificio' => $edificio->id]);
        $instalacion = instalaciones::create([
            'nombre' => 'Instalación Test',
            'descripcion' => 'Descripción instalación',
            'tipo_instalacion' => 'Tipo Test',
            'id_nivel' => $nivel->id,
            'estado' => 'Activo'
        ]);

        $response = $this->getJson('/instalaciones');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'meta',
                    'data' => [
                        '*' => [
                            'id',
                            'nombre',
                            'descripcion',
                            'tipo_instalacion',
                            'id_nivel',
                            'nivel',
                            'estado',
                            'created_at',
                            'updated_at'
                        ]
                    ]
                ]);
    }

    public function test_create_instalacion()
    {
        $user = Usuarios::factory()->create();
        $nivel = niveles::factory()->create();

        $data = [
            'nombre' => 'Nueva Instalación',
            'descripcion' => 'Descripción de la instalación',
            'tipo_instalacion' => 'Tipo Test',
            'id_nivel' => $nivel->id
        ];

        $response = $this->actingAs($user)->postJson('/instalaciones', $data);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => 'Instalación creada correctamente',
                    'status' => 200
                ]);
    }

    public function test_get_edificios()
    {
        $campus = campus::factory()->create();
        $edificio = edificios::create([
            'nombre' => 'Edificio Test',
            'descripcion' => 'Descripción edificio',
            'id_campus' => $campus->id,
            'estado' => 'Activo'
        ]);

        $response = $this->getJson('/edificios');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'meta',
                    'data' => [
                        '*' => [
                            'id',
                            'nombre',
                            'descripcion',
                            'id_campus',
                            'nombre_campus',
                            'estado',
                            'created_at',
                            'updated_at'
                        ]
                    ]
                ]);
    }

    public function test_create_edificio()
    {
        $user = Usuarios::factory()->create();
        $campus = campus::factory()->create();

        $data = [
            'nombre' => 'Nuevo Edificio',
            'descripcion' => 'Descripción del edificio',
            'id_campus' => $campus->id
        ];

        $response = $this->actingAs($user)->postJson('/edificios', $data);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => 'Edificio creado correctamente',
                    'status' => 200
                ]);
    }
}
