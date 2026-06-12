<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ajustesPresupuesto;
use App\Models\presupuestos;
use Illuminate\Support\Facades\DB;
use App\Models\logs;
use Illuminate\Support\Facades\Validator;

class ajustesPresupuestoController extends Controller
{
    public function get_ajustes_presupuestos()
    {
        $ajustes = DB::select('SELECT ap.id, ap.id_presupuesto, p.area, ap.cantidad, ap.tipo, ap.motivo
        FROM ajustes_presupuestos as ap JOIN presupuestos as p On
        ap.id_presupuesto = p.id  ORDER BY id ASC');
        return response()->json($ajustes);
    }

    public function create(Request $request)
    {
        // Validaciones
        $validatedData = Validator::make($request->all(), [
            'area' => 'required|string|exists:presupuestos,area',
            'cantidad' => 'required|numeric|min:0',
            'tipo' => 'required|in:Aumento,Reduccion',
            'motivo' => 'required|string|max:255'
        ], [
            'area.required' => 'El campo área es obligatorio.',
            'area.string' => 'El campo área debe ser una cadena de texto.',
            'area.exists' => 'No existe un presupuesto para el área especificada.',
    
            'cantidad.required' => 'El campo cantidad es obligatorio.',
            'cantidad.numeric' => 'El campo cantidad debe ser un número.',
            'cantidad.min' => 'El campo cantidad no puede ser negativo.',
    
            'tipo.required' => 'El campo tipo es obligatorio.',
            'tipo.in' => 'El campo tipo debe ser Aumento o Reduccion.',
    
            'motivo.required' => 'El campo motivo es obligatorio.',
            'motivo.string' => 'El campo motivo debe ser una cadena de texto.',
            'motivo.max' => 'El campo motivo no puede tener más de 255 caracteres.',
        ]);
    
        // Verificar si las validaciones fallan
        if ($validatedData->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validatedData->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }
    
        try {
            DB::beginTransaction();
    
            // Buscar el presupuesto activo para el área especificada
            $presupuesto = Presupuestos::where('area', $request->area)
                ->where('estado', 'Activo')
                ->first();
    
            // Verificar que se encontró un presupuesto activo
            if (!$presupuesto) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Los datos proporcionados no son válidos.',
                    'errors' => [
                        'area' => ['No existe presupuesto para el área ' . $request->area]
                    ]
                ], 404);
            }
    
            // Crear el ajuste de presupuesto
            $ajuste = new AjustesPresupuesto();
            $ajuste->id_presupuesto = $presupuesto->id;
            $ajuste->cantidad = $request->input('cantidad');
            $ajuste->tipo = $request->input('tipo');
            $ajuste->motivo = $request->input('motivo');
            $ajuste->save();
            $signo = "+";

            // Actualizar el presupuesto
            if ($ajuste->tipo === 'Aumento') {
                $presupuesto->monto_pendiente += $ajuste->cantidad;
                $presupuesto->monto_presupuesto += $ajuste->cantidad;
                $signo = "+";
            } elseif ($ajuste->tipo === 'Reduccion') {
                $presupuesto->monto_pendiente -= $ajuste->cantidad;
                $presupuesto->monto_presupuesto -= $ajuste->cantidad;
                $signo = "-";
            }
            $presupuesto->save();
    
            // Registrar la acción en los logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó un ajuste de " . $signo . $ajuste->cantidad ." para el presupuesto con ID ". $presupuesto->id;
            $log->modulo = "Ajuste de presupuestos";
            $log->save();
    
            DB::commit();
    
            return response()->json([
                'message' => 'Ajuste de presupuesto creado y presupuesto actualizado correctamente',
                'ajuste' => $ajuste,
                'presupuesto' => $presupuesto,
                'status' => 200
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el ajuste de presupuesto',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
}
