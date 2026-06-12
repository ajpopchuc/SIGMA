<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\presupuestos;
use Illuminate\Support\Facades\DB;
use App\Models\logs;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon; 
use Illuminate\Support\Facades\Validator;

class presupuestosController extends Controller
{
    public function get_presupuestos()
{
    $presupuestos = presupuestos::all();

    foreach ($presupuestos as $presupuesto) {
        if (Carbon::now()->gt(Carbon::parse($presupuesto->fecha_fin))) {
            $presupuesto->estado = 'Inactivo';
            $presupuesto->save(); // Guarda el cambio en el estado
        }
    }

    return response()->json($presupuestos);
}


    public function get_presupuesto($id)
    {
        $presupuesto = presupuestos::find($id);
        if ($presupuesto) {
            return response()->json($presupuesto);
        } else {
            return response()->json(['message' => 'Presupuesto no encontrado'], 404);
        }
    }

    public function get_presupuestos_activos()
{
    $presupuestosActivos = presupuestos::where('estado', 'Activo')
        ->get();

    // Cambiamos el nombre de la variable en el foreach
    foreach ($presupuestosActivos as $presupuesto) {
        if (Carbon::now()->gt(Carbon::parse($presupuesto->fecha_fin))) {
            $presupuesto->estado = 'Inactivo';
            $presupuesto->save();
        }
    }
        
    // Volvemos a obtener los presupuestos activos después de las actualizaciones
    $presupuestosActivos = presupuestos::where('estado', 'Activo')
        ->get();
        
    return response()->json($presupuestosActivos);
}

    public function create(Request $request)
    {
        $validatedData = Validator::make($request->all(), [
            'monto_presupuesto' => 'required|numeric|min:0.01',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'periodo' => 'required|string|max:255',
            'area' => 'required|string|max:255'
        ], [
            'monto_presupuesto.required' => 'El campo monto del presupuesto es obligatorio.',
            'monto_presupuesto.numeric' => 'El campo monto del presupuesto debe ser un número.',
            'monto_presupuesto.min' => 'El campo monto del presupuesto debe ser mayor a 0 y no puede ser negativo.',
            
            'fecha_inicio.required' => 'El campo fecha de inicio es obligatorio.',
            'fecha_inicio.date' => 'El campo fecha de inicio debe ser una fecha válida.',
            
            'fecha_fin.required' => 'El campo fecha de fin es obligatorio.',
            'fecha_fin.date' => 'El campo fecha de fin debe ser una fecha válida.',
            'fecha_fin.after' => 'El campo fecha de fin debe ser una fecha mayor a la fecha de inicio.',
            
            'periodo.required' => 'El campo periodo es obligatorio.',
            'periodo.string' => 'El campo periodo debe ser una cadena de texto.',
            'periodo.max' => 'El campo periodo no puede tener más de 255 caracteres.',
    
            'area.required' => 'El campo área es obligatorio.',
            'area.string' => 'El campo área debe ser una cadena de texto.',
            'area.max' => 'El campo área no puede tener más de 255 caracteres.',
        ]);
    
        if ($validatedData->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validatedData->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }
    
        // Verificar si ya existe un presupuesto activo para el área especificada
        $presupuestoExistente = presupuestos::where('area', $request->area)
            ->where('estado', 'Activo')
            ->exists();
    
            if ($presupuestoExistente) {
                return response()->json([
                    'message' => 'Los datos proporcionados no son válidos.',
                    'errors' => [
                        'area' => ['Ya existe un presupuesto activo para el área de ' . $request->area]
                    ]
                ], 422);
            }            
    
        try {
            DB::beginTransaction();
            
            $presupuesto = new presupuestos();
            $presupuesto->area = $request->area;
            $presupuesto->monto_presupuesto = $request->monto_presupuesto;
            $presupuesto->presupuesto_ejecutado = 0;
            $presupuesto->monto_pendiente = $request->monto_presupuesto;
            $presupuesto->fecha_inicio = $request->fecha_inicio;
            $presupuesto->fecha_fin = $request->fecha_fin;
            $presupuesto->periodo = $request->periodo;
            $presupuesto->estado = 'Activo';
            $presupuesto->save();
    
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó el presupuesto para " . $presupuesto->area . " con monto " . $presupuesto->monto_presupuesto;
            $log->modulo = "Gestión de presupuestos";
            $log->save();
    
            DB::commit();
    
            return response()->json([   
                'message' => 'Presupuesto creado correctamente',
                'presupuesto' => $presupuesto,
                'status' => 200
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el presupuesto',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    public function update(Request $request, $id)
    {
        // Validación de los datos
        $validatedData = Validator::make($request->all(), [
            'monto_presupuesto' => 'required|numeric|min:0.01',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio', // Fecha fin debe ser posterior a fecha inicio
            'periodo' => 'required|string|max:255'
        ], [
            'monto_presupuesto.required' => 'El campo monto del presupuesto es obligatorio.',
            'monto_presupuesto.numeric' => 'El campo monto del presupuesto debe ser un número.',
            'monto_presupuesto.min' => 'El campo monto del presupuesto debe ser mayor a 0 y no puede ser negativo.',
        
            'fecha_inicio.required' => 'El campo fecha de inicio es obligatorio.',
            'fecha_inicio.date' => 'El campo fecha de inicio debe ser una fecha válida.',
        
            'fecha_fin.required' => 'El campo fecha de fin es obligatorio.',
            'fecha_fin.date' => 'El campo fecha de fin debe ser una fecha válida.',
            'fecha_fin.after' => 'El campo fecha de fin debe ser una fecha mayor a la fecha de inicio.',
        
            'periodo.required' => 'El campo periodo es obligatorio.',
            'periodo.string' => 'El campo periodo debe ser una cadena de texto.',
            'periodo.max' => 'El campo periodo no puede tener más de 255 caracteres.',
        ]);        

        if ($validatedData->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validatedData->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }

        try {
            DB::beginTransaction();
            $presupuesto = presupuestos::find($id);
            if (!$presupuesto) {
                return response()->json(['message' => 'Presupuesto no encontrado'], 404);
            }

            $presupuesto->area = $request-> area;
            $presupuesto->monto_presupuesto = $request-> monto_presupuesto;
            $presupuesto->presupuesto_ejecutado = 0;
            $presupuesto->monto_pendiente = $request->monto_presupuesto;
            $presupuesto->fecha_inicio = $request->fecha_inicio;
            $presupuesto->fecha_fin = $request->fecha_fin;
            $presupuesto->periodo = $request->periodo;
            $presupuesto->estado = $request->estado;
            $presupuesto->save();

            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó el presupuesto con monto " . $presupuesto->monto_presupuesto;
            $log->modulo = "Gestión de presupuestos";
            $log->save();

            DB::commit();

            return response()->json([
                'message' => 'Presupuesto actualizado correctamente',
                'presupuesto' => $presupuesto,
                'status' => 200
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el presupuesto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function change($id)
    {
        try {
            DB::beginTransaction();
            
            $presupuesto = presupuestos::find($id);
            if (!$presupuesto) {
                return response()->json(['message' => 'Presupuesto no encontrado'], 404);
            }
    
            $presupuesto->estado = 'Inactivo';
            $presupuesto->save();
    
            $log = new logs();
            $log->id_usuario = auth()->user()->id;
            $log->descripcion = "Desactivó el presupuesto con monto " . $presupuesto->monto_presupuesto;
            $log->modulo = "Gestión de presupuestos";
            $log->save();
    
            DB::commit();
    
            return response()->json(['message' => 'Presupuesto desactivado correctamente'], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al desactivar el presupuesto',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
