<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\edificios;
use App\Models\campus;
use App\Models\logs;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
class edifciosController extends Controller
{
    public function get_edificios()
    {
        $data = [];
        // Cargar edificios junto con los datos del campus
        $edificios = edificios::with('campus')->get(); // Eager loading para evitar N+1 query
    
        foreach ($edificios as $edificio) {
            $model = [
                "id" => $edificio->id,
                "nombre" => $edificio->nombre,
                "descripcion" => $edificio->descripcion,
                "id_campus" => $edificio->id_campus,
                "nombre_campus" => $edificio->campus ? $edificio->campus->nombre : 'No disponible', // Agregar el nombre del campus
                "estado" => $edificio->estado,
                "created_at" => $edificio->created_at,
                "updated_at" => $edificio->updated_at,
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
    

    public function get_campus()
    {
        $data = [];
        $campus = campus::all(); 
    
        foreach ($campus as $campu) {
            $model = [
                "id" => $campu->id,
                "nombre" => $campu->nombre,
            ];
            array_push($data, $model);
        }
    
        return response()->json($data); 
    }

    public function create(Request $request)
    {
    // Validación
    $validator = Validator::make($request->all(), [
        'nombre' => 'required|string|min:5|max:100', // Mínimo 5 caracteres
        'descripcion' => 'required|string|min:5|max:200', // Mínimo 5 caracteres
        'id_campus' => 'required'
    ], [
        'nombre.required' => 'El campo nombre es obligatorio.',
        'nombre.min' => 'El nombre debe tener al menos 5 caracteres.', // Mensaje para mínimo
        'nombre.max' => 'El nombre no debe tener más de 100 caracteres.',
        'descripcion.required' => 'El campo descripción es obligatorio.',
        'descripcion.min' => 'La descripción debe tener al menos 5 caracteres.', // Mensaje para mínimo
        'descripcion.max' => 'La descripción no debe tener más de 200 caracteres.',
        'id_campus.required' => 'El campo campus es obligatorio.'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Los datos proporcionados no son válidos.',
            'errors' => $validator->errors()
        ], 422); // Usamos 422 para indicar error de validación
    }
        try {
            DB::beginTransaction(); // Inicia la transacción
            $edificios = new edificios(); 
            $edificios->nombre = $validator->validated()['nombre'];
            $edificios->descripcion = $validator->validated()['descripcion'];
            $edificios->id_campus = $validator->validated()['id_campus'];
            $edificios->estado = 'Activo';
            $edificios->save();
    
            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó el edificio " . $edificios->nombre;
            $log->modulo = "Gestión de edificios";
            $log->save();
    
            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Edificio creado correctamente', 'status' => 200]);
    
        } catch (\Throwable $th) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al crear el edificio: ' . $th->getMessage()], 500);
        }
    }
    

    public function update(Request $request, $id)
    {
    // Validación
    $validator = Validator::make($request->all(), [
        'nombre' => 'required|string|min:5|max:100', // Mínimo 5 caracteres
        'descripcion' => 'required|string|min:5|max:200', // Mínimo 5 caracteres
        'id_campus' => 'required'
    ], [
        'nombre.required' => 'El campo nombre es obligatorio.',
        'nombre.min' => 'El nombre debe tener al menos 5 caracteres.', // Mensaje para mínimo
        'nombre.max' => 'El nombre no debe tener más de 100 caracteres.',
        'descripcion.required' => 'El campo descripción es obligatorio.',
        'descripcion.min' => 'La descripción debe tener al menos 5 caracteres.', // Mensaje para mínimo
        'descripcion.max' => 'La descripción no debe tener más de 200 caracteres.',
        'id_campus.required' => 'El campo campus es obligatorio.'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Los datos proporcionados no son válidos.',
            'errors' => $validator->errors()
        ], 422); // Usamos 422 para indicar error de validación
    }
    
        try {
            DB::beginTransaction(); // Inicia la transacción
            $edificios = edificios::findOrFail($id);
            $edificios->nombre = $validator->validated()['nombre'];
            $edificios->descripcion = $validator->validated()['descripcion'];
            $edificios->id_campus = $validator->validated()['id_campus'];
            $edificios->save();
    
            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó el edificio " . $edificios->nombre;
            $log->modulo = "Gestión de edificios";
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
            DB::beginTransaction(); // Inicia la transacción
            $edificios = edificios::findOrFail($id);
            if ($edificios->estado === "Activo") {
                $edificios->estado = "Inactivo";
            } else {
                $edificios->estado = "Activo";
            }
            $edificios->save();
    
            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = auth()->user()->id;
            $log->descripcion = "Cambió el estado del edificio " . $edificios->nombre;
            $log->modulo = "Gestión de edificios";
            $log->save();
    
            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Estado actualizado correctamente', 'status' => 200]);
    
        } catch (\Exception $e) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al cambiar el estado: ' . $e->getMessage()], 500);
        }
    }
    
}
