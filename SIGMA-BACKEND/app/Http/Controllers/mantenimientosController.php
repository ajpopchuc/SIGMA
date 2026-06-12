<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\logs;
use App\Models\mantenimientos;
use App\Models\mantenimientos_detalle;
use App\Models\activos;
use App\Models\recursos;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Validator;
use App\Models\mantenimiento_supervisiones_inspecciones_fotografias;
use App\Models\calendarizacion;
use Intervention\Image\Facades\Image;

class mantenimientosController extends Controller
{
    public function get_equipos()
    {
        $mantenimientos = mantenimientos::with(['instalaciones', 'usuarios'])
            ->where('lugar_mantenimiento', 'Equipo')
            ->where('estado', 'Activo')
            ->get();

        $data = [];

        foreach ($mantenimientos as $mantenimiento) {
            $activos = explode(',', $mantenimiento->id_activos);
            $activos = activos::whereIn('id', $activos)->get(['nombre'])->pluck('nombre')->toArray();
            Carbon::setLocale('es');
            $fechaFormateada = Carbon::parse($mantenimiento->fecha_mantenimiento)->translatedFormat('l j \\de F \\de Y');
            $model = [
                "id" => $mantenimiento->id,
                "fecha_mantenimiento" => $fechaFormateada,
                "id_instalacion" => $mantenimiento->id_instalacion,
                "instalacion" => $mantenimiento->instalaciones->nombre ?? '', 
                "id_usuario" => $mantenimiento->id_usuario,
                "usuario" => $mantenimiento->usuarios->usuario ?? '', 
                "id_activos" => $mantenimiento->id_activos,
                "activos" => $activos,
                "nivel_atendido" => $mantenimiento->nivel_atendido,
                "tipo" => $mantenimiento->tipo,
                "cantidad_atendida" => $mantenimiento->cantidad_atendida,
                "unidad_medida" => $mantenimiento->unidad_medida,
                "descripcion" => $mantenimiento->descripcion,
                "resumen_actividad" => $mantenimiento->resumen_actividad,
                "tiempo_ejecucion" => $mantenimiento->tiempo_ejecucion,
                "monto_total" => $mantenimiento->monto_total,
                "motivo_actividad" => $mantenimiento->motivo_actividad,
                "observaciones" => $mantenimiento->observaciones,
                "id_calendario" => $mantenimiento->id_calendario,
                "tipo_mantenimiento" => $mantenimiento->tipo_mantenimiento,
                "lugar_mantenimiento" => $mantenimiento->lugar_mantenimiento,
                "fue_supervisado" => $mantenimiento->fue_supervisado,
                "estado" => $mantenimiento->estado,
                "created_at" => $mantenimiento->created_at,
                "updated_at" => $mantenimiento->updated_at,
                "actions" => ""
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

    public function get_infraestructuras()
    {
        $mantenimientos = mantenimientos::with(['instalaciones', 'usuarios'])
            ->where('lugar_mantenimiento', 'Infraestructura')
            ->where('estado', 'Activo')
            ->get();

        $data = [];

        foreach ($mantenimientos as $mantenimiento) {
            $activos = explode(',', $mantenimiento->id_activos);
            $activos = array_map('trim', $activos);
            Carbon::setLocale('es');
            $fechaFormateada = Carbon::parse($mantenimiento->fecha_mantenimiento)->translatedFormat('l j \\de F \\de Y');
            $model = [
                "id" => $mantenimiento->id,
                "fecha_mantenimiento" => $fechaFormateada,
                "id_instalacion" => $mantenimiento->id_instalacion,
                "instalacion" => $mantenimiento->instalaciones->nombre ?? '', 
                "id_usuario" => $mantenimiento->id_usuario,
                "usuario" => $mantenimiento->usuarios->usuario ?? '', 
                "id_activos" => $mantenimiento->id_activos,
                "activos" => $activos,
                "nivel_atendido" => $mantenimiento->nivel_atendido,
                "tipo" => $mantenimiento->tipo,
                "cantidad_atendida" => $mantenimiento->cantidad_atendida,
                "unidad_medida" => $mantenimiento->unidad_medida,
                "descripcion" => $mantenimiento->descripcion,
                "resumen_actividad" => $mantenimiento->resumen_actividad,
                "tiempo_ejecucion" => $mantenimiento->tiempo_ejecucion,
                "monto_total" => $mantenimiento->monto_total,
                "motivo_actividad" => $mantenimiento->motivo_actividad,
                "observaciones" => $mantenimiento->observaciones,
                "id_calendario" => $mantenimiento->id_calendario,
                "tipo_mantenimiento" => $mantenimiento->tipo_mantenimiento,
                "lugar_mantenimiento" => $mantenimiento->lugar_mantenimiento,
                "fue_supervisado" => $mantenimiento->fue_supervisado,
                "estado" => $mantenimiento->estado,
                "created_at" => $mantenimiento->created_at
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

    public function get_externos() {
        $mantenimientos = mantenimientos::with(['instalaciones', 'usuarios'])
        ->whereIn('lugar_mantenimiento', ['Externo/Equipo', 'Externo/Infraestructura'])
        ->whereIn('estado', ['Sin Pagar', 'Pagado'])
        ->get();
    

        $data = [];

        foreach ($mantenimientos as $mantenimiento) {
            if ($mantenimiento->lugar_mantenimiento == 'Externo/Equipo') {
                $activos = explode(',', $mantenimiento->id_activos);
            $activos = activos::whereIn('id', $activos)->get(['nombre'])->pluck('nombre')->toArray();
            } else {
                $activos = explode(',', $mantenimiento->id_activos);
                $activos = array_map('trim', $activos);
            }
            Carbon::setLocale('es');
            $fechaFormateada = Carbon::parse($mantenimiento->fecha_mantenimiento)->translatedFormat('l j \\de F \\de Y');
            $model = [
                "id" => $mantenimiento->id,
                "fecha_mantenimiento" => $fechaFormateada,
                "id_instalacion" => $mantenimiento->id_instalacion,
                "instalacion" => $mantenimiento->instalaciones->nombre ?? '', 
                "id_usuario" => $mantenimiento->id_usuario,
                "usuario" => $mantenimiento->usuarios->usuario ?? '', 
                "id_activos" => $mantenimiento->id_activos,
                "activos" => $activos,
                "nivel_atendido" => $mantenimiento->nivel_atendido,
                "tipo" => $mantenimiento->tipo,
                "cantidad_atendida" => $mantenimiento->cantidad_atendida,
                "unidad_medida" => $mantenimiento->unidad_medida,
                "descripcion" => $mantenimiento->descripcion,
                "resumen_actividad" => $mantenimiento->resumen_actividad,
                "tiempo_ejecucion" => $mantenimiento->tiempo_ejecucion,
                "monto_total" => $mantenimiento->monto_total,
                "motivo_actividad" => $mantenimiento->motivo_actividad,
                "observaciones" => $mantenimiento->observaciones,
                "id_calendario" => $mantenimiento->id_calendario,
                "tipo_mantenimiento" => $mantenimiento->tipo_mantenimiento,
                "lugar_mantenimiento" => $mantenimiento->lugar_mantenimiento,
                "fue_supervisado" => $mantenimiento->fue_supervisado,
                "estado" => $mantenimiento->estado,
                "created_at" => $mantenimiento->created_at
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

    public function get_detalle_mantenimiento($id){
        $mantenimiento = mantenimientos::with(['instalaciones', 'usuarios'])
            ->where('id', $id)
            ->first();

        //Separar los activos y obtener sus nombres
        $activos = explode(',', $mantenimiento->id_activos);
        //Verifica si son números
        if (is_numeric($activos[0])) {
            $activos = activos::whereIn('id', $activos)->get(['nombre'])->pluck('nombre')->toArray();
        }
        $activos = array_map('trim', $activos);



        $imagenes = mantenimiento_supervisiones_inspecciones_fotografias::where('id_mantenimiento_supervision_inspeccion', $id)
        ->where('tipo', 'Mantenimiento')
        ->get(['url'])
        ->map(function ($item) {
            $item->url = url($item->url); // Laravel convierte la URL relativa a absoluta automáticamente
            return $item;
        });
    
        //Obtener los detalles del mantenimiento
        $mantenimiento_detalle_data = mantenimientos_detalle::with(['recursos'])
            ->where('id_mantenimiento', $id)
            ->get();
        $mantenimiento_detalle = [];
        foreach ($mantenimiento_detalle_data as $detalle) {
            $model = [
                "id" => $detalle->id,
                "codigo" => $detalle->codigo,
                "material_o_servicio" => $detalle->material_o_servicio,
                "id_recurso" => $detalle->id_recurso,
                "recurso" => $detalle->recursos->nombre ?? '',
                "cantidad" => $detalle->cantidad,
                "unidad" => $detalle->unidad,
                "precio_unitario" => $detalle->precio_unitario,
                "total" => $detalle->total,
            ];
            array_push($mantenimiento_detalle, $model);
        }
        Carbon::setLocale('es');
        $fechaFormateada = Carbon::parse($mantenimiento->fecha_mantenimiento)->translatedFormat('l j \\de F \\de Y');
        
        $Monto_formateado = number_format($mantenimiento->monto_total, 2, '.', ',');
        $Tiempo_ejecucion = $this->convertirMinutosAHMS($mantenimiento->tiempo_ejecucion);
        $data = [
            "id" => $mantenimiento->id,
            "fecha_mantenimiento" => $fechaFormateada,
            "id_instalacion" => $mantenimiento->id_instalacion,
            "instalacion" => $mantenimiento->instalaciones->nombre ?? '', 
            "id_usuario" => $mantenimiento->id_usuario,
            "usuario" => $mantenimiento->usuarios->usuario ?? '', 
            "id_activos" => $mantenimiento->id_activos,
            "activos" => $activos,
            "nivel_atendido" => $mantenimiento->nivel_atendido,
            "tipo" => $mantenimiento->tipo,
            "cantidad_atendida" => $mantenimiento->cantidad_atendida,
            "unidad_medida" => $mantenimiento->unidad_medida,
            "descripcion" => $mantenimiento->descripcion,
            "resumen_actividad" => $mantenimiento->resumen_actividad,
            "tiempo_ejecucion" => $Tiempo_ejecucion,
            "monto_total" => $Monto_formateado,
            "monto_total_sin_formato" => $mantenimiento->monto_total,
            "motivo_actividad" => $mantenimiento->motivo_actividad,
            "observaciones" => $mantenimiento->observaciones,
            "id_calendario" => $mantenimiento->id_calendario,
            "tipo_mantenimiento" => $mantenimiento->tipo_mantenimiento,
            "lugar_mantenimiento" => $mantenimiento->lugar_mantenimiento,
            "estado" => $mantenimiento->estado,
            "created_at" => $mantenimiento->created_at,
            "detalle" => $mantenimiento_detalle,
            "imagenes" => $imagenes
        ];

        return response()->json($data);
    }

    public function crear_mantenimiento_paso_1(Request $request)
    {
         //validadores aqui
         $validator = Validator::make($request->all(), [
            'fotografia_inicial.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:51200',
            'tipo_mantenimiento' => 'required|string|max:255',
            'id_calendario' => 'required|integer',
            'lugar_mantenimiento' => 'required|string|max:255',
            'motivo_actividad' => 'required|string|max:255',
        ], [
            'fotografia_inicial.*.image' => 'Las fotografías iniciales deben ser imágenes.',
            'fotografia_inicial.*.mimes' => 'Las fotografías iniciales deben ser de tipo: jpeg, png, jpg, gif, svg.',
            'fotografia_inicial.*.max' => 'Las fotografías iniciales no deben exceder 51200 kilobytes.',
            'tipo_mantenimiento.required' => 'El campo tipo de mantenimiento es obligatorio.',
            'tipo_mantenimiento.string' => 'El campo tipo de mantenimiento debe ser una cadena de texto.',
            'tipo_mantenimiento.max' => 'El campo tipo de mantenimiento no debe exceder 255 caracteres.',
            'id_calendario.required' => 'El campo calendario es obligatorio.',
            'id_calendario.integer' => 'El campo calendario debe ser un número entero.',
            'id_calendario.exists' => 'El calendario seleccionado no existe.',
            'lugar_mantenimiento.required' => 'El campo lugar de mantenimiento es obligatorio.',
            'lugar_mantenimiento.string' => 'El campo lugar de mantenimiento debe ser una cadena de texto.',
            'lugar_mantenimiento.max' => 'El campo lugar de mantenimiento no debe exceder 255 caracteres.',
            'motivo_actividad.required' => 'El campo motivo de actividad es obligatorio.',
            'motivo_actividad.string' => 'El campo motivo de actividad debe ser una cadena de texto.',
            'motivo_actividad.max' => 'El campo motivo de actividad no debe exceder 255 caracteres.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }
        try {
            DB::beginTransaction();

            if ($request->hasFile('fotografia_inicial')) {
                //Guardar fotografía inicial 
                $fotografia_inicial = $request->file('fotografia_inicial');
                $fotografia_inicial_path = [];
                if ($fotografia_inicial) {
                    foreach ($fotografia_inicial as $key => $fotografia) {
                        // Crea un nombre para la imagen
                        $nombre_fotografia = 'fotografia_inicial_' . date('YmdHis') . '_' . $key . '_' . $request->user()->id . '.' . $fotografia->getClientOriginalExtension();
                        
                        Image::configure(array('driver' => 'imagick'));
                        // Redimensiona y optimiza la imagen
                        $image = Image::make($fotografia)->resize(800, null, function ($constraint) {
                            $constraint->aspectRatio();
                            $constraint->upsize();
                        })->encode($fotografia->getClientOriginalExtension(), 75); // Ajusta la calidad al 75%
            
                        if (!file_exists(storage_path('app/public/fotografias/mantenimientos'))) {
                            mkdir(storage_path('app/public/fotografias/mantenimientos'), 0777, true);
                        }

                        // Guarda la imagen optimizada
                        $image->save(storage_path('app/public/fotografias/mantenimientos/' . $nombre_fotografia));
                        array_push($fotografia_inicial_path, 'storage/fotografias/mantenimientos/' . $nombre_fotografia);
                    }
                }
            }

            $mantenimiento = new mantenimientos(); 
            $mantenimiento->tipo_mantenimiento = $request->tipo_mantenimiento;
            $mantenimiento->id_calendario = $request->id_calendario;
            $mantenimiento->id_usuario = $request->user()->id;
            $mantenimiento->lugar_mantenimiento = $request->lugar_mantenimiento;
            $mantenimiento->motivo_actividad = $request->motivo_actividad;
            $mantenimiento->estado = "En proceso";
            $mantenimiento->save();

            //Fotografias tablas
            if ($fotografia_inicial) {
                foreach ($fotografia_inicial_path as $fotografia) {
                    $fotografia_registro = new mantenimiento_supervisiones_inspecciones_fotografias();
                    $fotografia_registro->id_mantenimiento_supervision_inspeccion = $mantenimiento->id;
                    $fotografia_registro->tipo = "Mantenimiento";
                    $fotografia_registro->url = $fotografia;
                    $fotografia_registro->save();
                }
            }

            //Actualizar calendario
            $calendario = calendarizacion::find($request->id_calendario);
            $calendario->estado = "enProceso";
            $calendario->pasoActividad = 2;
            $calendario->save();

            // Crear log
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Inicio el mantenimiento del calendario con ID ". $calendario->id." con un número de ID " . $mantenimiento->id;
            $log->modulo  = "Gestión de Mantenimientos";
            $log->save();

            DB::commit();

            return response()->json(['success' => 'Mantenimiento iniciado correctamente', 'status' => 200],200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al iniciar el mantenimiento', 'error' => $e->getMessage()], 500);
        }
    }
    
    public function crear_mantenimiento_paso_2(Request $request){
        //validadores aqui
        //validadores aqui
        $validator = Validator::make($request->all(), [
            'id_instalacion' => 'required|integer|exists:instalaciones,id',
            'id_activos' => 'required|string',
            'nivel_atendido' => 'required|string|max:255',
            'tipo' => 'required|string|max:255',
            'cantidad_atendida' => 'required|numeric',
            'unidad_medida' => 'required|string|max:255',
            'descripcion' => 'required|string|max:300',
            'id_calendario' => 'required|integer',      
        ], [
            'id_instalacion.required' => 'El campo instalación es obligatorio.',
            'id_instalacion.integer' => 'El campo instalación debe ser un número entero.',
            'id_instalacion.exists' => 'La instalación seleccionada no existe.',
            'id_activos.required' => 'El campo activos es obligatorio.',
            'id_activos.string' => 'El campo activos debe ser una cadena de texto.',
            'nivel_atendido.required' => 'El campo nivel atendido es obligatorio.',
            'nivel_atendido.string' => 'El campo nivel atendido debe ser una cadena de texto.',
            'nivel_atendido.max' => 'El campo nivel atendido no debe exceder 255 caracteres.',
            'tipo.required' => 'El campo tipo es obligatorio.',
            'tipo.string' => 'El campo tipo debe ser una cadena de texto.',
            'tipo.max' => 'El campo tipo no debe exceder 255 caracteres.',
            'cantidad_atendida.required' => 'El campo cantidad atendida es obligatorio.',
            'cantidad_atendida.numeric' => 'El campo cantidad atendida debe ser un número.',
            'unidad_medida.required' => 'El campo unidad de medida es obligatorio.',
            'unidad_medida.string' => 'El campo unidad de medida debe ser una cadena de texto.',
            'unidad_medida.max' => 'El campo unidad de medida no debe exceder 255 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string' => 'El campo descripción debe ser una cadena de texto.',
            'descripcion.max' => 'El campo descripción no debe exceder 300 caracteres.',
            'id_calendario.required' => 'El campo calendario es obligatorio.',
            'id_calendario.integer' => 'El campo calendario debe ser un número entero.',
            'id_calendario.exists' => 'El calendario seleccionado no existe.',   
        ]);


        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }
        try {
            DB::beginTransaction();
            $mantenimiento = mantenimientos::where('id_calendario', $request->id_calendario)->first();
            $mantenimiento->id_instalacion = $request->id_instalacion;
            $mantenimiento->id_activos = $request->id_activos;
            $mantenimiento->tipo = $request->tipo;
            $mantenimiento->nivel_atendido = $request->nivel_atendido;
            $mantenimiento->cantidad_atendida = $request->cantidad_atendida;
            $mantenimiento->unidad_medida = $request->unidad_medida;
            $mantenimiento->descripcion = $request->descripcion;
            $mantenimiento->save();

            //Actualizar calendario
            $calendario = calendarizacion::find($request->id_calendario);
            $calendario->pasoActividad = 3;
            $calendario->save();

            DB::commit();

            return response()->json(['success' => 'Mantenimiento paso 2 ejecutado correctamente', 'status' => 200],200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al continuar el mantenimiento', 'error' => $e->getMessage()], 500);
        }
    }
    public function crear_mantenimiento_paso_3(Request $request){
         //validadores aqui
         $validator = Validator::make($request->all(), [
            'monto_total' => 'required|numeric',
            'observaciones' => 'nullable|string',
            'id_calendario' => 'required|integer',
            'detalle_mantenimiento' => 'required|json',
        ], [
            'monto_total.required' => 'El campo monto total es obligatorio.',
            'monto_total.numeric' => 'El campo monto total debe ser un número.',
            'observaciones.string' => 'El campo observaciones debe ser una cadena de texto.',
            'id_calendario.required' => 'El campo calendario es obligatorio.',
            'id_calendario.integer' => 'El campo calendario debe ser un número entero.',
            'id_calendario.exists' => 'El calendario seleccionado no existe.',   
            'detalle_mantenimiento.required' => 'El campo detalle de mantenimiento es obligatorio.',
            'detalle_mantenimiento.json' => 'El campo detalle de mantenimiento debe ser un JSON válido.',
        ]);

        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }
        try {
            DB::beginTransaction();
            $mantenimiento = mantenimientos::where('id_calendario', $request->id_calendario)->first();
            $mantenimiento->resumen_actividad = "Pendiente";
            $mantenimiento->monto_total = $request->monto_total;
            $mantenimiento->observaciones = $request->observaciones;
            $mantenimiento->save();
            $detalle_mantenimiento =  json_decode($request->detalle_mantenimiento, true);
            foreach ($detalle_mantenimiento as $detalle) {
                if (!isset($detalle['id_recurso'])) {
                    $id_recurso = null;
                } else {
                    $id_recurso = $detalle['id_recurso'];
                }
                $mantenimiento_detalle = new mantenimientos_detalle();
                $mantenimiento_detalle->codigo = $detalle['codigo'];
                if (!isset($detalle['material_o_servicio'])) {
                    $material_o_servicio = "";
                } else {
                    $material_o_servicio = $detalle['material_o_servicio'];
                }
                $mantenimiento_detalle->material_o_servicio = $material_o_servicio;
                $mantenimiento_detalle->id_recurso = $id_recurso;
                $mantenimiento_detalle->cantidad = $detalle['cantidad'];
                $mantenimiento_detalle->unidad = $detalle['unidad'];
                $mantenimiento_detalle->precio_unitario = $detalle['precio_unitario'];
                $mantenimiento_detalle->total = $detalle['total'];
                $mantenimiento_detalle->id_mantenimiento = $mantenimiento->id;
                $mantenimiento_detalle->save();

                //Restar la cantidad de recursos
                if ($id_recurso) {
                    $recurso = recursos::find($id_recurso);
                    $recurso->existencias -= $detalle['cantidad'];
                    $recurso->save();
                }
            }

            //Actualizar calendario
            $calendario = calendarizacion::find($request->id_calendario);
            $calendario->pasoActividad = 4;
            $calendario->save();

            DB::commit();
            return response()->json(['success' => 'Mantenimiento paso 3 ejecutado correctamente', 'status' => 200],200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al continuar el mantenimiento', 'error' => $e->getMessage()], 500);
        }
    }
    public function crear_mantenimiento_paso_4(Request $request){
        //validadores aqui
        $validator = Validator::make($request->all(), [
            'id_calendario' => 'required|integer',
            'fotografia_final.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:51200',
        ], [
            'id_calendario.required' => 'El campo calendario es obligatorio.',
            'id_calendario.integer' => 'El campo calendario debe ser un número entero.',
            'id_calendario.exists' => 'El calendario seleccionado no existe.',   
            'fotografia_final.*.image' => 'Las fotografías finales deben ser imágenes.',
            'fotografia_final.*.mimes' => 'Las fotografías finales deben ser de tipo: jpeg, png, jpg, gif, svg.',
            'fotografia_final.*.max' => 'Las fotografías finales no deben exceder 51200 kilobytes.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }
        try {
            DB::beginTransaction();
            if ($request->hasFile('fotografia_final')) {
                //Guardar fotografías finales
                $fotografia_final = $request->file('fotografia_final');
                $fotografia_final_path = [];
                if ($fotografia_final) {
                    foreach ($fotografia_final as $key => $fotografia) {
                        $nombre_fotografia = 'fotografia_final_' . date('YmdHis') . '_' . $key . '_' . $request->user()->id . '.' . $fotografia->getClientOriginalExtension();

                        if (!file_exists(storage_path('app/public/fotografias/mantenimientos'))) {
                            mkdir(storage_path('app/public/fotografias/mantenimientos'), 0777, true);
                        }

                        Image::configure(array('driver' => 'imagick'));
                        $image = Image::make($fotografia)->resize(800, null, function ($constraint) {
                            $constraint->aspectRatio();
                            $constraint->upsize();
                        })->encode($fotografia->getClientOriginalExtension(), 75);

                        $image->save(storage_path('app/public/fotografias/mantenimientos/' . $nombre_fotografia));
                        array_push($fotografia_final_path, 'storage/fotografias/mantenimientos/' . $nombre_fotografia);
                    }
                }
            }
            
            $mantenimiento = mantenimientos::where('id_calendario', $request->id_calendario)->first();
            $mantenimiento->save();
            //Fotografias tablas

            if ($fotografia_final) {
                foreach ($fotografia_final_path as $fotografia) {
                    $fotografia_registro = new mantenimiento_supervisiones_inspecciones_fotografias();
                    $fotografia_registro->id_mantenimiento_supervision_inspeccion = $mantenimiento->id;
                    $fotografia_registro->tipo = "Mantenimiento";
                    $fotografia_registro->url = $fotografia;
                    $fotografia_registro->save();
                }
            }

            //Actualizar calendario
            $calendario = calendarizacion::find($request->id_calendario);
            $calendario->pasoActividad = 5;
            $calendario->save();

            DB::commit();

            return response()->json(['success' => 'Mantenimiento paso 4 ejecutado correctamente', 'status' => 200],200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al continuar el mantenimiento', 'error' => $e->getMessage()], 500);
        }
    }
    public function crear_mantenimiento_paso_5(Request $request){
            //validadores aqui
        $validator = Validator::make($request->all(), [
            'id_calendario' => 'required|integer',
            'fotografias_adicionales.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:51200',
        ], [
            'id_calendario.required' => 'El campo calendario es obligatorio.',
            'id_calendario.integer' => 'El campo calendario debe ser un número entero.',
            'id_calendario.exists' => 'El calendario seleccionado no existe.',   
            'fotografias_adicionales.*.image' => 'Las fotografías adicionales deben ser imágenes.',
            'fotografias_adicionales.*.mimes' => 'Las fotografías adicionales deben ser de tipo: jpeg, png, jpg, gif, svg.',
            'fotografias_adicionales.*.max' => 'Las fotografías adicionales no deben exceder 51200 kilobytes.',
        ]);

        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }
        try {
            DB::beginTransaction();
            
            $fotografias_adicionales = null;
            if ($request->hasFile('fotografias_adicionales')) {
                
                //Guardar fotografías adicionales
                $fotografias_adicionales = $request->file('fotografias_adicionales');
                $fotografias_adicionales_paths = [];
                if ($fotografias_adicionales) {
                    foreach ($fotografias_adicionales as $key => $fotografia) {
                        $nombre_fotografia = 'fotografia_adicional_' . date('YmdHis') . '_' . $key . '_' . $request->user()->id . '.' . $fotografia->getClientOriginalExtension();

                        if (!file_exists(storage_path('app/public/fotografias/mantenimientos'))) {
                            mkdir(storage_path('app/public/fotografias/mantenimientos'), 0777, true);
                        }

                        Image::configure(array('driver' => 'imagick'));
                        $image = Image::make($fotografia)->resize(800, null, function ($constraint) {
                            $constraint->aspectRatio();
                            $constraint->upsize();
                        })->encode($fotografia->getClientOriginalExtension(), 75);

                        $image->save(storage_path('app/public/fotografias/mantenimientos/' . $nombre_fotografia));
                        array_push($fotografias_adicionales_paths, 'storage/fotografias/mantenimientos/' . $nombre_fotografia);
                    }
                }
            }

            $mantenimiento = mantenimientos::where('id_calendario', $request->id_calendario)->first();
            $mantenimiento->save();
            //Fotografias tablas
            if ($fotografias_adicionales) {
                foreach ($fotografias_adicionales_paths as $fotografia) {
                    $fotografia_registro = new mantenimiento_supervisiones_inspecciones_fotografias();
                    $fotografia_registro->id_mantenimiento_supervision_inspeccion = $mantenimiento->id;
                    $fotografia_registro->tipo = "Mantenimiento";
                    $fotografia_registro->url = $fotografia;
                    $fotografia_registro->save();
                }
            }

            //Actualizar calendario
            $calendario = calendarizacion::find($request->id_calendario);
            $calendario->pasoActividad = 6;
            $calendario->save();

            DB::commit();

            return response()->json(['success' => 'Mantenimiento paso 4 ejecutado correctamente', 'status' => 200],200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al continuar el mantenimiento', 'error' => $e->getMessage()], 500);
        }
    }

    public function crear_mantenimiento_paso_6(Request $request){
        //validadores aqui
        $validator = Validator::make($request->all(), [
            'id_calendario' => 'required|integer',
        ], [
            'id_calendario.required' => 'El campo calendario es obligatorio.',
            'id_calendario.integer' => 'El campo calendario debe ser un número entero.',
            'id_calendario.exists' => 'El calendario seleccionado no existe.',   
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422); // Usamos 422 para indicar error de validación
        }
        try {
            DB::beginTransaction();

            $mantenimiento = mantenimientos::where('id_calendario', $request->id_calendario)->first();
            $mantenimiento->fecha_mantenimiento = date('Y-m-d');
            $fecha_y_hora_creacion = $mantenimiento->created_at;
            $totalSegundos = Carbon::parse($fecha_y_hora_creacion)->diffInSeconds(Carbon::now());
            $tiempo_ejecucion = number_format($totalSegundos / 60, 2); 
            $mantenimiento->tiempo_ejecucion = $tiempo_ejecucion;
            if ($request->lugar_mantenimiento != "Externo/Infraestructura" && $request->lugar_mantenimiento != "Externo/Equipo") {
                $mantenimiento->estado = "Activo";
            } else {
                $mantenimiento->estado = "Sin pagar";
            }
            $mantenimiento->save();
            //Actualizar calendario hasta el final
            $calendario = calendarizacion::find($request->id_calendario);
            $calendario->estado = "Realizado";
            $calendario->save();

            //Si se agrega un detalle final
            if($request->detalle_mantenimiento){
                $detalle_mantenimiento =  json_decode($request->detalle_mantenimiento, true);
                if($detalle_mantenimiento!=null){
                    if ($detalle_mantenimiento[0]['total'] != null &&  $detalle_mantenimiento[0]['total'] != ""){
                        foreach ($detalle_mantenimiento as $detalle) {
                            if (!isset($detalle['id_recurso'])) {
                                $id_recurso = null;
                            } else {
                                $id_recurso = $detalle['id_recurso'];
                            }
                            $mantenimiento_detalle = new mantenimientos_detalle();
                            $codigo = $detalle['codigo'];
                            if ($codigo == null || $codigo == "") {
                                $codigo = 0;
                            }
                            $mantenimiento_detalle->codigo = $codigo;
                            if (!isset($detalle['material_o_servicio'])) {
                                $material_o_servicio = "";
                            } else {
                                $material_o_servicio = $detalle['material_o_servicio'];
                            }
                            $mantenimiento_detalle->material_o_servicio = $material_o_servicio;
                            $mantenimiento_detalle->id_recurso = $id_recurso;
                            $mantenimiento_detalle->cantidad = $detalle['cantidad'];
                            $mantenimiento_detalle->unidad = $detalle['unidad'];
                            $mantenimiento_detalle->precio_unitario = $detalle['precio_unitario'];
                            $mantenimiento_detalle->total = $detalle['total'];
                            $mantenimiento_detalle->id_mantenimiento = $mantenimiento->id;
                            $mantenimiento_detalle->save();

                            //Restar la cantidad de recursos
                            if ($id_recurso) {
                                $recurso = recursos::find($id_recurso);
                                $recurso->existencias -= $detalle['cantidad'];
                                $recurso->save();
                            }
                        }
                    }
                }
            }
            // Crear log
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Completo el mantenimiento del calendario con ID ". $calendario->id." con un número de ID " . $mantenimiento->id;
            $log->modulo  = "Gestión de Mantenimientos";
            $log->save();

            DB::commit();

            return response()->json(['success' => 'Mantenimiento creado correctamente', 'status' => 200],200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear el mantenimiento', 'error' => $e->getMessage()], 500);
        }
    }

    function convertirMinutosAHMS($minutosDecimal) {
        // Reemplazar comas por nada para evitar problemas en la conversión
        $minutosDecimal = str_replace(',', '', $minutosDecimal);
        
        $minutosDecimal = floatval($minutosDecimal);
    
        // Obtener la parte entera de los minutos
        $minutosEnteros = floor($minutosDecimal);
    
        // Calcular horas
        $horas = floor($minutosEnteros / 60);
    
        // Calcular minutos restantes
        $minutos = $minutosEnteros % 60;
    
        // Calcular segundos (de la parte decimal)
        $segundosDecimal = ($minutosDecimal - $minutosEnteros) * 60;
        $segundos = round($segundosDecimal);
    
        // Asegurar que segundos no exceda 59
        if ($segundos >= 60) {
            $segundos = 0;
            $minutos++;
            if ($minutos >= 60) {
                $minutos = 0;
                $horas++;
            }
        }
    
        return sprintf("%d Horas %d Minutos %d Segundos", $horas, $minutos, $segundos);
    }
}
