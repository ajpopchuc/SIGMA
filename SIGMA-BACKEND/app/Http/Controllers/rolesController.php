<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\usuarios;
use App\Models\roles;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\permisos;
use App\Models\roles_permisos;
use App\Models\logs;
use Illuminate\Support\Facades\Log;

class rolesController extends Controller
{

    public function obtener_permisos()
    {
        $permisos = permisos::orderBy("id","asc")->get();
        return response()->json($permisos);
    }

    public function obtener_permisos_rol($id)
    {
        $permisos_obtenidos = roles_permisos::where("id_rol",$id)->get();
        $permisos = [];
        foreach ($permisos_obtenidos as $permiso) {
            $data = $permiso->id_permiso;
            array_push($permisos,$data);
        }
        return response()->json($permisos);
    }

    public function get_rol_para_usuario()
    {
        $data = [];
        $rols = roles::all();
        foreach ($rols as $rol) {
            $model = [
                "id" => $rol->id,
                "nombre" => $rol->nombre,
                "created_at" => $rol->created_at,
                "updated_at" => $rol->updated_at,
                "actions" => ""
            ];
            array_push($data, $model);
        }

        $response = [
            "data" => $data
        ];

        return response()->json($response);
    }

    public function crear_rol(Request $request)
    {
        $permisos = $request->permisos;

        $request->validate([
            'nombre' => 'required',
            'permisos'=> 'required',
        ]);

        try {
            DB::beginTransaction();
            $rol = new roles();
            $rol->nombre = $request->input('nombre');
            $rol->save();
            if (!empty($permisos)) {
                foreach ($permisos as $key => $permiso) {
                    $rol_permiso = new roles_permisos();
                    $rol_permiso->id_rol = $rol->id;
                    $rol_permiso->id_permiso = $permiso;
                    $rol_permiso->save();
                }
            }
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó el rol ".$rol->nombre;
            $log->modulo  = "Gestión de personal";
            $log->save();
            DB::commit();
            $response = [
                "message" => "Rol creado correctamente",
                "rol" => $rol,
                "status" => 200
            ];
            return response()->json($response, 200);

        } catch (\Exception $e) {
            DB::rollBack();
            $response = [
                "message" => "Error al crear el rol",
                "error" => $e->getMessage()
            ];
            return response()->json($response, 500);
        }
    }

    public function actualizar_rol(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required',
            'permisos'=> 'required',
        ]);
        
        $permisos = $request->permisos;

        try {
            DB::beginTransaction();
            $rol = roles::find($id);
            $rol->nombre = $request->input('nombre');
            $rol->save();
            if (!empty($permisos)) {
                roles_permisos::where("id_rol",$id)->delete();
                foreach ($permisos as $key => $permiso) {
                    $rol_permiso = new roles_permisos();
                    $rol_permiso->id_rol = $rol->id;
                    $rol_permiso->id_permiso = $permiso;
                    $rol_permiso->save();
                }
            }
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizo el rol ".$rol->nombre;
            $log->modulo  = "Gestión de personal";
            $log->save();
            DB::commit();
            $response = [
                "message" => "Rol actualizado correctamente",
                "rol" => $rol,
                "status" => 200
            ];
            return response()->json($response, 200);

        } catch (\Exception $e) {
            DB::rollBack();
            $response = [
                "message" => "Error al actualizar el rol",
                "error" => $e->getMessage()
            ];
            return response()->json($response, 500);
        }
    }

}
