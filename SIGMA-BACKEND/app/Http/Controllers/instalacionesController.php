<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\instalaciones;
use App\Models\logs;
use App\Models\niveles;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class instalacionesController extends Controller
{
    public function get_instalaciones()
    {
        $data = [];
        // Cargar instalaciones junto con niveles, edificios y campus
        $instalaciones = instalaciones::with(['niveles.edificio.campus'])->get(); 

        foreach ($instalaciones as $instalacion) {
            $model = [
                "id" => $instalacion->id,
                "nombre" => $instalacion->nombre,
                "descripcion" => $instalacion->descripcion,
                "tipo_instalacion" => $instalacion->tipo_instalacion,
                "id_nivel" => $instalacion->id_nivel,
                // Información del nivel
                "nivel" => $instalacion->niveles ? [
                    "id" => $instalacion->niveles->id,
                    "nombre" => $instalacion->niveles->nombre,
                    "edificio" => [
                        "id" => $instalacion->niveles->edificio->id,
                        "nombre" => $instalacion->niveles->edificio->nombre,
                        "campus" => [
                            "id" => $instalacion->niveles->edificio->campus->id,
                            "nombre" => $instalacion->niveles->edificio->campus->nombre,
                        ],
                    ],
                ] : 'No disponible',
                "estado" => $instalacion->estado,
                "created_at" => $instalacion->created_at,
                "updated_at" => $instalacion->updated_at,
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

    public function get_niveless()
    {
        $data = [];
        $niveles = niveles::with(['edificio.campus'])->get(); // Cargar los niveles junto con el edificio y campus

        foreach ($niveles as $nivel) {
            $model = [
                "id" => $nivel->id,
                "nombre" => $nivel->nombre,
                "edificio" => [
                    "id" => $nivel->edificio->id,
                    "nombre" => $nivel->edificio->nombre,
                    "campus" => [
                        "id" => $nivel->edificio->campus->id,
                        "nombre" => $nivel->edificio->campus->nombre,
                    ],
                ],
            ];
            array_push($data, $model);
        }

        return response()->json($data);
    }

    public function create(Request $request)
    {
        // Validación
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|min:2|max:100', // Cambiado para incluir la validación de mínimo 5 caracteres
            'descripcion' => 'required|string|max:500|min:5',
            'tipo_instalacion' => 'required|string|max:100|min:5',
            'id_nivel' => 'required|integer',
        ], [
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 5 caracteres.', // Mensaje para mínimo 5 caracteres
            'nombre.max' => 'El nombre no debe tener más de 100 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.min' => 'La descripción debe tener al menos 5 caracteres.', // Mensaje para mínimo 5 caracteres
            'descripcion.max' => 'La descripción no debe tener más de 500 caracteres.',
            'tipo_instalacion.required' => 'El tipo de instalación es obligatorio.',
            'tipo_instalacion.min' => 'El tipo de instalación debe tener al menos 5 caracteres.', // Mensaje para mínimo 5 caracteres
            'tipo_instalacion.max' => 'El tipo de instalación no debe tener más de 100 caracteres.',
            'id_nivel.required' => 'El campo id_nivel es obligatorio.',
            'id_nivel.integer' => 'El id_nivel debe ser un número entero.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422);
        }


        try {
            DB::beginTransaction(); // Inicia la transacción
            $instalaciones = new instalaciones(); 
            $instalaciones->nombre = $validator->validated()['nombre'];
            $instalaciones->descripcion = $validator->validated()['descripcion'];
            $instalaciones->tipo_instalacion = $validator->validated()['tipo_instalacion'];
            $instalaciones->id_nivel = $validator->validated()['id_nivel'];
            $instalaciones->estado = 'Activo';
            $instalaciones->save();

            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó la instalación " . $instalaciones->nombre;
            $log->modulo = "Gestión de instalaciones";
            $log->save();

            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Instalación creada correctamente', 'status' => 200]);

        } catch (\Throwable $th) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al crear la instalación: ' . $th->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        // Validación
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|min:2|max:100', // Cambiado para incluir la validación de mínimo 5 caracteres
            'descripcion' => 'required|string|max:500|min:5',
            'tipo_instalacion' => 'required|string|max:100|min:5',
            'id_nivel' => 'required|integer',
        ], [
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 5 caracteres.', // Mensaje para mínimo 5 caracteres
            'nombre.max' => 'El nombre no debe tener más de 100 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.min' => 'La descripción debe tener al menos 5 caracteres.', // Mensaje para mínimo 5 caracteres
            'descripcion.max' => 'La descripción no debe tener más de 500 caracteres.',
            'tipo_instalacion.required' => 'El tipo de instalación es obligatorio.',
            'tipo_instalacion.min' => 'El tipo de instalación debe tener al menos 5 caracteres.', // Mensaje para mínimo 5 caracteres
            'tipo_instalacion.max' => 'El tipo de instalación no debe tener más de 100 caracteres.',
            'id_nivel.required' => 'El campo id_nivel es obligatorio.',
            'id_nivel.integer' => 'El id_nivel debe ser un número entero.',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422);
        }


        try {
            DB::beginTransaction(); // Inicia la transacción
            $instalaciones = instalaciones::findOrFail($id);
            $instalaciones->nombre = $validator->validated()['nombre'];
            $instalaciones->descripcion = $validator->validated()['descripcion'];
            $instalaciones->tipo_instalacion = $validator->validated()['tipo_instalacion'];
            $instalaciones->id_nivel = $validator->validated()['id_nivel'];
            $instalaciones->save();

            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó la instalación " . $instalaciones->nombre;
            $log->modulo = "Gestión de instalaciones";
            $log->save();

            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Datos actualizados correctamente', 'status' => 200]);

        } catch (\Exception $e) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al actualizar los datos: ' . $e->getMessage()], 500);
        }
    }

    public function change($id)
    {
        try {
            DB::beginTransaction(); // Inicia la transacción
            $instalaciones = instalaciones::findOrFail($id);
            if ($instalaciones->estado === "Activo") {
                $instalaciones->estado = "Inactivo";
            } else {
                $instalaciones->estado = "Activo";
            }
            $instalaciones->save();

            // Crear un registro en los logs
            $log = new logs();
            $log->id_usuario = auth()->user()->id;
            $log->descripcion = "Cambió el estado de la instalación " . $instalaciones->nombre;
            $log->modulo = "Gestión de instalaciones";
            $log->save();

            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Estado actualizado correctamente', 'status' => 200]);

        } catch (\Exception $e) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al cambiar el estado: ' . $e->getMessage()], 500);
        }
    }
}
