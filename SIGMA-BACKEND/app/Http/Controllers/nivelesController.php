<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\niveles;
use App\Models\logs;
use App\Models\edificios;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class nivelesController extends Controller
{
    public function get_niveles()
    {
        $data = [];
    
        // Cargar tanto la relación de edificio como la de campus
        $niveles = niveles::with('edificio.campus')->get(); 
        
        foreach ($niveles as $nivel) {
            $model = [
                "id" => $nivel->id,
                "nombre" => $nivel->nombre,
                "descripcion" => $nivel->descripcion,
                "id_edificio" => $nivel->id_edificio,
                "nombre_edificio" => $nivel->edificio ? $nivel->edificio->nombre : 'No disponible',
                "campues_id" => $nivel->edificio ? $nivel->edificio->id_campus : 'No disponible',
                "nombre_campus" => $nivel->edificio && $nivel->edificio->campus ? $nivel->edificio->campus->nombre : 'No disponible',
                "estado" => $nivel->estado,
                "created_at" => $nivel->created_at,
                "updated_at" => $nivel->updated_at,
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

    public function get_edificioss()
    {
        $data = [];
    
        // Cargar los edificios con sus respectivos campus
        $edificios = edificios::with('campus')->get(); 
        
        foreach ($edificios as $edificio) {
            $model = [
                "id_edificio" => $edificio->id,
                "nombre_edificio" => $edificio->nombre,
                "campues_nombre" => $edificio->campus ? $edificio->campus->nombre : 'No disponible', 
                "campues_id" => $edificio->campus ? $edificio->campus->id : 'No disponible',
            ];
            array_push($data, $model);
        }
    
        $result = [
            "edificios" => $data,
        ];
    
        return response()->json($result); 
    }
    
    public function create(Request $request)
    {
    // Validación
    $validator = Validator::make($request->all(), [
        'nombre' => 'required|string|min:5|max:100', // Mínimo 5 caracteres
        'descripcion' => 'required|string|min:5|max:200', // Mínimo 5 caracteres
        'id_edificio' => 'required|integer',
    ], [
        'nombre.required' => 'El campo nombre es obligatorio.',
        'nombre.min' => 'El nombre debe tener al menos 5 caracteres.', // Mensaje para mínimo
        'nombre.max' => 'El nombre no debe tener más de 100 caracteres.',
        'descripcion.required' => 'El campo descripción es obligatorio.',
        'descripcion.min' => 'La descripción debe tener al menos 5 caracteres.', // Mensaje para mínimo
        'descripcion.max' => 'La descripción no debe tener más de 200 caracteres.',
        'id_edificio.required' => 'El campo edificio es obligatorio.',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Los datos proporcionados no son válidos.',
            'errors' => $validator->errors()
        ], 422);
    }

        try {
            DB::beginTransaction(); // Inicia la transacción
            $niveles = new niveles(); 
            $niveles->nombre = $validator->validated()['nombre'];
            $niveles->descripcion = $validator->validated()['descripcion'];
            $niveles->id_edificio = $validator->validated()['id_edificio'];
            $niveles->estado = 'Activo';
            $niveles->save();

            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó el nivel " . $niveles->nombre;
            $log->modulo = "Gestión de niveles";
            $log->save();

            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Nivel creado correctamente', 'status' => 200]);

        } catch (\Throwable $th) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al crear el nivel: ' . $th->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
    // Validación
    $validator = Validator::make($request->all(), [
        'nombre' => 'required|string|min:5|max:100', // Mínimo 5 caracteres
        'descripcion' => 'required|string|min:5|max:200', // Mínimo 5 caracteres
        'id_edificio' => 'required|integer',
    ], [
        'nombre.required' => 'El campo nombre es obligatorio.',
        'nombre.min' => 'El nombre debe tener al menos 5 caracteres.', // Mensaje para mínimo
        'nombre.max' => 'El nombre no debe tener más de 100 caracteres.',
        'descripcion.required' => 'El campo descripción es obligatorio.',
        'descripcion.min' => 'La descripción debe tener al menos 5 caracteres.', // Mensaje para mínimo
        'descripcion.max' => 'La descripción no debe tener más de 200 caracteres.',
        'id_edificio.required' => 'El campo edificio es obligatorio.',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Los datos proporcionados no son válidos.',
            'errors' => $validator->errors()
        ], 422);
        }

        try {
            DB::beginTransaction(); // Inicia la transacción
            $niveles = niveles::findOrFail($id);
            $niveles->nombre = $validator->validated()['nombre'];
            $niveles->descripcion = $validator->validated()['descripcion'];
            $niveles->id_edificio = $validator->validated()['id_edificio'];
            $niveles->save();

            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó el nivel " . $niveles->nombre;
            $log->modulo = "Gestión de niveles";
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
            $niveles = niveles::findOrFail($id);
            if ($niveles->estado === "Activo") {
                $niveles->estado = "Inactivo";
            } else {
                $niveles->estado = "Activo";
            }
            $niveles->save();

            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = auth()->user()->id;
            $log->descripcion = "Cambió el estado del nivel " . $niveles->nombre;
            $log->modulo = "Gestión de niveles";
            $log->save();

            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Estado actualizado correctamente', 'status' => 200]);

        } catch (\Exception $e) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al cambiar el estado: ' . $e->getMessage()], 500);
        }
    }
}
