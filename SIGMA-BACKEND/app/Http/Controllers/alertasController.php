<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\calendarizacion;
use App\Models\recursos;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class alertasController extends Controller
{
    public function obtener_actividades_vencidas()
    {
        try {
            $fechaActual = Carbon::now();
            $fechaActual = $fechaActual->subDay(); // Restar un día para incluir actividades que vencen hoy
            $fechaUltimaSemana = Carbon::now()->subWeek();

            if (auth()->user()->id_rol === 1){
                $actividades = Calendarizacion::where('fecha_final', '<=', $fechaActual)
                    ->where('fecha_final', '>=', $fechaUltimaSemana)
                    ->where('estado', '!=', 'Realizado')
                    ->where('estado', '!=', 'Anulada')
                    ->get();
            }else{
                $actividades = Calendarizacion::where('fecha_final', '<=', $fechaActual)
                    ->where('fecha_final', '>=', $fechaUltimaSemana)
                    ->where('estado', '!=', 'Realizado')
                    ->where('estado', '!=', 'Anulada')
                    ->where('id_usuario', '=' , auth()->user()->id)
                    ->get();
            }
                 
            // Agrupar actividades por tipo
            $resumen = [
                'total' => $actividades->count(),
                'por_tipo' => [
                    'Mantenimiento' => $actividades->filter(function($actividad) {
                        return str_contains($actividad->tipo_actividad, 'Mantenimiento');
                    })->count(),
                    'Inspeccion' => $actividades->filter(function($actividad) {
                        return str_contains($actividad->tipo_actividad, 'Inspección');
                    })->count(),
                    'Supervision' => $actividades->filter(function($actividad) {
                        return str_contains($actividad->tipo_actividad, 'Supervisión');
                    })->count(),
                ]
            ];

            return response()->json([
                'message' => 'Actividades vencidas recuperadas exitosamente',
                'data' => $resumen,
                'status' => 200
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las actividades vencidas',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }


    // Método opcional para obtener alertas por tipo específico
    public function obtener_alertas_por_tipo($tipo)
    {
        try {
            $fechaActual = Carbon::now();
            $fechaUltimaSemana = Carbon::now()->subWeek();

            $actividades = calendarizacion::where('fecha_final', '<=', $fechaActual)
                ->where('fecha_final', '>=', $fechaUltimaSemana)
                ->where('tipo_actividad', $tipo)
                ->where('estado', '!=', 'Realizado')
                ->where('estado', '!=', 'Anulada')
                ->get();

            return response()->json([
                'message' => "Alertas de tipo $tipo recuperadas exitosamente",
                'data' => [
                    'total' => $actividades->count(),
                    'actividades' => $actividades
                ],
                'status' => 200
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => "Error al obtener las alertas de tipo $tipo",
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    public function obtener_recursos_stock_minimo()
    {
        try {
            // Obtener solo recursos que están en o por debajo del mínimo
            $recursos = recursos::whereRaw('existencias <= existencias_minimas')
                ->where('estado', 'activo')
                ->select('id', 'nombre') // Seleccionar solo los campos necesarios
                ->get();

            // Crear el resumen simplificado
            $resumen = [
                'total' => $recursos->count(),
                'recursos' => $recursos
            ];

            return response()->json([
                'message' => 'Recursos con stock mínimo recuperados exitosamente',
                'data' => $resumen,
                'status' => 200
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener recursos con stock mínimo',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }
}