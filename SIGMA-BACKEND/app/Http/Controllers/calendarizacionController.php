<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\calendarizacion;
use Illuminate\Support\Facades\DB;
use App\Models\logs;
use App\Models\mantenimientos;
use App\Models\inspecciones;
use App\Models\supervision;
use App\Models\usuarios;
use Carbon\Carbon;

class calendarizacionController extends Controller
{
    public function get_actividades(Request $request)
{
    try {
        // Obtener directamente el ID del usuario
        $userId = $request->user()->id;
        
        $userData = usuarios::find($userId);

        if (!$userData) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        // If role is 1 (admin), return all activities
        if ($userData->id_rol === 1) {
            $actividades = calendarizacion::orderBy("id", "asc")->get();
        } else {
            // Otherwise, return only activities for the logged-in user
            $actividades = calendarizacion::where('id_usuario', $userId)
                ->orderBy("id", "asc")
                ->get();
        }

        return response()->json($actividades);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error al obtener las actividades',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function get_actividad($id)
    {
        $actividad = calendarizacion::find($id);
        if ($actividad) {
            return response()->json($actividad);
        } else {
            return response()->json(['message' => 'Actividad no encontrada'], 404);
        }
    }

    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_final' => 'required|date|after_or_equal:fecha_inicio',
            'es_recurrente' => 'required|boolean',
            'tiempo_recurrencia' => 'nullable|integer',
            'observaciones' => 'nullable|string|max:60000',
            'tipo_actividad' => 'required|string|in:Mantenimiento a infraestructura,Mantenimiento a equipo,Mantenimiento externo,Inspección a infraestructura,Inspección a equipo,Supervisión a infraestructura,Supervisión a equipo',
            'id_usuario' => 'required|integer',
            'estado' => 'required|string|in:Pendiente,Realizado,enProceso,Anulada',
            'id_inspeccion' => 'nullable|integer',
            'id_mantenimiento' => 'nullable|integer',
            'id_supervision' => 'nullable|integer',
            'fecha_limite' => 'nullable|date'
        ], [
            'fecha_inicio.required' => 'El campo de fecha de inicio es obligatorio.',
            'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida.',

            'fecha_final.required' => 'El campo de fecha de finalización es obligatorio.',
            'fecha_final.date' => 'La fecha de finalización debe ser una fecha válida.',
            'fecha_final.after_or_equal' => 'La fecha de finalización debe ser igual o posterior a la fecha de inicio.',

            'es_recurrente.required' => 'El campo de recurrencia es obligatorio.',
            'es_recurrente.boolean' => 'El campo de recurrencia debe ser un valor booleano (1 o 0).',

            'tiempo_recurrencia.integer' => 'El tiempo de recurrencia debe ser un número entero.',

            'observaciones.string' => 'El campo de observaciones debe ser una cadena de texto.',
            'observaciones.max' => 'El campo de observaciones no puede tener más de 60000 caracteres.',

            'tipo_actividad.required' => 'El tipo de actividad es obligatorio.',
            'tipo_actividad.string' => 'El tipo de actividad debe ser una cadena de texto.',
            'tipo_actividad.in' => 'El tipo de actividad debe ser uno de los siguientes: Mantenimiento, Inspección o Supervisión.',

            'id_usuario.required' => 'El campo de ID de usuario es obligatorio.',
            'id_usuario.integer' => 'El ID de usuario debe ser un número entero.',

            'estado.required' => 'El campo estado es obligatorio.',
            'estado.string' => 'El campo estado debe ser una cadena de texto.',
            'estado.in' => 'El campo estado debe ser uno de los siguientes: Pendiente, Realizado, enProceso, Anulada.',

            'id_inspeccion.integer' => 'El ID de inspección debe ser un número entero.',

            'id_mantenimiento.integer' => 'El ID de mantenimiento debe ser un número entero.',

            'id_supervision.integer' => 'El ID de supervisión debe ser un número entero.',
        ]);  

        try {
            DB::beginTransaction();
            
            // Crear actividad inicial
            $actividad = new calendarizacion();
            $actividad->fill($validatedData);
            $actividad->save();

            // Crear actividades recurrentes si es_recurrente es true
            if ($validatedData['es_recurrente']) {
                $fechaInicio = Carbon::parse($validatedData['fecha_inicio']);
                $fechaFinal = Carbon::parse($validatedData['fecha_final']);
                $fechaLimite = Carbon::parse($validatedData['fecha_limite']);

                while ($fechaInicio->lt($fechaLimite)) {
                    $fechaInicio = $fechaInicio->addDays($validatedData['tiempo_recurrencia']);
                    $fechaFinal = $fechaFinal->addDays($validatedData['tiempo_recurrencia']);

                    // Si la fecha de inicio cae en domingo, sumarle un día
                    if ($fechaInicio->isSunday()) {
                        $fechaInicio->addDay();
                        $fechaFinal->addDay(); // Ajustar también la fecha final
                    }

                    if ($fechaInicio->lte($fechaLimite)) {
                        $actividadRecurrente = $actividad->replicate();
                        $actividadRecurrente->fecha_inicio = $fechaInicio;
                        $actividadRecurrente->fecha_final = $fechaFinal;
                        $actividadRecurrente->save();
                    }
                }
            }

            
            if($validatedData['id_mantenimiento'] != null){
                $mantenimiento = mantenimientos::find($validatedData['id_mantenimiento']);
                $mantenimiento->fue_supervisado = 1;
                $mantenimiento->save();
            }
            if($validatedData['id_inspeccion'] != null){
                $inspeccion = inspecciones::find($validatedData['id_inspeccion']);
                $inspeccion->estado = 'Ninguno';
                $inspeccion->save();
            }
            if($validatedData['id_supervision'] != null){
                $inspeccion = supervision::find($validatedData['id_supervision']);
                $inspeccion->resumen_actividad = 'Deficiente calendarizado'; 
                $inspeccion->save();
            }
            // Crear un log para el registro
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó la actividad ID " . $actividad->id;
            $log->modulo = "Gestión de actividades";
            $log->save();

            DB::commit();

            return response()->json([
                'message' => 'Actividad creada correctamente',
                'actividad' => $actividad,
                'status' => 200
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear la actividad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_final' => 'required|date|after_or_equal:fecha_inicio',
            'es_recurrente' => 'required|boolean',
            'tiempo_recurrencia' => 'nullable|integer',
            'observaciones' => 'nullable|string|max:60000',
            'tipo_actividad' => 'required|string|in:Mantenimiento a infraestructura,Mantenimiento a equipo,Mantenimiento externo,Inspección a infraestructura,Inspección a equipo,Supervisión a infraestructura,Supervisión a equipo',
            'id_usuario' => 'required|integer',
            'estado' => 'required|string|in:Pendiente,Realizado,enProceso,Anulada',
            'id_inspeccion' => 'nullable|integer',
            'id_mantenimiento' => 'nullable|integer',
            'id_supervision' => 'nullable|integer',
            'fecha_limite' => 'nullable|date'
        ], [
            'fecha_inicio.required' => 'El campo de fecha de inicio es obligatorio.',
            'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida.',

            'fecha_final.required' => 'El campo de fecha de finalización es obligatorio.',
            'fecha_final.date' => 'La fecha de finalización debe ser una fecha válida.',
            'fecha_final.after_or_equal' => 'La fecha de finalización debe ser igual o posterior a la fecha de inicio.',

            'es_recurrente.required' => 'El campo de recurrencia es obligatorio.',
            'es_recurrente.boolean' => 'El campo de recurrencia debe ser un valor booleano (1 o 0).',

            'tiempo_recurrencia.integer' => 'El tiempo de recurrencia debe ser un número entero.',

            'observaciones.string' => 'El campo de observaciones debe ser una cadena de texto.',
            'observaciones.max' => 'El campo de observaciones no puede tener más de 60000 caracteres.',

            'tipo_actividad.required' => 'El tipo de actividad es obligatorio.',
            'tipo_actividad.string' => 'El tipo de actividad debe ser una cadena de texto.',
            'tipo_actividad.in' => 'El tipo de actividad debe ser uno de los siguientes: Mantenimiento, Inspección o Supervisión.',

            'id_usuario.required' => 'El campo de ID de usuario es obligatorio.',
            'id_usuario.integer' => 'El ID de usuario debe ser un número entero.',

            'estado.required' => 'El campo estado es obligatorio.',
            'estado.string' => 'El campo estado debe ser una cadena de texto.',
            'estado.in' => 'El campo estado debe ser uno de los siguientes: Pendiente, Realizado, enProceso, Anulada.',

            'id_inspeccion.integer' => 'El ID de inspección debe ser un número entero.',

            'id_mantenimiento.integer' => 'El ID de mantenimiento debe ser un número entero.',

            'id_supervision.integer' => 'El ID de supervisión debe ser un número entero.',
        ]);
        

        try {
            DB::beginTransaction();
            
            $actividad = calendarizacion::find($id);
            if (!$actividad) {
                return response()->json(['message' => 'Actividad no encontrada'], 404);
            }

            $actividad->fill($validatedData);
            $actividad->save();

            // Crear actividades recurrentes si es_recurrente es true
            if ($validatedData['es_recurrente']) {
                $fechaInicio = Carbon::parse($validatedData['fecha_inicio']);
                $fechaFinal = Carbon::parse($validatedData['fecha_final']);
                $fechaLimite =  Carbon::parse($validatedData['fecha_limite']);

                while ($fechaInicio->lt($fechaLimite)) {
                    $fechaInicio = $fechaInicio->addDays($validatedData['tiempo_recurrencia']);
                    $fechaFinal = $fechaFinal->addDays($validatedData['tiempo_recurrencia']);
                    if ($fechaInicio->lte($fechaLimite)) {
                        $actividadRecurrente = $actividad->replicate();
                        $actividadRecurrente->fecha_inicio = $fechaInicio;
                        $actividadRecurrente->fecha_final = $fechaFinal;
                        $actividadRecurrente->save();
                    }
                }
            }

            // Registrar la actualización en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó la actividad " .$log->tipo_actividad . " con ID " . $actividad->id;
            $log->modulo = "Gestión de calendarizacion";
            $log->save();

            DB::commit();

            return response()->json([
                'message' => 'Actividad actualizada correctamente',
                'actividad' => $actividad,
                'status' => 200
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar la actividad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function change($id)
    {
        try {
            DB::beginTransaction();

            $actividad = calendarizacion::findOrFail($id);
            $actividad->estado = "Anulada";
            $actividad->save();

            // Registrar el cambio de estado en los logs
            $log = new logs();
            $log->id_usuario = auth()->user()->id;
            $log->descripcion = "Canceló la actividad con ID " . $actividad->id;
            $log->modulo = "Gestión de actividades";
            $log->save();

            DB::commit();
            return response()->json(['success' => 'Estado actualizado correctamente', 'status' => 200]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al actualizar el estado: ' . $e->getMessage()], 500);
        }
    }
}
