<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\recursos;
use Illuminate\Support\Facades\DB;
use App\Models\logs;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\ajustesRecursos;

class recursosController extends Controller
{
        public function get_recursosByState(Request $request)
    {
        try {
            $estado = $request->query('estado', 'Activo'); // Por defecto 'Activo' si no se especifica
            
            $recursos = recursos::where('estado', $estado)
                ->orderBy('id', 'asc')
                ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $recursos
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener los recursos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function get_recursos()
    {
        $recursos = recursos::orderBy("id", "asc")->get();
        return response()->json($recursos);
    }

    public function get_recurso($id)
    {
        $recurso = recursos::find($id);
        if ($recurso) {
            return response()->json($recurso);
        } else {
            return response()->json(['message' => 'Recurso no encontrado'], 404);
        }
    }

    public function create(Request $request)
    {
        // Validación de los datos
        $validatedData = $request->validate([
            'codigo' => 'required|string|max:100|unique:recursos,codigo',
            'nombre' => 'required|string|max:255',
            'area' => 'required|string|max:100',
            'descripcion' => 'required|string|max:1000',
            'existencias' => 'required|integer|min:0',
            'existencias_minimas' => 'required|integer|min:0',
            'precio' => 'required|numeric',
            'existencias_maximas' => [
                'required', 
                'integer', 
                'min:1',
                'gt:existencias_minimas'
            ],
            'estado' => 'required|string|in:Activo,Inactivo'
        ], [
            'codigo.required' => 'El campo código es obligatorio.',
            'codigo.string' => 'El campo código debe ser una cadena de texto.',
            'codigo.max' => 'El campo código no puede tener más de 100 caracteres.',
            'codigo.unique' => 'El código ya está en uso, ingrese uno diferente',

            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.string' => 'El campo nombre debe ser una cadena de texto.',
            'nombre.max' => 'El campo nombre no puede tener más de 255 caracteres.',

            'area.required' => 'El campo área es obligatorio.',
            'area.string' => 'El campo área debe ser una cadena de texto.',
            'area.max' => 'El campo área no puede tener más de 100 caracteres.',
        
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string' => 'El campo descripción debe ser una cadena de texto.',
            'descripcion.max' => 'El campo descripción no puede tener más de 1000 caracteres.',
        
            'existencias.required' => 'El campo existencias es obligatorio.',
            'existencias.integer' => 'El campo existencias debe ser un número entero.',
            'existencias.min' => 'El campo existencias debe ser al menos 0.',
        
            'existencias_minimas.required' => 'El campo existencias mínimas es obligatorio.',
            'existencias_minimas.integer' => 'El campo existencias mínimas debe ser un número entero.',
            'existencias_minimas.min' => 'El campo existencias mínimas no puede ser negativo.',

            'precio.required' => 'El campo precio es obligatorio.',
            'precio.numeric' => 'El campo precio debe ser un número en formato correcto (Ejemplo 100,000,000.00).',
        
            'existencias_maximas.required' => 'El campo existencias máximas es obligatorio.',
            'existencias_maximas.integer' => 'El campo existencias máximas debe ser un número entero.',
            'existencias_maximas.min' => 'El campo existencias máximas debe ser al menos 1.',
            'existencias_maximas.gt' => 'El campo existencias máximas debe ser mayor que existencias mínimas.',
        
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.string' => 'El campo estado debe ser una cadena de texto.',
            'estado.in' => 'El campo estado debe ser Activo o Inactivo.'
        ]);        
    
        try {
            DB::beginTransaction();
            $recurso = new recursos();
            $recurso->codigo = $validatedData['codigo'];
            $recurso->nombre = $validatedData['nombre'];
            $recurso->area = $validatedData['area'];
            $recurso->descripcion = $validatedData['descripcion'];
            $recurso->existencias = $validatedData['existencias'];
            $recurso->existencias_minimas = $validatedData['existencias_minimas'];
            $recurso->existencias_maximas = $validatedData['existencias_maximas'];
            $recurso->precio = $validatedData['precio'];
            $recurso->estado = $validatedData['estado'];
            $recurso->save();
    
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó el recurso " . $recurso->nombre;
            $log->modulo = "Gestión de recursos";
            $log->save();
    
            DB::commit();
    
            return response()->json([
                'message' => 'Recurso creado correctamente',
                'recurso' => $recurso,
                'status' => 200
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el recurso',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function update(Request $request, $id)
    {
        // Validación de los datos
        $validatedData = $request->validate([
            'codigo' => 'required|string|max:100',
            'nombre' => 'required|string|max:255',
            'area' => 'required|string|max:100',
            'descripcion' => 'required|string|max:1000',
            'existencias' => 'required|integer|min:0',
            'existencias_minimas' => 'required|integer|min:0',
            'precio' => 'required|numeric',
            'existencias_maximas' => [
                'required', 
                'integer', 
                'min:1',
                'gt:existencias_minimas'
            ],
            'estado' => 'required|string|in:Activo,Inactivo'
        ], [
            'codigo.required' => 'El campo código es obligatorio.',
            'codigo.string' => 'El campo código debe ser una cadena de texto.',
            'codigo.max' => 'El campo código no puede tener más de 100 caracteres.',

            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.string' => 'El campo nombre debe ser una cadena de texto.',
            'nombre.max' => 'El campo nombre no puede tener más de 255 caracteres.',

            'area.required' => 'El campo área es obligatorio.',
            'area.string' => 'El campo área debe ser una cadena de texto.',
            'area.max' => 'El campo área no puede tener más de 100 caracteres.',
        
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string' => 'El campo descripción debe ser una cadena de texto.',
            'descripcion.max' => 'El campo descripción no puede tener más de 1000 caracteres.',
        
            'existencias.required' => 'El campo existencias es obligatorio.',
            'existencias.integer' => 'El campo existencias debe ser un número entero.',
            'existencias.min' => 'El campo existencias debe ser al menos 0.',
        
            'existencias_minimas.required' => 'El campo existencias mínimas es obligatorio.',
            'existencias_minimas.integer' => 'El campo existencias mínimas debe ser un número entero.',
            'existencias_minimas.min' => 'El campo existencias mínimas no puede ser negativo.',

            'precio.required' => 'El campo precio es obligatorio.',            
            'precio.numeric' => 'El campo precio debe ser un número en formato correcto (Ejemplo 100,000,000.00).',
        
            
            'existencias_maximas.required' => 'El campo existencias máximas es obligatorio.',
            'existencias_maximas.integer' => 'El campo existencias máximas debe ser un número entero.',
            'existencias_maximas.min' => 'El campo existencias máximas debe ser al menos 1.',
            'existencias_maximas.gt' => 'El campo existencias máximas debe ser mayor que existencias mínimas.',
        
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.string' => 'El campo estado debe ser una cadena de texto.',
            'estado.in' => 'El campo estado debe ser Activo o Inactivo.'
        ]);  
    
        try {
            DB::beginTransaction();
            $recurso = recursos::find($id);
            if (!$recurso) {
                return response()->json(['message' => 'Recurso no encontrado'], 404);
            }
    
            $recurso->codigo = $validatedData['codigo'];
            $recurso->nombre = $validatedData['nombre'];
            $recurso->area = $validatedData['area'];
            $recurso->descripcion = $validatedData['descripcion'];
            $recurso->existencias = $validatedData['existencias'];
            $recurso->existencias_minimas = $validatedData['existencias_minimas'];
            $recurso->existencias_maximas = $validatedData['existencias_maximas'];
            $recurso->precio = $validatedData['precio'];
            $recurso->estado = $validatedData['estado'];
            $recurso->save();
    
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Actualizó el recurso " . $recurso->nombre;
            $log->modulo = "Gestión de recursos";
            $log->save();
    
            DB::commit();
    
            return response()->json([
                'message' => 'Recurso actualizado correctamente',
                'recurso' => $recurso,
                'status' => 200
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el recurso',
                'error' => $e->getMessage()
            ], 500);
        }
    }    

    public function change($id)
{
    try {
        DB::beginTransaction(); // Inicia la transacción

        $recurso = recursos::findOrFail($id); // Busca el recurso o lanza una excepción si no se encuentra
        // Alterna el estado del recurso
        if ($recurso->estado === "Activo") {
            $recurso->estado = "Inactivo";
        } else {
            $recurso->estado = "Activo";
        }
        $recurso->save(); // Guarda el cambio de estado

        // Crear un registro en los logs
        $log = new logs();
        $log->id_usuario = auth()->user()->id;
        $log->descripcion = "Cambió el estado del recurso " . $recurso->nombre;
        $log->modulo = "Gestión de recursos";
        $log->save(); // Guarda el registro del log

        DB::commit(); // Confirma la transacción
        return response()->json(['success' => 'Estado actualizado correctamente', 'status' => 200]);

    } catch (\Exception $e) {
        DB::rollBack(); // Revierte la transacción si hay un error
        return response()->json(['error' => 'Error al actualizar el estado: ' . $e->getMessage()], 500);
    }
}

    public function crear_ajuste_recurso(Request $request){
        $validator = Validator::make($request->all(), [
            'id_recurso' => 'required|integer',
            'cantidad' => 'required|integer',
            'tipo' => 'required|string|in:Aumento,Reduccion',
            'motivo' => 'required|string|max:255'
        ], [
            'id_recurso.required' => 'El campo id_recurso es obligatorio.',
            'id_recurso.integer' => 'El campo id_recurso debe ser un número entero.',

            'cantidad.required' => 'El campo cantidad es obligatorio.',
            'cantidad.integer' => 'El campo cantidad debe ser un número entero.',

            'tipo.required' => 'El campo tipo es obligatorio.',
            'tipo.string' => 'El campo tipo debe ser una cadena de texto.',
            'tipo.in' => 'El campo tipo debe ser Aumento o Reduccion.',
            
            'motivo.required' => 'El campo motivo es obligatorio.',
            'motivo.string' => 'El campo motivo debe ser una cadena de texto.',
            'motivo.max' => 'El campo motivo no puede tener más de 255 caracteres.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }

        try {
            DB::beginTransaction();
            $recurso = recursos::find($request->id_recurso);
            if (!$recurso) {
                return response()->json(['message' => 'Recurso no encontrado'], 404);
            }

            if ($request->tipo === 'Reduccion' && $recurso->existencias < $request->cantidad) {
                return response()->json(['message' => 'No hay suficientes existencias para realizar la reducción'], 400);
            }

            $ajuste = new ajustesRecursos();
            $ajuste->id_recurso = $request->id_recurso;
            $ajuste->cantidad = $request->cantidad;
            $ajuste->tipo = $request->tipo;
            $ajuste->motivo = $request->motivo;
            $ajuste->save();

            if ($request->tipo === 'Aumento') {
                $recurso->existencias += $request->cantidad;
            } else {
                $recurso->existencias -= $request->cantidad;
            }
            
            $recurso->save();

            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Realizó un ajuste de " . $request->tipo . " de " . $request->cantidad . " unidades al recurso " . $recurso->nombre;
            $log->modulo = "Gestión de recursos";
            $log->save();

            DB::commit();
            return response()->json([
                'message' => 'Ajuste realizado correctamente',
                'status' => 200
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al realizar el ajuste',
                'error' => $e->getMessage()
            ], 500);
        }
        
    }


    public function get_ajustes_recursos()
    {
        $ajustes = ajustesRecursos::with('recurso')->orderBy("id", "asc")->get();

        $ajustes_formateado = [];
        foreach ($ajustes as $ajuste) {
            $model = [
                'id' => $ajuste->id,
                'id_recurso' => $ajuste->id_recurso,
                'recurso' => $ajuste->recurso->nombre,
                'cantidad' => $ajuste->cantidad,
                'tipo' => $ajuste->tipo,
                'motivo' => $ajuste->motivo,
                'created_at' => $ajuste->created_at
            ];
            array_push($ajustes_formateado, $model);
        }
        return response()->json($ajustes_formateado);
    }
    

}
