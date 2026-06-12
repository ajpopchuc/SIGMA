<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\campus;
use App\Models\logs;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class campusController extends Controller
{
    public function get_campus()
    {
        $data = [];
        $campus = campus::all();
        foreach ($campus as $campu) {
            $model = [
                "id" => $campu->id,
                "nombre" => $campu->nombre,
                "descripcion" => $campu->descripcion,
                "estado" => $campu->estado,
                "created_at" => $campu->created_at,
                "updated_at" => $campu->updated_at,
            ];
            array_push($data, $model);
        }

        $meta = [
            "page" => 1,
            "pages" => 1,
            "perpage" => 5,
            "total" => count($data)
        ];

        $response = [
            "meta" => $meta,
            "data" => $data
        ];

        return response()->json($response);
    }
    
    public function create(Request $request)
    {
        // Validación
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100|min:5',
            'descripcion' => 'required|string|max:200|min:5',
        ], [
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.max' => 'El nombre no debe tener más de 100 caracteres.',
            'nombre.min' => 'El nombre no debe tener menos de 5 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.max' => 'La descripción no debe tener más de 200 caracteres.',
            'descripcion.min' => 'La descripción no debe tener menos de 5 caracteres.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction(); 
            $campus = new campus(); 
            $campus->nombre = $validator->validated()['nombre'];
            $campus->descripcion = $validator->validated()['descripcion'];
            $campus->estado = 'Activo';
            $campus->save();

            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó el campus " . $campus->nombre;
            $log->modulo = "Gestión de campus";
            $log->save();

            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Campus creado correctamente', 'status' => 200]);

        } catch (\Throwable $th) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al crear el campus: ' . $th->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        // Validación
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100|min:5',
            'descripcion' => 'required|string|max:200|min:5',
        ], [
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.max' => 'El nombre no debe tener más de 100 caracteres.',
            'nombre.min' => 'El nombre no debe tener menos de 5 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.max' => 'La descripción no debe tener más de 200 caracteres.',
            'descripcion.min' => 'La descripción no debe tener menos de 5 caracteres.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction(); 
            $campus = campus::findOrFail($id);
            $campus->nombre = $validator->validated()['nombre'];
            $campus->descripcion = $validator->validated()['descripcion'];
            $campus->save();

            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó el campus " . $campus->nombre;
            $log->modulo = "Gestión de campus";
            $log->save();

            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Datos actualizados correctamente', 'status' => 200]);

        } catch (\Exception $e) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al actualizar los datos: ' . $e->getMessage()], 500);
        }
    }

    public function change(Request $request, $id)
    {
        // Validación para asegurar que el id esté presente y sea un entero válido
        $validator = Validator::make($request->all(), [
            'id' => 'required'
        ]);
    

    
        try {
            DB::beginTransaction(); 
            // Usar el id validado desde el request
            $validatedData = $validator->validated();
            $campus = campus::findOrFail($id);
            
            // Cambiar el estado del campus
            $campus->estado = ($campus->estado === "Activo") ? "Inactivo" : "Activo";
            $campus->save();
    
            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = auth()->user()->id;
            $log->descripcion = "Cambió el estado del campus " . $campus->nombre;
            $log->modulo = "Gestión de campus";
            $log->save();
    
            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Estado actualizado correctamente', 'status' => 200]);
    
        } catch (\Exception $e) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al cambiar el estado: ' . $e->getMessage()], 500);
        }
    }
    
}
