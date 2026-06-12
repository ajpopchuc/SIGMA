<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\usuarios;
use Illuminate\Support\Facades\Session;
use App\Models\logs;
use App\Models\empleados;
use App\Models\permisos;
use App\Models\proveedores;
use App\Models\roles_permisos;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class loginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'usuario' => 'required',
            'password' => 'required'
        ]);
        $credentials = $request->only('usuario', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user(); // Obtener el usuario autenticado
            $token = $user->createToken('token-name')->plainTextToken;
            Session::put('id_usuario', $user->id);
            $log = new Logs();
            $log->id_usuario = $user->id;
            $log->descripcion = "Inicio sesión el usuario ".$user->usuario;
            $log->modulo  = "Inicio de sesión";
            $log->save();
            $empleado = empleados::where('id_usuario', $user->id)->first();
            $roles_permisos = roles_permisos::where('id_rol', $user->id_rol)->get();
            $permisos = [];
            foreach ($roles_permisos as $roles_permiso) {
                $permiso = permisos::where('id', $roles_permiso->id_permiso)->first();
                array_push($permisos, $permiso->nombre);
            }
            return response()->json(['id_usuario' => $user->id, 'nombre_usuario' => $empleado->nombre, 'rol' => $user->id_rol, 'token' => $token, 'permisos'=>$permisos], 200);
        }

        return response()->json(['error' => 'Usuario o contraseña incorrectos'], 401);
    }

    public function logout(Request $request)
    {
        try {
            // Verificar si el usuario está autenticado
            $user = $request->user();
            
            if ($user) {
                // Revocar todos los tokens del usuario
                $user->tokens()->delete();
                $log = new Logs();
                $log->id_usuario = $user->id;
                $log->descripcion = 'Cerro sesión el usuario '.$user->usuario;
                $log->modulo  = "Inicio de sesión";
                $log->save();
                // No necesitas llamar a Auth::logout() ya que estás trabajando con tokens
                return response()->json([
                    'message' => 'Sesión cerrada correctamente'
                ], 200);
            } else {
                return response()->json([
                    'error' => 'No hay usuario autenticado'
                ], 401);
            }
        } catch (\Throwable $e) {
            // Captura cualquier excepción que ocurra durante el proceso de logout
            return response()->json(['error' => 'Error al cerrar sesión: ' . $e->getMessage()], 500);
        }
    }

    public function register(request $request)
    {
        $validator = Validator::make($request->all(), [
            'usuario' => 'required|string|min:3|max:50',
            'contraseña' => 'required|string|min:8',
            'nombre' => 'required|string|min:2|max:50',
            'apellido' => 'required|string|min:2|max:50',
            'correo_electronico' => 'required|email|max:255|unique:empleados,correo_electronico',
            'id_rol' => 'required|exists:roles,id'
        ], [
            'usuario.required' => 'El campo usuario es obligatorio.',
            'usuario.min' => 'El usuario debe tener al menos 3 caracteres.',
            'usuario.max' => 'El usuario no debe tener más de 50 caracteres.',
            'contraseña.required' => 'Debe ingresar una contraseña.',
            'contraseña.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'contraseña.max' => 'La contraseña no debe tener más de 255 caracteres.',
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 2 caracteres.',
            'nombre.max' => 'El nombre no debe tener más de 50 caracteres.',
            'apellido.required' => 'El campo apellido es obligatorio.',
            'apellido.min' => 'El apellido debe tener al menos 2 caracteres.',
            'apellido.max' => 'El apellido no debe tener más de 50 caracteres.',
            'correo_electronico.required' => 'El campo correo electrónico es obligatorio.',
            'correo_electronico.email' => 'Debe ingresar un correo electrónico válido.',
            'correo_electronico.max' => 'El correo electrónico no debe tener más de 255 caracteres.',
            'correo_electronico.unique' => 'El correo electrónico ya está registrado.',
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
            $usuario = new usuarios();
            $usuario->usuario = $_POST['usuario'];
            $usuario->contraseña = bcrypt($_POST['contraseña']);
            $usuario->id_rol = $_POST['id_rol'];
            $usuario->estado = "Activo";
            $usuario->save();

            //empleado
            $empleado = new empleados();
            $empleado->nombre = $_POST['nombre'];
            $empleado->apellido = $_POST['apellido'];
            $empleado->correo_electronico = $_POST['correo_electronico'];
            $empleado->id_usuario = $usuario->id;
            $empleado->estado = "Activo";
            $empleado->save();

            //logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó el usuario ".$usuario->usuario;
            $log->modulo  = "Gestión de personal";
            $log->save();

            DB::commit();
            return response()->json(['success' => 'Empleado creado correctamente', 'status' => 200],200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear el usuario', 'error' => $e], 401);
        }
    }

    public function registerProveedorUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'usuario' => 'required|string|min:3|max:50',
            'contraseña' => 'required|string|min:8',
            'id_rol' => 'required|exists:roles,id',
            'id_proveedor' => 'required|exists:proveedores,id'
        ], [
            'usuario.required' => 'El campo usuario es obligatorio.',
            'usuario.min' => 'El usuario debe tener al menos 3 caracteres.',
            'usuario.max' => 'El usuario no debe tener más de 50 caracteres.',
            'contraseña.required' => 'Debe ingresar una contraseña.',
            'contraseña.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'contraseña.max' => 'La contraseña no debe tener más de 255 caracteres.',
            'id_rol.required' => 'El campo rol es obligatorio.',
            'id_rol.exists' => 'El rol seleccionado no es válido.',
            'id_proveedor.required' => 'El campo id_proveedor es obligatorio.',
            'id_proveedor.exists' => 'El proveedor seleccionado no es válido.'
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422);
        }
    
        try {
            // Verificar si el proveedor ya tiene un usuario asignado
            $proveedor = proveedores::find($request->id_proveedor);
            if ($proveedor->id_usuario) {
                return response()->json([
                    'errors' => [
                        'message' => ['Este proveedor ya tiene un usuario asignado.' ]
                    ]
                ], 409); // Código 409 para conflicto
            }
    
            DB::beginTransaction();
    
            // Crear el usuario
            $usuario = new Usuarios();
            $usuario->usuario = $request->usuario;
            $usuario->contraseña = bcrypt($request->contraseña);
            $usuario->id_rol = $request->id_rol;
            $usuario->estado = "Activo";
            $usuario->save();
    
            // Asignar el id del usuario en la tabla de proveedores
            $proveedor->id_usuario = $usuario->id;
            $proveedor->save();
    
            // Registrar la acción en los logs
            $log = new Logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó el usuario ".$usuario->usuario." para el proveedor con ID ".$proveedor->id;
            $log->modulo = "Gestión de proveedores";
            $log->save();
    
            DB::commit();
            return response()->json(['success' => 'Usuario de proveedor creado correctamente', 'status' => 200], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear el usuario de proveedor', 'error' => $e->getMessage()], 500);
        }
    }
    

}