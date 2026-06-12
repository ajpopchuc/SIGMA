<?php

namespace App\Http\Controllers;

use App\Models\empleados;
use Illuminate\Http\Request;
use App\Models\usuarios;
use App\Models\roles;
use App\Models\proveedores;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\logs;
use Illuminate\Support\Facades\Validator;

class usuariosController extends Controller
{
    public function get_all()
{
    $users = Usuarios::all();
    $dataEmpleados = [];
    $dataUsuarios = [];

    foreach ($users as $user) {
        $empleado = empleados::where('id_usuario', $user->id)->first();
        $rol = roles::findOrFail($user->id_rol);
        $rol_name = $rol->nombre;

        if ($empleado) {
            // Datos específicos de empleados
            $modelEmpleado = [
                "id" => $user->id,
                "id_empleado" => $empleado->id,
                "nombre" => $empleado->nombre,
                "apellido" => $empleado->apellido,
                "usuario" => $user->usuario,
                "correo_electronico" => $empleado->correo_electronico,
                "estado" => $user->estado,
                "rol" => $rol_name,
                "id_rol" => $user->id_rol,
                "created_at" => $user->created_at,
                "updated_at" => $user->updated_at,
                "actions" => ""
            ];
            array_push($dataEmpleados, $modelEmpleado);
        }

        // Datos generales de usuarios (incluyendo proveedores)
        $modelUsuario = [
            "id" => $user->id,
            "usuario" => $user->usuario,
            "estado" => $user->estado,
            "rol" => $rol_name,
            "id_rol" => $user->id_rol,
            "tipo" => $empleado ? "Empleado" : "Proveedor",
            "nombre" => $empleado ? $empleado->nombre : "", // Inicialmente vacío
            "created_at" => $user->created_at,
            "updated_at" => $user->updated_at,
            "actions" => ""
        ];
        
        // Si es proveedor, agregar información adicional
        if (!$empleado) {
            $proveedor = proveedores::where('id_usuario', $user->id)->first();
            if ($proveedor) {
                $modelUsuario["nombre_proveedor"] = $proveedor->nombre_proveedor;
                $modelUsuario["id_proveedor"] = $proveedor->id;
                $modelUsuario["nombre"] = $proveedor->nombre_proveedor; // Actualizamos el nombre si es proveedor
            }
        } else {
            $modelUsuario["nombre"] = $empleado->nombre . " " . $empleado->apellido; // Nombre completo si es empleado
        }

        array_push($dataUsuarios, $modelUsuario);
    }

    $metaEmpleados = [
        "page" => 1,
        "pages" => 1,
        "perpage" => count($dataEmpleados),
        "total" => count($dataEmpleados)
    ];

    $metaUsuarios = [
        "page" => 1,
        "pages" => 1,
        "perpage" => count($dataUsuarios),
        "total" => count($dataUsuarios)
    ];

    $response = [
        "empleados" => [
            "meta" => $metaEmpleados,
            "data" => $dataEmpleados
        ],
        "usuarios" => [
            "meta" => $metaUsuarios,
            "data" => $dataUsuarios
        ]
    ];

    return response()->json($response);
}
    

    public function change($id, Request $request)
    {
        try {
            Db::beginTransaction();
            $user = usuarios::findOrFail($id);
            $empleado = empleados::where('id_usuario', $user->id)->first();
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            if ($user->estado === "Activo") {
                $user->estado = "Inactivo";
                $log->descripcion = "Desactivó el empleado ".$empleado->nombre;
                $empleado->estado = "Inactivo";
            } else {
                $user->estado = "Activo";
                $log->descripcion = "Activó el empleado ".$empleado->nombre;
                $empleado->estado = "Activo";
            }
            $log->modulo = "Gestión de personal";
            $log->save();
            $user->save();
            DB::commit();
            return response()->json(['success' => 'Estado actualizado correctamente', 'status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al cambiar el estado del usuario', 'error' => $e], 500);
        }
    }
    
    public function update(Request $request, $id) {

        $validator = Validator::make($request->all(), [
            'usuario' => 'required|string|min:3|max:50',
            'nombre' => 'required|string|min:2|max:50',
            'apellido' => 'required|string|min:2|max:50',
            'correo_electronico' => 'required|email|max:255',
            'id_rol' => 'required|exists:roles,id'
        ], [
            'usuario.required' => 'El campo usuario es obligatorio.',
            'usuario.min' => 'El usuario debe tener al menos 3 caracteres.',
            'usuario.max' => 'El usuario no debe tener más de 50 caracteres.',
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 2 caracteres.',
            'nombre.max' => 'El nombre no debe tener más de 50 caracteres.',
            'apellido.required' => 'El campo apellido es obligatorio.',
            'apellido.min' => 'El apellido debe tener al menos 2 caracteres.',
            'apellido.max' => 'El apellido no debe tener más de 50 caracteres.',
            'correo_electronico.required' => 'El campo correo electrónico es obligatorio.',
            'correo_electronico.email' => 'Debe ingresar un correo electrónico válido.',
            'correo_electronico.max' => 'El correo electrónico no debe tener más de 255 caracteres.',
            'id_rol.required' => 'El campo rol es obligatorio.',
            'id_rol.exists' => 'El rol seleccionado no es válido.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }

        try {
            DB::beginTransaction();
            //usuario
            $usuario = usuarios::findOrFail($id);
            $usuario->usuario = $_POST['usuario'];
            $usuario->id_rol = $_POST['id_rol'];
            $usuario->estado = "Activo";
            $usuario->save();

            //logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó el usuario ".$usuario->usuario;
            $log->modulo  = "Gestión de personal";
            $log->save();

            //empleado
            $empleado = empleados::where('id_usuario', $usuario->id)->first();
            $empleado->nombre = $_POST['nombre'];
            $empleado->apellido = $_POST['apellido'];
            $empleado->correo_electronico = $_POST['correo_electronico'];
            $empleado->id_usuario = $usuario->id;
            $empleado->estado = "Activo";
            $empleado->save();

            //logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó el empleado ".$empleado->nombre;
            $log->modulo  = "Gestión de personal";
            $log->save();
            

            DB::commit();
            return response()->json(['success' => 'Empleado actualizado correctamente', 'status' => 200],200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar el usuario', 'error' => $e], 500);
        }
    }

    public function change_password($id, Request $request) {

        $validator = Validator::make($request->all(), [
            'nueva_contrasena' => 'required|string|min:8',
            'confirmar_contrasena' => 'required|string|min:8|same:nueva_contrasena'
        ], [
            'nueva_contrasena.required' => 'El campo nueva contraseña es obligatorio.',
            'nueva_contrasena.min' => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'confirmar_contrasena.required' => 'El campo confirmar contraseña es obligatorio.',
            'confirmar_contrasena.min' => 'La confirmación de la contraseña debe tener al menos 8 caracteres.',
            'confirmar_contrasena.same' => 'La confirmación de la contraseña no coincide con la nueva contraseña.'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }
        try {
            DB::beginTransaction();

            $usuario = usuarios::findOrFail($id);
            $usuario->contraseña = bcrypt ($request->nueva_contrasena);
            $usuario->save();

            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Cambio de contraseña del usuario ".$usuario->usuario;
            $log->modulo = "Gestión de personal";
            $log->save();

            DB::commit();
            return response()->json(['success' => 'Contraseña actualizada correctamente', 'status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message'=> 'Error al cambiar la contraseña', 'error' => $e], 500);
        }
    }
}