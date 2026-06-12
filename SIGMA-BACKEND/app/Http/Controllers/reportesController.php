<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\logs;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\compras;
use App\Models\recursos;
use App\Models\mantenimientos;
use App\Models\inspecciones;
use App\Models\supervision;
use App\Models\usuarios;
use Carbon\Carbon;

class reportesController extends Controller
{
    public function get_gasto_total(Request $request)
    {
        $fecha_inicio = $request->fecha_inicio;
        $fecha_fin = $request->fecha_fin;
        $categoria = $request->categoria;
        
        if($categoria == 'Todos'){
            // Para todos los registros, obtiene los detalles completos sin agrupar
            $compras = compras::whereBetween('fecha_factura', [$fecha_inicio, $fecha_fin])
                ->select('fecha_factura', 'no_factura', 'serie_factura', 'total', 'area')
                ->orderBy('fecha_factura', 'desc')
                ->get();
        } else {
            // Para cada categoría individual
            $compras = compras::whereBetween('fecha_factura', [$fecha_inicio, $fecha_fin])
                ->where('area', $categoria)
                ->select('fecha_factura', 'no_factura', 'serie_factura', 'total', 'area')
                ->orderBy('fecha_factura', 'desc')
                ->get();
        }

        // Formatear las fechas en español
        $data = $compras->map(function($compra) {
            return [
                'fecha_factura' => Carbon::parse($compra->fecha_factura)->locale('es_ES')->isoFormat('dddd D [de] MMMM [de] YYYY'),
                'no_factura' => $compra->no_factura,
                'serie_factura' => $compra->serie_factura,
                'total' => $compra->total,
                'area' => $compra->area
            ];
        });
        
        $log = new logs();
        $log->id_usuario = $request->user()->id;
        $log->descripcion = "Generó un reporte de gasto total";
        $log->modulo  = "Reportes";
        $log->save();

        return response()->json($data);
    }


    public function get_stock_recursos(Request $request)
    {
        $recursos = recursos::select('id', 'nombre', 'descripcion', 'existencias', 'precio')
        ->orderBy('id', 'desc')
        ->get();    

        $log = new logs();
        $log->id_usuario = $request->user()->id;
        $log->descripcion = "Generó un reporte de stock de recursos";
        $log->modulo  = "Reportes";
        $log->save();

        return response()->json($recursos);
        
        
    }

    public function get_actividades_usuario(Request $request)
    {
        // Validar entrada
        $validator = Validator::make($request->all(), [
            'id_usuario' => 'required|exists:usuarios,id',
            'tipo_actividad' => 'required|in:mantenimiento,inspeccion,supervision,todos',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $id_usuario = $request->id_usuario;
        $tipo_actividad = $request->tipo_actividad;
        $fecha_inicio = $request->fecha_inicio;
        $fecha_fin = $request->fecha_fin;

        $resultado = [];

        // Si se solicitan todas las actividades o específicamente mantenimientos
        if ($tipo_actividad == 'todos' || $tipo_actividad == 'mantenimiento') {
            $mantenimientos = mantenimientos::where('id_usuario', $id_usuario)
                ->whereBetween('fecha_mantenimiento', [$fecha_inicio, $fecha_fin])
                ->select(
                    DB::raw('COUNT(*) as total'),
                    DB::raw("DATE_FORMAT(fecha_mantenimiento, '%Y-%m-%d') as mes_original"),
                    DB::raw('fecha_mantenimiento'),
                    DB::raw("'mantenimiento' as tipo")
                )
                ->groupBy('mes_original', 'fecha_mantenimiento')
                ->get()
                ->map(function($item) {
                    return [
                        'total' => $item->total,
                        'mes' => Carbon::parse($item->fecha_mantenimiento)->locale('es_ES')->isoFormat('dddd D [de] MMMM [de] YYYY'),
                        'tipo' => $item->tipo
                    ];
                });
            $resultado = array_merge($resultado, $mantenimientos->toArray());
        }

        // Si se solicitan todas las actividades o específicamente inspecciones
        if ($tipo_actividad == 'todos' || $tipo_actividad == 'inspeccion') {
            $inspecciones = inspecciones::where('id_usuario', $id_usuario)
                ->whereBetween('fecha_inspeccion', [$fecha_inicio, $fecha_fin])
                ->select(
                    DB::raw('COUNT(*) as total'),
                    DB::raw("DATE_FORMAT(fecha_inspeccion, '%Y-%m-%d') as mes_original"),
                    DB::raw('fecha_inspeccion'),
                    DB::raw("'inspeccion' as tipo")
                )
                ->groupBy('mes_original', 'fecha_inspeccion')
                ->get()
                ->map(function($item) {
                    return [
                        'total' => $item->total,
                        'mes' => Carbon::parse($item->fecha_inspeccion)->locale('es_ES')->isoFormat('dddd D [de] MMMM [de] YYYY'),
                        'tipo' => $item->tipo
                    ];
                });
            $resultado = array_merge($resultado, $inspecciones->toArray());
        }

        // Si se solicitan todas las actividades o específicamente supervisiones
        if ($tipo_actividad == 'todos' || $tipo_actividad == 'supervision') {
            $supervisiones = supervision::where('id_usuario', $id_usuario)
                ->whereBetween('created_at', [$fecha_inicio, $fecha_fin])
                ->select(
                    DB::raw('COUNT(*) as total'),
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m-%d') as mes_original"),
                    DB::raw('created_at'),
                    DB::raw("'supervision' as tipo")
                )
                ->groupBy('mes_original', 'created_at')
                ->get()
                ->map(function($item) {
                    return [
                        'total' => $item->total,
                        'mes' => Carbon::parse($item->created_at)->locale('es_ES')->isoFormat('dddd D [de] MMMM [de] YYYY'),
                        'tipo' => $item->tipo
                    ];
                });
            $resultado = array_merge($resultado, $supervisiones->toArray());
        }

        // Registrar la actividad en el log
        $log = new logs();
        $log->id_usuario = $request->user()->id;
        $log->descripcion = "Generó un reporte de actividades por usuario";
        $log->modulo = "Reportes";
        $log->save();

        return response()->json([
            'status' => 'success',
            'data' => $resultado,
            'message' => 'Reporte generado exitosamente'
        ]);
    }

    // Método adicional para obtener la lista de usuarios para el selector
    public function get_usuarios()
    {
        $usuarios = usuarios::select('id', 'usuario')
            ->where('estado', 'Activo')
            ->get();

        return response()->json($usuarios);
    }

    public function get_horas_hombre(Request $request)
{
    // Validar entrada
    $validator = Validator::make($request->all(), [
        'id_usuario' => 'required|exists:usuarios,id',
        'tipo_actividad' => 'required|in:mantenimiento,inspeccion,supervision,todos',
        'fecha_inicio' => 'required|date',
        'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $id_usuario = $request->id_usuario;
    $tipo_actividad = $request->tipo_actividad;
    $fecha_inicio = $request->fecha_inicio;
    $fecha_fin = $request->fecha_fin;

    $resultado = [];

    // Si se solicitan todas las actividades
    if ($tipo_actividad == 'todos') {
        // Obtener suma total de mantenimientos
        $mantenimientos = mantenimientos::where('id_usuario', $id_usuario)
            ->whereBetween('fecha_mantenimiento', [$fecha_inicio, $fecha_fin])
            ->select(
                DB::raw('COUNT(*) as total_actividades'),
                DB::raw('SUM(CASE 
                    WHEN tiempo_ejecucion REGEXP "^[0-9]+$" THEN tiempo_ejecucion
                    WHEN tiempo_ejecucion REGEXP "^[0-9]+:[0-9]+$" THEN 
                        TIME_TO_SEC(tiempo_ejecucion)/60
                    WHEN tiempo_ejecucion REGEXP "^[0-9]+(\.[0-9]+)?$" THEN 
                        CAST(tiempo_ejecucion AS DECIMAL(10,2))
                    ELSE 0 
                END) as horas_totales'),
                DB::raw("'mantenimiento' as tipo")
            )
            ->first();
        
        // Obtener suma total de inspecciones
        $inspecciones = inspecciones::where('id_usuario', $id_usuario)
            ->whereBetween('fecha_inspeccion', [$fecha_inicio, $fecha_fin])
            ->select(
                DB::raw('COUNT(*) as total_actividades'),
                DB::raw('SUM(CASE 
                    WHEN tiempo_ejecucion REGEXP "^[0-9]+$" THEN tiempo_ejecucion
                    WHEN tiempo_ejecucion REGEXP "^[0-9]+:[0-9]+$" THEN 
                        TIME_TO_SEC(tiempo_ejecucion)/60
                    WHEN tiempo_ejecucion REGEXP "^[0-9]+(\.[0-9]+)?$" THEN 
                        CAST(tiempo_ejecucion AS DECIMAL(10,2))
                    ELSE 0 
                END) as horas_totales'),
                DB::raw("'inspeccion' as tipo")
            )
            ->first();
        
        // Obtener suma total de supervisiones
        $supervisiones = supervision::where('id_usuario', $id_usuario)
            ->whereBetween('created_at', [$fecha_inicio, $fecha_fin])
            ->select(
                DB::raw('COUNT(*) as total_actividades'),
                DB::raw('SUM(CASE 
                    WHEN tiempo_ejecucion REGEXP "^[0-9]+$" THEN tiempo_ejecucion
                    WHEN tiempo_ejecucion REGEXP "^[0-9]+:[0-9]+$" THEN 
                        TIME_TO_SEC(tiempo_ejecucion)/60
                    WHEN tiempo_ejecucion REGEXP "^[0-9]+(\.[0-9]+)?$" THEN 
                        CAST(tiempo_ejecucion AS DECIMAL(10,2))
                    ELSE 0 
                END) as horas_totales'),
                DB::raw("'supervision' as tipo")
            )
            ->first();

        // Agregar cada tipo al resultado si tiene actividades
        if ($mantenimientos && $mantenimientos->total_actividades > 0) {
            $resultado[] = $this->formatearTiempo($mantenimientos);
        }
        if ($inspecciones && $inspecciones->total_actividades > 0) {
            $resultado[] = $this->formatearTiempo($inspecciones);
        }
        if ($supervisiones && $supervisiones->total_actividades > 0) {
            $resultado[] = $this->formatearTiempo($supervisiones);
        }

        // Calcular total general
        $total_actividades = ($mantenimientos->total_actividades ?? 0) + 
                           ($inspecciones->total_actividades ?? 0) + 
                           ($supervisiones->total_actividades ?? 0);
                           
        $total_horas = ($mantenimientos->horas_totales ?? 0) + 
                      ($inspecciones->horas_totales ?? 0) + 
                      ($supervisiones->horas_totales ?? 0);

        // Agregar total general
        if ($total_actividades > 0) {
            $resultado[] = [
                'total_actividades' => $total_actividades,
                'tiempo_total' => $this->convertirHorasAFormato($total_horas),
                'tipo' => 'total_general'
            ];
        }
    } else {
        // Si se solicita un tipo específico
        $query = null;
        $fecha_campo = '';
        
        switch ($tipo_actividad) {
            case 'mantenimiento':
                $query = mantenimientos::where('id_usuario', $id_usuario);
                $fecha_campo = 'fecha_mantenimiento';
                break;
            case 'inspeccion':
                $query = inspecciones::where('id_usuario', $id_usuario);
                $fecha_campo = 'fecha_inspeccion';
                break;
            case 'supervision':
                $query = supervision::where('id_usuario', $id_usuario);
                $fecha_campo = 'created_at';
                break;
        }

        if ($query) {
            $total = $query
                ->whereBetween($fecha_campo, [$fecha_inicio, $fecha_fin])
                ->select(
                    DB::raw('COUNT(*) as total_actividades'),
                    DB::raw('SUM(CASE 
                        WHEN tiempo_ejecucion REGEXP "^[0-9]+$" THEN tiempo_ejecucion
                        WHEN tiempo_ejecucion REGEXP "^[0-9]+:[0-9]+$" THEN 
                            TIME_TO_SEC(tiempo_ejecucion)/60
                        WHEN tiempo_ejecucion REGEXP "^[0-9]+(\.[0-9]+)?$" THEN 
                            CAST(tiempo_ejecucion AS DECIMAL(10,2))
                        ELSE 0 
                    END) as horas_totales'),
                    DB::raw("'$tipo_actividad' as tipo")
                )
                ->first();

            if ($total && $total->total_actividades > 0) {
                $resultado[] = $this->formatearTiempo($total);
            }
        }
    }

    // Registrar la actividad en el log
    $log = new logs();
    $log->id_usuario = $request->user()->id;
    $log->descripcion = "Generó un reporte de horas hombre";
    $log->modulo = "Reportes";
    $log->save();

    return response()->json([
        'status' => 'success',
        'data' => $resultado,
        'message' => 'Reporte generado exitosamente'
    ]);
}

private function formatearTiempo($registro)
{
    return [
        'total_actividades' => $registro->total_actividades,
        'tiempo_total' => $this->convertirHorasAFormato($registro->horas_totales ?? 0),
        'tipo' => $registro->tipo
    ];
}

private function convertirHorasAFormato($horas)
{
    $horas_completas = floor($horas);
    $minutos = round(($horas - $horas_completas) * 60);
    return sprintf("%d:%02d", $horas_completas, $minutos);
}

    
}
