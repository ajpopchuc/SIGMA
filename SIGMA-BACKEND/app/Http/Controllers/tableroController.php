<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\inspecciones;
use Illuminate\Support\Facades\DB;
class tableroController extends Controller
{
    public function get_inpsecciones_tablero(Request $request)
    {
        $startDate = $request->input('fechaInicio');
        $endDate = $request->input('fechaFin');

        $inspecciones = DB::table('inspecciones')
            ->select([
                DB::raw('COUNT(*) as total'),
                DB::raw("COUNT(CASE WHEN motivo = 'Correctivo' THEN 1 END) as correctivos"),
                DB::raw("COUNT(CASE WHEN motivo != 'Correctivo' THEN 1 END) as preventivos"),
                DB::raw("COUNT(CASE WHEN tipo_inspeccion = 'Infraestructura' THEN 1 END) as infraestructura_total"),
                DB::raw("COUNT(CASE WHEN tipo_inspeccion = 'Infraestructura' AND motivo = 'Correctivo' THEN 1 END) as infraestructura_correctivos"),
                DB::raw("COUNT(CASE WHEN tipo_inspeccion = 'Infraestructura' AND motivo != 'Correctivo' THEN 1 END) as infraestructura_preventivos"),
                DB::raw("COUNT(CASE WHEN tipo_inspeccion = 'Equipos' THEN 1 END) as equipos_total"),
                DB::raw("COUNT(CASE WHEN tipo_inspeccion = 'Equipos' AND motivo = 'Correctivo' THEN 1 END) as equipos_correctivos"),
                DB::raw("COUNT(CASE WHEN tipo_inspeccion = 'Equipos' AND motivo != 'Correctivo' THEN 1 END) as equipos_preventivos")
            ])
            ->whereBetween('fecha_inspeccion', [$startDate, $endDate])
            ->first();

        $startDateTime = new \DateTime($startDate);
        $endDateTime = new \DateTime($endDate);
        $daysInRange = $startDateTime->diff($endDateTime)->days + 1;
        $allDays = array_fill(1, $daysInRange, 0);

        $inspeccionesPorDia = DB::table('inspecciones')
            ->select([
                DB::raw('DATE(fecha_inspeccion) as dia'),
                DB::raw('COUNT(*) as total')
            ])
            ->whereBetween('fecha_inspeccion', [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(fecha_inspeccion)'))
            ->get();

        $diasCompletos = [];
        for ($date = new \DateTime($startDate); $date <= new \DateTime($endDate); $date->modify('+1 day')) {
            $currentDate = $date->format('Y-m-d');
            $total = $inspeccionesPorDia->where('dia', $currentDate)->first();
            $diasCompletos[] = [
                'dia' => intval($date->format('d')),
                'total' => $total ? $total->total : 0
            ];
        }

        $response = [
            "data" => [
                "total" => $inspecciones->total,
                "motivo" => [
                    "Correctivo" => $inspecciones->correctivos,
                    "Preventivo" => $inspecciones->preventivos
                ],
                "tipo" => [
                    "infraestructura" => [
                        "total" => $inspecciones->infraestructura_total,
                        "Correctivo" => $inspecciones->infraestructura_correctivos,
                        "Preventivo" => $inspecciones->infraestructura_preventivos
                    ],
                    "equipos" => [
                        "Correctivo" => $inspecciones->equipos_correctivos,
                        "Preventivo" => $inspecciones->equipos_preventivos
                    ]
                ],
                "por_dia" => $diasCompletos
            ]
        ];

        return response()->json($response);
    }

    public function get_mantenimientos_tablero(Request $request)
    {
        $startDate = $request->input('fechaInicio');
        $endDate = $request->input('fechaFin');

        $mantenimientos = DB::table('mantenimientos')
            ->select([
                DB::raw('COUNT(*) as total'),
                DB::raw("COUNT(CASE WHEN tipo_mantenimiento = 'Correctivo' THEN 1 END) as correctivos"),
                DB::raw("COUNT(CASE WHEN tipo_mantenimiento != 'Correctivo' THEN 1 END) as preventivos"),

                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Infraestructura' THEN 1 END) as infraestructura_total"),
                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Infraestructura' AND tipo_mantenimiento = 'Correctivo' THEN 1 END) as infraestructura_correctivos"),
                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Infraestructura' AND tipo_mantenimiento != 'Correctivo' THEN 1 END) as infraestructura_preventivos"),

                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Equipos' THEN 1 END) as equipos_total"),
                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Equipos' AND tipo_mantenimiento = 'Correctivo' THEN 1 END) as equipos_correctivos"),
                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Equipos' AND tipo_mantenimiento != 'Correctivo' THEN 1 END) as equipos_preventivos"),

                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Externo/Equipo' THEN 1 END) as externos_total"),
                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Externo/Equipo' AND tipo_mantenimiento = 'Correctivo' THEN 1 END) as externos_correctivos"),
                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Externo/Equipo' AND tipo_mantenimiento != 'Correctivo' THEN 1 END) as externos_preventivos")
            ])
            ->whereBetween('fecha_mantenimiento', [$startDate, $endDate])
            ->first();

        $mantenimientosPorDia = DB::table('mantenimientos')
            ->select([
                DB::raw('DATE(fecha_mantenimiento) as dia'),
                DB::raw('COUNT(*) as total')
            ])
            ->whereBetween('fecha_mantenimiento', [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(fecha_mantenimiento)'))
            ->get();

        $diasCompletos = [];
        for ($date = new \DateTime($startDate); $date <= new \DateTime($endDate); $date->modify('+1 day')) {
            $currentDate = $date->format('Y-m-d');
            $total = $mantenimientosPorDia->where('dia', $currentDate)->first();
            $diasCompletos[] = [
                'dia' => intval($date->format('d')),
                'total' => $total ? $total->total : 0
            ];
        }

        $response = [
            "data" => [
                "total" => $mantenimientos->total,
                "motivo" => [
                    "Correctivo" => $mantenimientos->correctivos,
                    "Preventivo" => $mantenimientos->preventivos
                ],
                "tipo" => [
                    "infraestructura" => [
                        "total" => $mantenimientos->infraestructura_total,
                        "Correctivo" => $mantenimientos->infraestructura_correctivos,
                        "Preventivo" => $mantenimientos->infraestructura_preventivos
                    ],
                    "equipos" => [
                        "total" => $mantenimientos->equipos_total,
                        "Correctivo" => $mantenimientos->equipos_correctivos,
                        "Preventivo" => $mantenimientos->equipos_preventivos
                    ],
                    "externos" => [
                        "total" => $mantenimientos->externos_total,
                        "Correctivo" => $mantenimientos->externos_correctivos,
                        "Preventivo" => $mantenimientos->externos_preventivos
                    ]
                ],
                "por_dia" => $diasCompletos
            ]
        ];

        return response()->json($response);
    }

    public function get_supervisiones_tablero(Request $request)
    {
        $startDate = $request->input('fechaInicio');
        $endDate = $request->input('fechaFin');
        $inspecciones = DB::table('supervision')
            ->select([
                DB::raw('COUNT(*) as total'),
                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Infraestructura' THEN 1 END) as infraestructura_total"),
                DB::raw("COUNT(CASE WHEN lugar_mantenimiento = 'Equipo' THEN 1 END) as equipos_total"),
            ])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->first();

        $inspeccionesPorDia = DB::table('supervision')
            ->select([
                DB::raw('DATE(created_at) as dia'),
                DB::raw('COUNT(*) as total')
            ])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get();

        $diasCompletos = [];
        for ($date = new \DateTime($startDate); $date <= new \DateTime($endDate); $date->modify('+1 day')) {
            $currentDate = $date->format('Y-m-d');
            $total = $inspeccionesPorDia->where('dia', $currentDate)->first();
            $diasCompletos[] = [
                'dia' => intval($date->format('d')),
                'total' => $total ? $total->total : 0
            ];
        }

        $response = [
            "data" => [
                "total" => $inspecciones->total,
                "tipo" => [
                    "infraestructura" => [
                        "total" => $inspecciones->infraestructura_total
                    ],
                    "equipos" => [
                        "total" => $inspecciones->equipos_total
                    ]
                ],
                "por_dia" => $diasCompletos
            ]
        ];

        return response()->json($response);
    }
}
