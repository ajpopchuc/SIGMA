<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use App\Models\usuarios;
use App\Models\roles;
use App\Models\empleados;
use App\Models\permisos;
use App\Models\roles_permisos;
use App\Models\tipos_de_deterioro_falla; // Asegúrate de que este modelo exista

class Seeders extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permisos = [
            "Ver todas las calendarizaciones,Calendarizacion",
            "Ver calendarizacion,Calendarizacion",
            "Crear actividad,Calendarizacion",
            "Editar actividad,Calendarizacion",
            "Ver actividad,Calendarizacion",
            "Ejecutar actividad,Calendarizacion",
            "Ver resumen,Calendarizacion",
            "Ver usuarios,Gestión de personal",
            "Crear usuario,Gestión de personal",
            "Cambiar contraseña,Gestión de personal",
            "Ver empleados,Gestión de personal",
            "Crear empleado,Gestión de personal",
            "Editar empleado,Gestión de personal",
            "Activar o desactivar empleado,Gestión de personal",
            "Ver roles,Gestión de personal",
            "Crear rol,Gestión de personal",
            "Editar rol,Gestión de personal",
            "Ver proveedores,Administrar proveedores",
            "Crear proveedor,Administrar proveedores",
            "Editar proveedor,Administrar proveedores",
            "Activar o desactivar proveedor,Administrar proveedores",
            "Crear usuario proveedor,Administrar proveedores",
            "Ver campus,Facultades",
            "Crear campus,Facultades",
            "Editar campus,Facultades",
            "Activar o desactivar campus,Facultades",
            "Ver edificios,Facultades",
            "Crear edificio,Facultades",
            "Editar edificio,Facultades",
            "Activar o desactivar edificio,Facultades",
            "Ver niveles,Facultades",
            "Crear nivel,Facultades",
            "Editar nivel,Facultades",
            "Activar o desactivar nivel,Facultades",
            "Ver instalaciones,Facultades",
            "Crear instalación,Facultades",
            "Editar instalación,Facultades",
            "Activar o desactivar instalación,Facultades",
            "Ver presupuestos,Gestión de presupuesto",
            "Crear presupuesto,Gestión de presupuesto",
            "Editar presupuesto,Gestión de presupuesto",
            "Ver ajustes de presupuesto,Gestión de presupuesto",
            "Crear ajuste de presupuesto,Gestión de presupuesto",
            "Ver tablero de presupuesto,Gestión de presupuesto",
            "Imprimir tablero de presupuesto,Gestión de presupuesto",
            "Ver activos,Gestión de activos",
            "Crear activo,Gestión de activos",
            "Editar activo,Gestión de activos",
            "Activar o desactivar activo,Gestión de activos",
            "Ver recursos,Gestión de recursos",
            "Crear recurso,Gestión de recursos",
            "Editar recurso,Gestión de recursos",
            "Activar o desactivar recurso,Gestión de recursos",
            "Ver ajustes de recurso,Gestión de recursos",
            "Crear ajuste de recurso,Gestión de recursos",
            "Ver compras,Gestión de compras",
            "Crear compra,Gestión de compras",
            "Anular compra,Gestión de compras",
            "Ver recibo de compra,Gestión de compras",
            "Imprimir recibo de compra,Gestión de compras",
            "Ver inspecciones de equipos,Inspecciones",
            "Ver detalle de inspecciones de equipos,Inspecciones",
            "Calendarizar mantenimiento de equipos,Inspecciones",
            "Ver inspecciones de infraestructura,Inspecciones",
            "Ver detalle de inspecciones de infraestructura,Inspecciones",
            "Calendarizar mantenimiento de infraestructura,Inspecciones",
            "Ver mantenimientos de equipos,Mantenimientos",
            "Ver detalle de mantenimientos de equipos,Mantenimientos",
            "Calendarizar supervisión de mantenimientos de equipos,Mantenimientos",
            "Ver mantenimientos de infraestructura,Mantenimientos",
            "Ver detalle de mantenimientos de infraestructura,Mantenimientos",
            "Calendarizar supervisión de mantenimientos de infraestructura,Mantenimientos",
            "Ver mantenimientos externos,Mantenimientos externos",
            "Ver detalle de mantenimientos externos,Mantenimientos externos",
            "Pagar mantenimiento externo,Mantenimientos externos",
            "Calendarizar supervisión de mantenimientos externos,Mantenimientos externos",
            "Ver supervisión de equipos,Supervisiones",
            "Ver detalle de supervisión de equipos,Supervisiones",
            "Ver supervisión de infraestructura,Supervisiones",
            "Ver detalle de supervisión de infraestructura,Supervisiones",
            "Ver reporte stock de recursos, Reporteria",
            "Imprimir reporte stock de recursos, Reporteria",
            "Ver reporte gasto total, Reporteria",
            "Imprimir reporte gasto total, Reporteria",
            "Ver reporte actividades de usuario, Reporteria",
            "Imprimir reporte actividades de usuario, Reporteria",
            "Ver reporte horas hombre, Reporteria",
            "Imprimir reporte horas hombre, Reporteria"
        ];
        //REPORTERIA FALTAN PERMISOS

        Log::info('Seeder started...');

        try {
            // Seprarar permisos por comas e insertar en la base de datos
            foreach ($permisos as $permiso) {
                $permiso = explode(',', $permiso);
                permisos::create([
                    'nombre' => $permiso[0],
                    'modulo' => $permiso[1],
                ]);
            }

            // Crear rol de Administrador
            $rol = Roles::create([
                'nombre' => 'Administrador',
            ]);

            // Asignar todos los permisos al rol de administrador
            $permisos = Permisos::all();
            foreach ($permisos as $permiso) {
                Roles_Permisos::create([
                    'id_rol' => $rol->id,
                    'id_permiso' => $permiso->id,
                ]);
            }

            Log::info('Rol creado: ' . $rol->id);


            // Crear usuario
            $usuario = Usuarios::create([
                'usuario' => 'admin',
                'contraseña' => bcrypt('admin'), 
                'estado' => 'Activo', 
                'id_rol' => $rol->id,
            ]);

            // Crear empleado
            $empleado = Empleados::create([
                'nombre' => 'Administrador',
                'apellido' => 'Administrador',
                'correo_electronico' => 'admin@admin.com',
                'id_usuario' => $usuario->id,
                'estado' => 'Activo',
            ]);

            Log::info('Usuario creado: ' . $usuario->id);

            // Insertar tipos de deterioro
            $tiposDeDeterioro = [
                "Grietas/Fisuras (juntas)",
                "Suciedad/Manchas",
                "Fotos de Humedad/Hongos",
                "Deformaciones (alineamiento de pared o desplome)",
                "Desgaste de las láminas",
                "Despegue de láminas",
                "Condición de los acabados de pared como revestimientos, enchapes u otros (grietas y fisuras, suciedad, manchas, etc.)",
                "Condición de la pintura (abombamientos, despegues, manchas, desconchados u otros).",
                "Otros: (Especificar)",
            ];

            foreach ($tiposDeDeterioro as $deteriorio) {
                tipos_de_deterioro_falla::create([
                    'deteriorio_o_falla' => $deteriorio,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error seeding database: ' . $e->getMessage());
        }

        Log::info('Seeder completed.');
    }
}
