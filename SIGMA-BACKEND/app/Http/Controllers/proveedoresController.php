<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\proveedores;
use Illuminate\Support\Facades\DB;
use App\Models\logs;

class proveedoresController extends Controller
{
        public function get_proveedoresBystate(Request $request)
    {
        try {
            $estado = $request->query('estado', 'Activo'); // Por defecto 'Activo' si no se especifica
            
            $proveedores = proveedores::where('estado', $estado)
                ->orderBy('id', 'asc')
                ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $proveedores
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener los proveedores: ' . $e->getMessage()
            ], 500);
        }
    }
    public function get_proveedores()
    {
        $proveedores = proveedores::orderBy("id", "asc")->get();
        return response()->json($proveedores);
    }


    public function get_proveedor($id)
    {
        $proveedor = proveedores::find($id);
        if ($proveedor) {
            return response()->json($proveedor);
        } else {
            return response()->json(['message' => 'Proveedor no encontrado'], 404);
        }
    }

    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'nombre_proveedor' => 'required|string|max:255',
            'nombre_persona_contacto' => 'required|string|max:255',
            'correo_contacto' => 'nullable|string|max:100|email',
            'pbx' => 'nullable|string|max:8|min:8',
            'telefono_persona_contacto' => 'required|string|max:50',
            'direccion' => 'required|string|max:500',
            'descripcion' => 'nullable|string|max:1000',
            'tipo_proveedor' => 'required|string|max:100',
            'estado' => 'required|string|in:Activo,Inactivo'
        ], [
            'nombre_proveedor.required' => 'El campo nombre del proveedor es obligatorio.',
            'nombre_proveedor.string' => 'El campo nombre del proveedor debe ser una cadena de texto.',
            'nombre_proveedor.max' => 'El campo nombre del proveedor no puede tener más de 255 caracteres.',
    
            'nombre_persona_contacto.required' => 'El campo nombre de la persona de contacto es obligatorio.',
            'nombre_persona_contacto.string' => 'El campo nombre de la persona de contacto debe ser una cadena de texto.',
            'nombre_persona_contacto.max' => 'El campo nombre de la persona de contacto no puede tener más de 255 caracteres.',
    
            'correo_contacto.required' => 'El campo correo de contacto es obligatorio.',
            'correo_contacto.string' => 'El campo correo de contacto debe ser una cadena de texto.',
            'correo_contacto.max' => 'El campo correo de contacto no puede tener más de 100 caracteres.',  
            'correo_contacto.email' => 'El campo correo de contacto debe ser un correo electrónico válido.', 

            'pbx.string' => 'El campo PBX debe ser una cadena de texto.',
            'pbx.max' => 'El campo PBX no puede tener más de 8 caracteres.',
            'pbx.min' => 'El campo PBX no puede tener menos de 8 caracteres.',
    
            'telefono_persona_contacto.required' => 'El campo teléfono de la persona de contacto es obligatorio.',
            'telefono_persona_contacto.string' => 'El campo teléfono de la persona de contacto debe ser una cadena de texto.',
            'telefono_persona_contacto.max' => 'El campo teléfono de la persona de contacto no puede tener más de 50 caracteres.',
    
            'direccion.required' => 'El campo direccion es obligatorio.',
            'direccion.string' => 'El campo direccion debe ser una cadena de texto.',
            'direccion.max' => 'El campo direccion no puede tener más de 500 caracteres.',
    
            'descripcion.string' => 'El campo descripción debe ser una cadena de texto.',
            'descripcion.max' => 'El campo descripción no puede tener más de 1000 caracteres.',
    
            'tipo_proveedor.required' => 'El campo tipo de proveedor es obligatorio.',
            'tipo_proveedor.string' => 'El campo tipo de proveedor debe ser una cadena de texto.',
            'tipo_proveedor.max' => 'El campo tipo de proveedor no puede tener más de 100 caracteres.',
    
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.string' => 'El campo estado debe ser una cadena de texto.',
            'estado.in' => 'El campo estado debe ser Activo o Inactivo.'
        ]);

        try {
            DB::beginTransaction();
            $proveedor = new proveedores();
            $proveedor->fill($validatedData);
            $proveedor->save();

            // Crear un log para el registro
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó el proveedor " . $proveedor->nombre_proveedor;
            $log->modulo = "Gestión de proveedores";
            $log->save();

            DB::commit();

            return response()->json([
                'message' => 'Proveedor creado correctamente',
                'proveedor' => $proveedor,
                'status' => 200
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
         $validatedData = $request->validate([
        'nombre_proveedor' => 'required|string|max:255',
        'nombre_persona_contacto' => 'required|string|max:255',
        'correo_contacto' => 'nullable|string|max:100',
        'pbx' => 'required|string|max:50',
        'telefono_persona_contacto' => 'required|string|max:50',
        'direccion' => 'required|string|max:500',
        'descripcion' => 'nullable|string|max:1000',
        'tipo_proveedor' => 'required|string|max:100',
        'estado' => 'required|string|in:Activo,Inactivo'
    ], [
        'nombre_proveedor.required' => 'El campo nombre del proveedor es obligatorio.',
        'nombre_proveedor.string' => 'El campo nombre del proveedor debe ser una cadena de texto.',
        'nombre_proveedor.max' => 'El campo nombre del proveedor no puede tener más de 255 caracteres.',

        'nombre_persona_contacto.required' => 'El campo nombre de la persona de contacto es obligatorio.',
        'nombre_persona_contacto.string' => 'El campo nombre de la persona de contacto debe ser una cadena de texto.',
        'nombre_persona_contacto.max' => 'El campo nombre de la persona de contacto no puede tener más de 255 caracteres.',

        'correo_contacto.required' => 'El campo correo de contacto es obligatorio.',
        'correo_contacto.string' => 'El campo correo de contacto debe ser una cadena de texto.',
        'correo_contacto.max' => 'El campo correo de contacto no puede tener más de 100 caracteres.',
        
        'pbx.required' => 'El campo PBX es obligatorio.',
        'pbx.string' => 'El campo PBX debe ser una cadena de texto.',
        'pbx.max' => 'El campo PBX no puede tener más de 50 caracteres.',

        'telefono_persona_contacto.required' => 'El campo teléfono de la persona de contacto es obligatorio.',
        'telefono_persona_contacto.string' => 'El campo teléfono de la persona de contacto debe ser una cadena de texto.',
        'telefono_persona_contacto.max' => 'El campo teléfono de la persona de contacto no puede tener más de 50 caracteres.',

        'direccion.required' => 'El campo direccion es obligatorio.',
        'direccion.string' => 'El campo direccion debe ser una cadena de texto.',
        'direccion.max' => 'El campo direccion no puede tener más de 500 caracteres.',

        'descripcion.string' => 'El campo descripción debe ser una cadena de texto.',
        'descripcion.max' => 'El campo descripción no puede tener más de 1000 caracteres.',

        'tipo_proveedor.required' => 'El campo tipo de proveedor es obligatorio.',
        'tipo_proveedor.string' => 'El campo tipo de proveedor debe ser una cadena de texto.',
        'tipo_proveedor.max' => 'El campo tipo de proveedor no puede tener más de 100 caracteres.',

        'estado.required' => 'El campo estado es obligatorio.',
        'estado.string' => 'El campo estado debe ser una cadena de texto.',
        'estado.in' => 'El campo estado debe ser Activo o Inactivo.'
    ]);

        try {
            DB::beginTransaction();
            $proveedor = proveedores::find($id);
            if (!$proveedor) {
                return response()->json(['message' => 'Proveedor no encontrado'], 404);
            }

            $proveedor->fill($validatedData);
            $proveedor->save();

            // Registrar la actualización en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó el proveedor " . $proveedor->nombre_proveedor;
            $log->modulo = "Gestión de proveedores";
            $log->save();

            DB::commit();

            return response()->json([
                'message' => 'Proveedor actualizado correctamente',
                'proveedor' => $proveedor,
                'status' => 200
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function change($id)
    {
        try {
            DB::beginTransaction();

            $proveedor = proveedores::findOrFail($id);
            $proveedor->estado = $proveedor->estado === "Activo" ? "Inactivo" : "Activo";
            $proveedor->save();

            // Registrar el cambio de estado en los logs
            $log = new logs();
            $log->id_usuario = auth()->user()->id;
            $log->descripcion = "Cambió el estado del proveedor " . $proveedor->nombre_proveedor;
            $log->modulo = "Gestión de proveedores";
            $log->save();

            DB::commit();
            return response()->json(['success' => 'Estado actualizado correctamente', 'status' => 200]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al actualizar el estado: ' . $e->getMessage()], 500);
        }
    }
}