<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\activos;
use Illuminate\Support\Facades\DB;
use App\Models\logs;
use App\Models\instalaciones;
use App\Http\Controllers\qrsController;
use App\Models\qrs;
use App\Models\campus;
use Illuminate\Support\Facades\Validator;

class activosController extends Controller
{
    // Función para obtener todos los activos
    public function get_activos()
{
    $data = [];
    
    // Cargar activos junto con los datos de la instalación
    $activos = activos::with('instalacion')->get(); 
    
    foreach ($activos as $activo) {
        $model = [
            "id" => $activo->id,
            "nombre" => $activo->nombre,
            "codigo" => $activo->codigo,
            "descripcion" => $activo->descripcion,
            "precio" => $activo->precio,
            "fecha_adquisicion" => $activo->fecha_adquisicion,
            "id_instalacion" => $activo->id_instalacion,
            "nombre_instalacion" => $activo->instalacion ? $activo->instalacion->nombre : 'No disponible', // Agregar el nombre de la instalación
            "estado" => $activo->estado,
            "created_at" => $activo->created_at,
            "updated_at" => $activo->updated_at,
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


public function get_ubicaciones()
{
    $data = [];
    $campuses = campus::with(['edificios.niveles.instalaciones'])->get();

    foreach ($campuses as $campus) {
        $campusData = [
            "id" => $campus->id,
            "nombre" => $campus->nombre,
            "edificios" => []
        ];

        foreach ($campus->edificios as $edificio) {
            $edificioData = [
                "id" => $edificio->id,
                "nombre" => $edificio->nombre,
                "niveles" => []
            ];

            foreach ($edificio->niveles as $nivel) {
                $nivelData = [
                    "id" => $nivel->id,
                    "nombre" => $nivel->nombre,
                    "instalaciones" => []
                ];

                foreach ($nivel->instalaciones as $instalacion) {
                    $instalacionData = [
                        "id" => $instalacion->id,
                        "nombre" => $instalacion->nombre,
                    ];
                    array_push($nivelData["instalaciones"], $instalacionData);
                }
                
                array_push($edificioData["niveles"], $nivelData);
            }
            
            array_push($campusData["edificios"], $edificioData);
        }
        
        array_push($data, $campusData);
    }

    return response()->json($data);
}

    // Función para crear un nuevo activo con validaciones
    public function create(Request $request)
    {
        // Validación de los datos
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|min:2|max:255',
            'codigo' => 'required|string|min:1|max:45',
            'descripcion' => 'required|string|min:3|max:1000',
            'precio' => 'required|numeric|min:1',
            'fecha_adquisicion' => 'required|date',
            'id_instalacion' => 'required|exists:instalaciones,id'
        ], [
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 2 caracteres.',
            'nombre.max' => 'El nombre no debe tener más de 255 caracteres.',
            'codigo.required' => 'El campo código es obligatorio.',
            'codigo.min' => 'El código debe tener al menos 1 caracter.',
            'codigo.max' => 'El código no debe tener más de 45 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.min' => 'La descripción debe tener al menos 3 caracteres.',
            'descripcion.max' => 'La descripción no debe tener más de 1000 caracteres.',
            'precio.required' => 'El campo precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'precio.min' => 'El precio no puede ser negativo.',
            'fecha_adquisicion.required' => 'La fecha de adquisición es obligatoria.',
            'fecha_adquisicion.date' => 'La fecha de adquisición debe ser una fecha válida.',
            'id_instalacion.required' => 'El campo id_instalacion es obligatorio.',
            'id_instalacion.exists' => 'El id_instalacion debe existir en la tabla de instalaciones.',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction(); // Inicio de transacción
            $activo = new activos();
            $activo->nombre = $validator->validated()['nombre'];
            $activo->codigo = $validator->validated()['codigo'];
            $activo->descripcion = $validator->validated()['descripcion'];
            $activo->precio = $validator->validated()['precio'];
            $activo->fecha_adquisicion = $validator->validated()['fecha_adquisicion'];
            $activo->id_instalacion = $validator->validated()['id_instalacion'];
            $activo->estado = 'Activo';
            $activo->save();
            $generarQR = $request->boolean('generarQR');
            $qrData  = null;

            if ($generarQR) {
                try {
                    $qrController = new qrsController();
                    $qrResponse = $qrController->generate($activo->id);
                    
                    if ($qrResponse->getStatusCode() === 200) {
                        $qrData = json_decode($qrResponse->getContent(), true);
                        if (isset($qrData['data']) && isset($qrData['data']['url'])) {
                            $qrUrl = $qrData['data']['url'];
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Error generando QR: ' . $e->getMessage());
                }
            }
            // Crear registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;  
            $log->descripcion = "Creó un activo " . $activo->nombre . ($generarQR ? " con código QR" : "");
            $log->modulo = "Gestión de activos";
            $log->save();
            DB::commit(); // Confirma la transacción
            $response = [
            'success' => 'Activo creado correctamente' . ($generarQR ? ' con código QR' : ''),
            'status' => 200,
            'activo' => $activo
        ];

        if (isset($qrUrl)) {
            $response['qr_url'] = $qrUrl;
        }

        return response()->json($response);

    } catch (\Throwable $th) {
        DB::rollBack();
        \Log::error($th->getMessage());
        return response()->json([
            'error' => 'Error al crear el activo: ' . $th->getMessage()
        ], 500);
    }
}

    // Función para actualizar un activo con validaciones
    public function update(Request $request, $id)
    {
        // Validación de los datos
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|min:2|max:255',
            'codigo' => 'required|string|min:1|max:45',
            'descripcion' => 'required|string|min:3|max:1000',
            'precio' => 'required|numeric|min:0',
            'fecha_adquisicion' => 'required|date',
            'id_instalacion' => 'required|exists:instalaciones,id'
        ], [
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 2 caracteres.',
            'nombre.max' => 'El nombre no debe tener más de 255 caracteres.',
            'codigo.required' => 'El campo código es obligatorio.',
            'codigo.min' => 'El código debe tener al menos 1 caracteres.',
            'codigo.max' => 'El código no debe tener más de 45 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.min' => 'La descripción debe tener al menos 3 caracteres.',
            'descripcion.max' => 'La descripción no debe tener más de 1000 caracteres.',
            'precio.required' => 'El campo precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'precio.min' => 'El precio no puede ser negativo.',
            'fecha_adquisicion.required' => 'La fecha de adquisición es obligatoria.',
            'fecha_adquisicion.date' => 'La fecha de adquisición debe ser una fecha válida.',
            'id_instalacion.required' => 'El campo id_instalacion es obligatorio.',
            'id_instalacion.exists' => 'El id_instalacion debe existir en la tabla de instalaciones.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction(); // Inicia la transacción
            $activo = activos::findOrFail($id);
            $activo->nombre = $validator->validated()['nombre'];
            $activo->codigo = $validator->validated()['codigo'];
            $activo->descripcion = $validator->validated()['descripcion'];
            $activo->precio = $validator->validated()['precio'];
            $activo->fecha_adquisicion = $validator->validated()['fecha_adquisicion'];
            $activo->id_instalacion = $validator->validated()['id_instalacion'];
            $activo->save();

            // Agregar generación de QR
            $generarQR = $request->boolean('generarQR');
            $qrData = null;
            $qrUrl = null;

            if ($generarQR) {
                try {
                    $qrController = new qrsController();
                    $qrResponse = $qrController->generate($activo->id);
                    
                    if ($qrResponse->getStatusCode() === 200) {
                        $qrData = json_decode($qrResponse->getContent(), true);
                        if (isset($qrData['data']) && isset($qrData['data']['url'])) {
                            $qrUrl = $qrData['data']['url'];
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Error generando QR en actualización: ' . $e->getMessage());
                }
            }

            // Crear registro en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó un activo " . $activo->nombre . ($generarQR ? " y generó código QR" : "");
            $log->modulo = "Gestión de activos";
            $log->save();

            DB::commit();

            // Preparar respuesta
            $response = [
                'success' => 'Datos actualizados correctamente' . ($generarQR ? ' y se generó código QR' : ''),
                'status' => 200,
                'activo' => $activo
            ];

            if (isset($qrUrl)) {
                $response['qr_url'] = $qrUrl;
            }

            return response()->json($response);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al actualizar los datos: ' . $e->getMessage()
            ], 500);
        }
    }

    // Función para cambiar el estado de un activo con validación de existencia
    public function change($id)
    {
        try {
            DB::beginTransaction(); // Inicia la transacción
            $activo = activos::findOrFail($id);
            // Alternar estado
            if ($activo->estado === "Activo") {
                $activo->estado = "Inactivo";
            } else {
                $activo->estado = "Activo";
            }
            $activo->save();
            // Crear registro en los logs
            $log = new logs();
            $log->id_usuario = auth()->user()->id;
            $log->descripcion = "Cambió el estado del activo " . $activo->nombre;
            $log->modulo = "Gestión de activos";
            $log->save();
            DB::commit(); // Confirma la transacción
            return response()->json(['success' => 'Estado actualizado correctamente', 'status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack(); // Revierte la transacción si hay un error
            return response()->json(['error' => 'Error al actualizar el estado: ' . $e->getMessage()], 500);
        }
    }
}