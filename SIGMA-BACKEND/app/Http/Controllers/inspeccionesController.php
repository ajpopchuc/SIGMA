<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\logs;
use App\Models\inspecciones;
use App\Models\inspecciones_deterioro_fallas;
use App\Models\tipos_de_deterioro_falla;
use App\Models\activos;
use App\Models\campus;
use App\Models\mantenimiento_supervisiones_inspecciones_fotografias;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\calendarizacion; 
use Intervention\Image\Facades\Image;
use Carbon\Carbon;
class inspeccionesController extends Controller
{
    public function get_equipos()
    {
        $inspecciones = inspecciones::with(['instalaciones', 'usuarios'])
            ->where('tipo_inspeccion', 'Equipos')
            ->get();

        $data = [];

        foreach ($inspecciones as $inspeccion) {
            $activos = explode(',', $inspeccion->id_activos);
            $activos = activos::whereIn('id', $activos)->get();
            $activos = $activos->pluck('nombre')->toArray();
            $model = [
                "id" => $inspeccion->id,
                "fecha_inspeccion" => $inspeccion->fecha_inspeccion,
                "id_instalacion" => $inspeccion->id_instalacion,
                "campus" => $inspeccion->instalaciones->niveles->edificio->campus->nombre ?? '',
                "edificio" => $inspeccion->instalaciones->niveles->edificio->nombre ?? '',
                "nivel" => $inspeccion->instalaciones->niveles->nombre ?? '',
                "instalacion" => $inspeccion->instalaciones->nombre ?? '', 
                "instalacion" => $inspeccion->instalaciones->nombre ?? '', 
                "id_usuario" => $inspeccion->id_usuario,
                "usuario" => $inspeccion->usuarios->nombre ?? '', 
                "tipo" => $inspeccion->tipo,
                "id_activos" => $inspeccion->id_activos,
                "activos" => $activos,
                "cantidad_inspeccion" => $inspeccion->cantidad_inspeccion,
                "unidad_medida" => $inspeccion->unidad_medida,
                "motivo" => $inspeccion->motivo,
                "descripcion" => $inspeccion->descripcion,
                "condicion_general" => $inspeccion->condicion_general,
                "intervencion_requerida" => $inspeccion->intervencion_requerida,
                "plazo_intervencion" => $inspeccion->plazo_intervencion,
                "plazo" => $inspeccion->plazo,
                "tiempo_ejecucion" => $inspeccion->tiempo_ejecucion,
                "observaciones" => $inspeccion->observaciones,
                "id_calendario" => $inspeccion->id_calendario,
                "tipo_inspeccion" => $inspeccion->tipo_inspeccion,
                "estado" => $inspeccion->estado,
                "created_at" => $inspeccion->created_at,
                "updated_at" => $inspeccion->updated_at,
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
        $inspecciones = inspecciones::with(['instalaciones', 'usuarios'])
            ->where('tipo_inspeccion', 'Infraestructura')
            ->get();

        $data = [];

        foreach ($inspecciones as $inspeccion) {
            $activos = explode(',', $inspeccion->id_activos);
            $activos = activos::whereIn('id', $activos)->get();
            $activos = $activos->pluck('nombre')->toArray();
            $model = [
                "id" => $inspeccion->id,
                "fecha_inspeccion" => $inspeccion->fecha_inspeccion,
                "id_instalacion" => $inspeccion->id_instalacion,
                "campus" => $inspeccion->instalaciones->niveles->edificio->campus->nombre ?? '',
                "edificio" => $inspeccion->instalaciones->niveles->edificio->nombre ?? '',
                "nivel" => $inspeccion->instalaciones->niveles->nombre ?? '',
                "instalacion" => $inspeccion->instalaciones->nombre ?? '', 
                "id_usuario" => $inspeccion->id_usuario,
                "usuario" => $inspeccion->usuarios->nombre ?? '', 
                "tipo" => $inspeccion->tipo,
                "id_activos" => $inspeccion->id_activos,
                "activos" => $activos,
                "cantidad_inspeccion" => $inspeccion->cantidad_inspeccion,
                "unidad_medida" => $inspeccion->unidad_medida,
                "motivo" => $inspeccion->motivo,
                "descripcion" => $inspeccion->descripcion,
                "condicion_general" => $inspeccion->condicion_general,
                "intervencion_requerida" => $inspeccion->intervencion_requerida,
                "plazo_intervencion" => $inspeccion->plazo_intervencion,
                "plazo" => $inspeccion->plazo,
                "tiempo_ejecucion" => $inspeccion->tiempo_ejecucion,
                "observaciones" => $inspeccion->observaciones,
                "id_calendario" => $inspeccion->id_calendario,
                "tipo_inspeccion" => $inspeccion->tipo_inspeccion,
                "estado" => $inspeccion->estado,
                "created_at" => $inspeccion->created_at,
                "updated_at" => $inspeccion->updated_at,
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

    public function get_info_inspeccion(Request $request, $id)
    {
        $data = [];
        $inspeccion = inspecciones::find($id);
        if ($inspeccion) {
            
            $deterioros = [];
            foreach ($inspeccion->inspecciones_deterioro_fallas as $deterioro) {

                $deterioro_data = [
                    "deterioro" => $deterioro->tipos_de_deterioro_falla->deteriorio_o_falla ?? '',
                    "condicion_general" => $deterioro->condicion_general ?? '',
                    "porcentaje_deterioro" => $deterioro->porcentaje_deterioro ?? 0,
                    "observaciones" => $deterioro-> observaciones ?? ''
                ];
                array_push($deterioros, $deterioro_data);
            }
             
                $imagenes = mantenimiento_supervisiones_inspecciones_fotografias::where('id_mantenimiento_supervision_inspeccion', $id)
                ->where('tipo', 'Inspección')
                ->get(['url'])
                ->map(function ($item) {
                    $item->url = url($item->url); // Laravel convierte la URL relativa a absoluta automáticamente
                    return $item;
                });
                Carbon::setLocale('es');
                $fechaFormateada = Carbon::parse($inspeccion->fecha_inspeccion)->translatedFormat('l j \\de F \\de Y');
            $model = [
                "fecha_inspeccion" =>  $fechaFormateada,
               "ubicacion" => implode(' - ', array_filter([
                    $inspeccion->instalaciones->niveles->edificio->campus->nombre ?? '',
                    $inspeccion->instalaciones->niveles->edificio->nombre ?? '',
                    $inspeccion->instalaciones->niveles->nombre ?? '',
                    $inspeccion->instalaciones->nombre ?? ''
                ])),
                "usuario" => $inspeccion->usuarios->usuario, 
                "rol" => $inspeccion->usuarios->rol->nombre, 
                "elementos" => $inspeccion->id_activos,
                "tipo" => $inspeccion->tipo,
                "cantidad_inspeccion" => $inspeccion->cantidad_inspeccion,
                "unidad_medida" => $inspeccion->unidad_medida,
                "motivo" => $inspeccion->motivo,
                "descripcion" => $inspeccion->descripcion,
                "condicion_general" => $inspeccion->condicion_general,
                "intervencion_requerida" => $inspeccion->intervencion_requerida,
                "plazo_intervencion" => $inspeccion->plazo_intervencion,
                "plazo" => $inspeccion->plazo ? $inspeccion->plazo : 0,
                "tiempo_ejecucion" => $this->convertirMinutosAHorasMinutosSegundos($inspeccion->tiempo_ejecucion),
                "observaciones" => $inspeccion->observaciones,
                "tipo_inspeccion" => $inspeccion->tipo_inspeccion,
                "estado" => $inspeccion->estado,
                "inspecciones_deterioro_fallas" => $deterioros,
                "imagenes" => $imagenes,
                "porcentaje_deterioro" => $inspeccion->condicion_general=='Aceptable' ? 33 : ($inspeccion->condicion_general=='Regular' ? 66 : 99),
            ];
            
            array_push($data, $model);
        }
    
        $response = [
            "data" => $data
        ];
    
        return response()->json($response);
    }
    
    public function get_info_inspeccion_equips(Request $request, $id)
    {
        $data = [];
        $inspeccion = inspecciones::find($id);
        if ($inspeccion) {
            
            $deterioros = [];
            foreach ($inspeccion->inspecciones_deterioro_fallas as $deterioro) {

                $deterioro_data = [
                    "deterioro" => $deterioro->tipos_de_deterioro_falla->deteriorio_o_falla ?? '',
                    "condicion_general" => $deterioro->condicion_general ?? '',
                    "porcentaje_deterioro" => $deterioro->porcentaje_deterioro ?? 0,
                    "observaciones" => $deterioro-> observaciones ?? ''
                ];
                array_push($deterioros, $deterioro_data);
            }
             
                $imagenes = mantenimiento_supervisiones_inspecciones_fotografias::where('id_mantenimiento_supervision_inspeccion', $id)
                ->where('tipo', 'Inspección')
                ->get(['url'])
                ->map(function ($item) {
                    $item->url = url($item->url); // Laravel convierte la URL relativa a absoluta automáticamente
                    return $item;
                });

                    // Aquí obtenemos los nombres de los activos separados por comas
                    $activos_nombres = [];
                    $activos_ids = explode(',', $inspeccion->id_activos); // Suponiendo que id_activos es una cadena separada por comas

                    foreach ($activos_ids as $activo_id) {
                        $activo = activos::find($activo_id);
                        if ($activo) {
                            $activos_nombres[] = $activo->nombre; // Agregamos el nombre del activo a la lista
                        }
                    }

                    // Convertimos el array de nombres a una cadena separada por comas
                    $elementos = implode(', ', $activos_nombres);
                    Carbon::setLocale('es');
                    $fechaFormateada = Carbon::parse($inspeccion->fecha_inspeccion)->translatedFormat('l j \\de F \\de Y');
            $model = [
                
                "fecha_inspeccion" => $fechaFormateada,
                "ubicacion" => implode(' - ', array_filter([
                    $inspeccion->instalaciones->niveles->edificio->campus->nombre ?? '',
                    $inspeccion->instalaciones->niveles->edificio->nombre ?? '',
                    $inspeccion->instalaciones->niveles->nombre ?? '',
                    $inspeccion->instalaciones->nombre ?? ''
                ])),
                "usuario" => $inspeccion->usuarios->usuario, 
                "rol" => $inspeccion->usuarios->rol->nombre, 
                "elementos" => $elementos,
                "tipo" => $inspeccion->tipo,
                "cantidad_inspeccion" => $inspeccion->cantidad_inspeccion,
                "unidad_medida" => $inspeccion->unidad_medida,
                "motivo" => $inspeccion->motivo,
                "descripcion" => $inspeccion->descripcion,
                "condicion_general" => $inspeccion->condicion_general,
                "intervencion_requerida" => $inspeccion->intervencion_requerida,
                "plazo_intervencion" => $inspeccion->plazo_intervencion,
                "plazo" => $inspeccion->plazo ? $inspeccion->plazo : 0,
                "tiempo_ejecucion" => $this->convertirMinutosAHorasMinutosSegundos($inspeccion->tiempo_ejecucion),
                "observaciones" => $inspeccion->observaciones,
                "tipo_inspeccion" => $inspeccion->tipo_inspeccion,
                "estado" => $inspeccion->estado,
                "inspecciones_deterioro_fallas" => $deterioros,
                "imagenes" => $imagenes,
                "porcentaje_deterioro" => $inspeccion->condicion_general=='Aceptable' ? 33 : ($inspeccion->condicion_general=='Regular' ? 66 : 99),
            ];
            
            array_push($data, $model);
        }
    
        $response = [
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
    private function savePhotos($request, $photoField, $type)
    {
        $paths = [];
        if ($request->hasFile($photoField)) {
            foreach ($request->file($photoField) as $key => $photo) {
                $photoName = "{$type}_" . date('YmdHis') . "_{$key}_{$request->user()->id}." . $photo->getClientOriginalExtension();
                
                Image::configure(array('driver' => 'imagick'));
                // Redimensiona y optimiza la imagen
                $image = Image::make($photo)->resize(800, null, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                })->encode($photo->getClientOriginalExtension(), 75); // Ajusta la calidad al 75%
                

                if (!file_exists(storage_path('app/public/fotografias/inspecciones'))) {
                    mkdir(storage_path('app/public/fotografias/inspecciones'), 0777, true);
                }


                // Guarda la imagen optimizada
                $image->save(storage_path('app/public/fotografias/inspecciones/' . $photoName));
                $paths[] = 'storage/fotografias/inspecciones/' . $photoName;
            }
        }
        return $paths;
    }
    
    private function savePhotoRecord($path, $inspectionId, $photoType, $request)
    {
        if ($path) {
            $photoRecord = new mantenimiento_supervisiones_inspecciones_fotografias();
            $photoRecord->id_mantenimiento_supervision_inspeccion = $inspectionId;
            $photoRecord->tipo = "Inspección";
            $photoRecord->url = $path;
            $photoRecord->save();
    
            // Registrar log para cada fotografía
            $this->createLog($request, "Agregó fotografía a inspección ID: {$inspectionId}", "Gestión de fotografías");
        }
    }
    
    private function createLog($request, $description, $module)
    {
        $log = new logs();
        $log->id_usuario = $request->user()->id;
        $log->descripcion = $description;
        $log->modulo = $module;
        $log->save();
    }
        
    public function procesarDatosIniciales(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fotografia_inicial.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:51200',
            'id_calendario' => 'required|integer|exists:calendarizacion,id',
            'motivo' => 'required|string|max:255',
            'pasoActividad' => 'required|integer',
        
           'tipo_inspeccion' => 'required|string|in:Infraestructura,Equipos',
        ], [
            'fotografia_inicial.*.image' => 'Cada archivo debe ser una imagen.',
            'fotografia_inicial.*.mimes' => 'Las imágenes deben ser en formato JPEG, PNG, JPG, GIF o SVG.',
            'fotografia_inicial.*.max' => 'El tamaño máximo de las imágenes es de 51200 KB.',
            'id_calendario.required' => 'El campo id de calendario es obligatorio.',
            'id_calendario.integer' => 'El id de calendario debe ser un número entero.',
            'id_calendario.exists' => 'El id de calendario no existe.',
            'motivo.required' => 'El campo motivo es obligatorio.',
            'motivo.string' => 'El motivo debe ser texto.',
            'motivo.max' => 'El motivo no debe exceder 255 caracteres.',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $fotografia_inicial_paths = $this->savePhotos($request, 'fotografia_inicial', 'inicial');
        
        try {
            DB::beginTransaction();
            $inspeccion = new inspecciones();
            $inspeccion->fill([
                'id_calendario' => $request->input('id_calendario'),
                'motivo' => $request->input('motivo'),
                'id_usuario' => $request->user()->id,
                'tiempo_ejecucion' => $request->input('tiempo_ejecucion'),
                'tipo_inspeccion' => $request->input('tipo_inspeccion'),
                'estado' => 'Pendiente',
            ]);
            $inspeccion->save();
            
            foreach ($fotografia_inicial_paths as $path) {
                $this->savePhotoRecord($path, $inspeccion->id, 'fotografia_inicial', $request);
            }
            
            $idCalendario = $request->input('id_calendario');
            $calendarizacion = calendarizacion::find($idCalendario);
    
            if ($calendarizacion) {
                $calendarizacion->estado = 'enProceso';
                $calendarizacion->pasoActividad = $request->input('pasoActividad');
                $calendarizacion->save();
    
                // Registrar log para la actualización de calendarización
               
                $this->createLog($request, "Actualizó la calendarización ID: {$idCalendario} con inspección ID: {$inspeccion->id}", "Gestión de calendarización");
            } else {
                DB::rollBack();
                throw new \Exception("No se encontró la calendarización con ID: {$idCalendario}");
            }

            DB::commit();
            return response()->json([
                'success' => 'Datos guardados',
                'status' => 200,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public function procesarInstalacion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_instalacion' => 'required|integer',
            'id_calendario' => 'required|integer',
            'pasoActividad' => 'required|integer',
        
        ], [
            'id_instalacion.required' => 'El campo id de instalación es obligatorio.',
            'id_instalacion.integer' => 'El id de instalación debe ser un número entero.',
            'id_calendario.required' => 'El campo id de calendario es obligatorio.',
            'id_calendario.integer' => 'El id de calendario debe ser un número entero.'
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        try {
            DB::beginTransaction();
            
            // Buscar la inspección basada en id_calendario
            $inspeccion = inspecciones::where('id_calendario', $request->id_calendario)->firstOrFail();
            
            $inspeccion->id_instalacion = $request->id_instalacion;
            $inspeccion->save();
            
            $idCalendario = $request->input('id_calendario');
            $calendarizacion = calendarizacion::find($idCalendario);
    
            if ($calendarizacion) {
                $calendarizacion->pasoActividad = $request->input('pasoActividad');
                $calendarizacion->save();
    
                // Registrar log para la actualización de calendarización
                $this->createLog($request, "Actualizó la calendarización ID: {$idCalendario} con inspección ID: {$inspeccion->id}", "Gestión de calendarización");
            } else {
                DB::rollBack();
                throw new \Exception("No se encontró la calendarización con ID: {$idCalendario}");
            }
            DB::commit();
            return response()->json([
                'success' => 'Datos guardados',
                'status' => 200,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    
    public function procesarDatosGenerales(Request $request){
        $validator = Validator::make($request->all(), [
            'id_calendario' => 'required|integer',
            'elementos' => 'required|string|max:255',
            'cantidad_inspeccion' => 'required|numeric|min:1',
            'unidad_medida' => 'required|string|max:20',
            'tipo' => 'required|string|max:50',
            'descripcion' => 'required|string|max:1000',
            'pasoActividad' => 'required|integer',
        


        ], [
            'elementos.required' => 'El campo elementos es obligatorio.',
            'elementos.string' => 'El campo elementos debe ser texto.',
            'elementos.max' => 'El campo elementos no debe exceder 255 caracteres.',
            'cantidad_inspeccion.required' => 'El campo cantidad de inspección es obligatorio.',
            'cantidad_inspeccion.numeric' => 'La cantidad de inspección debe ser un número.',
            'cantidad_inspeccion.min' => 'La cantidad de inspección debe ser mayor a 0.',
            'unidad_medida.required' => 'El campo unidad de medida es obligatorio.',
            'unidad_medida.string' => 'La unidad de medida debe ser texto.',
            'unidad_medida.max' => 'La unidad de medida no debe exceder 20 caracteres.',
            'tipo.required' => 'El campo tipo es obligatorio.',
            'tipo.string' => 'El campo tipo debe ser texto.',
            'tipo.max' => 'El campo tipo no debe exceder 50 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string' => 'La descripción debe ser texto.',
            'descripcion.max' => 'La descripción no debe exceder 1000 caracteres.',
            'pasoActividad.required' => 'El paso de actividad es obligatorio.',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        try {
            // Buscar la inspección asociada al id_calendario
            $inspeccion = inspecciones::where('id_calendario', $request->id_calendario)->firstOrFail();
            DB::beginTransaction();
            // Actualizar los datos generales de la inspección
            $inspeccion->id_activos = $request->input('elementos');
            $inspeccion->cantidad_inspeccion = $request->input('cantidad_inspeccion');
            $inspeccion->unidad_medida = $request->input('unidad_medida');
            $inspeccion->tipo = $request->input('tipo');
            $inspeccion->descripcion = $request->input('descripcion');
            
            $inspeccion->save();
            
            $idCalendario = $request->input('id_calendario');
            $calendarizacion = calendarizacion::find($idCalendario);
    
            if ($calendarizacion) {
                $calendarizacion->pasoActividad = $request->input('pasoActividad');
                $calendarizacion->save();
    
                // Registrar log para la actualización de calendarización
                $this->createLog($request, "Actualizó la calendarización ID: {$idCalendario} con inspección ID: {$inspeccion->id}", "Gestión de calendarización");
            } else {
                DB::rollBack();
                throw new \Exception("No se encontró la calendarización con ID: {$idCalendario}");
            }
            DB::commit();
            return response()->json([
                'success' => 'Datos guardados',
                'status' => 200,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function procesarInspeccionEquipo(Request $request)
{
    $validator = Validator::make($request->all(), [
        'id_instalacion' => 'nullable|integer',
        'id_calendario' => 'required|integer|exists:inspecciones,id_calendario',
        'pasoActividad' => 'required|integer',
    
        'elementos' => 'nullable|string|max:255',
        'cantidad_inspeccion' => 'nullable|numeric|min:1',
        'unidad_medida' => 'nullable|string|max:20',
        'tipo' => 'nullable|string|max:50',
        'descripcion' => 'nullable|string|max:1000',
    ], [
        'id_instalacion.integer' => 'El id de instalación debe ser un número entero.',
        'id_calendario.required' => 'El campo id de calendario es obligatorio.',
        'id_calendario.integer' => 'El id de calendario debe ser un número entero.',
        'id_calendario.exists' => 'El id de calendario no corresponde a ninguna inspección existente.',
        'pasoActividad.required' => 'El paso de actividad es obligatorio.',
        'tiempo_ejecucion.required' => 'El tiempo de ejecución es obligatorio.',
        'elementos.max' => 'El campo elementos no debe exceder 255 caracteres.',
        'cantidad_inspeccion.min' => 'La cantidad de inspección debe ser mayor a 0.',
        'unidad_medida.max' => 'La unidad de medida no debe exceder 20 caracteres.',
        'tipo.max' => 'El campo tipo no debe exceder 50 caracteres.',
        'descripcion.max' => 'La descripción no debe exceder 1000 caracteres.',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    try {
        DB::beginTransaction();

        // Buscar la inspección asociada al id_calendario
        $inspeccion = inspecciones::where('id_calendario', $request->id_calendario)->firstOrFail();

        // Actualizar los datos de condiciones en la inspección
        $inspeccion->id_instalacion = $request->input('id_instalacion');
        $inspeccion->id_activos = $request->input('elementos');
        $inspeccion->cantidad_inspeccion = $request->input('cantidad_inspeccion');
        $inspeccion->unidad_medida = $request->input('unidad_medida');
        $inspeccion->tipo = $request->input('tipo');
        $inspeccion->descripcion = $request->input('descripcion');
        $inspeccion->save();

        // Actualizar la calendarización asociada
        $idCalendario = $request->input('id_calendario');
        $calendarizacion = calendarizacion::find($idCalendario);

        if ($calendarizacion) {
            $calendarizacion->pasoActividad = $request->input('pasoActividad');
            $calendarizacion->save();

            // Registrar log de la actualización
            $this->createLog($request, "Actualizó la calendarización ID: {$idCalendario} con inspección ID: {$inspeccion->id}", "Gestión de calendarización");
        } else {
            DB::rollBack();
            throw new \Exception("No se encontró la calendarización con ID: {$idCalendario}");
        }

        DB::commit();

        return response()->json([
            'success' => 'Datos de inspección actualizados correctamente',
            'status' => 200,
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

    public function procesarDeterioros(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_calendario' => 'required|integer',
            'deterioroDatas' => 'required|json',
            'pasoActividad' => 'required|integer',
        
        ], [
            'deterioroDatas.required' => 'Los datos de deterioro son obligatorios.',
            'deterioroDatas.json' => 'Los datos de deterioro deben estar en formato JSON.'
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        try {
            DB::beginTransaction();
    
            // Buscar la inspección por id_calendario
            $inspeccion = inspecciones::where('id_calendario', $request->id_calendario)->firstOrFail();
            $deterioroDatas = json_decode($request->input('deterioroDatas'), true);
            foreach ($deterioroDatas as $deterioro) {
                $inspecciones_deterioro_fallas = new inspecciones_deterioro_fallas();
                $inspecciones_deterioro_fallas->fill([
                    'id_inspeccion' => $inspeccion->id,
                    'id_tipo_deteriorio_falla' => $deterioro['id'],
                    'condicion_general' => $deterioro['condicion'],
                    'porcentaje_deterioro' => match($deterioro['condicion']) {
                        'ninguno' => 0,
                        'leve' => 33,
                        'grave' => 66,
                        default => null,
                    },
                    'observaciones' => $deterioro['observaciones']
                ]);
                $inspecciones_deterioro_fallas->save();
    
                // Registrar log para deterioro
                $this->createLog($request, "Registró deterioro ID: {$inspecciones_deterioro_fallas->id} para inspección ID: {$inspeccion->id}", "Gestión de deterioros");
            }
            $idCalendario = $request->input('id_calendario');
            $calendarizacion = calendarizacion::find($idCalendario);
    
            if ($calendarizacion) {
                $calendarizacion->pasoActividad = $request->input('pasoActividad');
                $calendarizacion->save();
    
                // Registrar log para la actualización de calendarización
                $this->createLog($request, "Actualizó la calendarización ID: {$idCalendario} con inspección ID: {$inspeccion->id}", "Gestión de calendarización");
            } else {
                DB::rollBack();
                throw new \Exception("No se encontró la calendarización con ID: {$idCalendario}");
            }
            DB::commit();
            return response()->json(['success' => 'Deterioros guardados', 'status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public function procesarCondiciones(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_calendario' => 'required|integer|exists:inspecciones,id_calendario',
            'condicionGeneral' => 'required|string|in:Aceptable,Regular,Deficiente',
            'plazoIntervencion' => 'required|string|in:Ninguno,Programable,Urgente',
            'intervencion' => 'required|string|max:255',
            'plazo' => 'nullable|string',
            'observacionesGenerales' => 'nullable|string',
            'pasoActividad' => 'required|integer',
        
        ], [
            'condicionGeneral.required' => 'La condición general es obligatoria.',
            'condicionGeneral.string' => 'La condición general debe ser texto.',
            'condicionGeneral.in' => 'La condición general debe ser Aceptable, Regular o Deficiente.',
            'plazoIntervencion.required' => 'El plazo de intervención es obligatorio.',
            'plazoIntervencion.string' => 'El plazo de intervención debe ser texto.',
            'plazoIntervencion.in' => 'El plazo de intervención debe ser Ninguno, Programable o Urgente.',
            'intervencion.required' => 'La intervención es obligatoria.',
            'intervencion.string' => 'La intervención debe ser texto.',
            'intervencion.max' => 'La intervención no debe exceder 255 caracteres.',
            'plazo.integer' => 'El plazo debe ser un número entero.',
            'observacionesGenerales.string' => 'Las observaciones generales deben ser texto.',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        try {
            // Buscar la inspección asociada al id_calendario
            $inspeccion = inspecciones::where('id_calendario', $request->id_calendario)->firstOrFail();
            DB::beginTransaction();
            // Actualizar los datos de condiciones en la inspección
            $inspeccion->condicion_general = $request->input('condicionGeneral');
            $inspeccion->plazo_intervencion = $request->input('plazoIntervencion');
            $inspeccion->intervencion_requerida = $request->input('intervencion');
            $inspeccion->plazo = $request->input('plazoIntervencion') === 'Ninguno' ? 0 : ($request->input('plazo') ?? 0);
            $inspeccion->observaciones = $request->input('observacionesGenerales');
            
            $inspeccion->save();

            $idCalendario = $request->input('id_calendario');
            $calendarizacion = calendarizacion::find($idCalendario);
    
            if ($calendarizacion) {
                $calendarizacion->pasoActividad = $request->input('pasoActividad');
                $calendarizacion->save();
    
                // Registrar log para la actualización de calendarización
                $this->createLog($request, "Actualizó la calendarización ID: {$idCalendario} con inspección ID: {$inspeccion->id}", "Gestión de calendarización");
            } else {
                DB::rollBack();
                throw new \Exception("No se encontró la calendarización con ID: {$idCalendario}");
            }
            DB::commit();
            return response()->json([
                'success' => 'Condiciones procesadas y guardadas en la inspección',
                'id_inspeccion' => $inspeccion->id,
                'status' => 200,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public function procesarFotografiaFinal(Request $request){
        $validator = Validator::make($request->all(), [
            'id_calendario' => 'required|integer|exists:inspecciones,id_calendario',
            'fotografia_final.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:51200',
            'pasoActividad' => 'required|integer',
        
        ], [
            'fotografia_final.*.image' => 'Cada archivo debe ser una imagen.',
            'fotografia_final.*.mimes' => 'Las imágenes deben ser en formato JPEG, PNG, JPG, GIF o SVG.',
            'fotografia_final.*.max' => 'El tamaño máximo de las imágenes es de 51200 KB.',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        try {
            // Buscar la inspección asociada al id_calendario
            $inspeccion = inspecciones::where('id_calendario', $request->id_calendario)->firstOrFail();
                        

            DB::beginTransaction();
            $inspeccion->fecha_inspeccion = now();
            $inspeccion->estado = 'Realizado';
            $inspeccion->save();
            // Guardar las fotografías finales
            $fotografia_final_paths = $this->savePhotos($request, 'fotografia_final', 'final');
            foreach ($fotografia_final_paths as $path) {
                $this->savePhotoRecord($path, $inspeccion->id, 'fotografia_final', $request);
            }
            $idCalendario = $request->input('id_calendario');
            $calendarizacion = calendarizacion::find($idCalendario);
    
            if ($calendarizacion) {
                $calendarizacion->pasoActividad = $request->input('pasoActividad');
                $calendarizacion->save();
    
                // Registrar log para la actualización de calendarización
                $this->createLog($request, "Actualizó la calendarización ID: {$idCalendario} con inspección ID: {$inspeccion->id}", "Gestión de calendarización");
            } else {
                DB::rollBack();
                throw new \Exception("No se encontró la calendarización con ID: {$idCalendario}");
            }
            DB::commit();
            return response()->json([
                'success' => 'Fotografías guardadas',
                'status' => 200,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
        }


    public function procesarFotografiasAdicionales(Request $request){

            $validator = Validator::make($request->all(), [
                'id_calendario' => 'required|integer|exists:inspecciones,id_calendario',
                'fotografias_adicionales.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:51200',
                'pasoActividad' => 'required|integer'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            try {
                // Buscar la inspección asociada al id_calendario
                $inspeccion = inspecciones::where('id_calendario', $request->id_calendario)->firstOrFail();
                DB::beginTransaction();
                // Guardar las fotografías adicionales

                $fotografias_adicionales_paths = $this->savePhotos($request, 'fotografias_adicionales', 'adicionales');
                foreach ($fotografias_adicionales_paths as $path) {
                    $this->savePhotoRecord($path, $inspeccion->id, 'fotografias_adicionales', $request);
                }
                $idCalendario = $request->input('id_calendario');
                $calendarizacion = calendarizacion::find($idCalendario);
        
                if ($calendarizacion) {
                    $calendarizacion->pasoActividad = $request->input('pasoActividad');
                    $calendarizacion->save();
        
                    // Registrar log para la actualización de calendarización
                    $this->createLog($request, "Actualizó la calendarización ID: {$idCalendario} con inspección ID: {$inspeccion->id}", "Gestión de calendarización");
                } else {
                    DB::rollBack();
                    throw new \Exception("No se encontró la calendarización con ID: {$idCalendario}");
                }
                DB::commit();
                return response()->json([
                    'success' => 'Fotografías adicionales procesadas',
                    'status' => 200,
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

    public function finFechaInspeccion(Request $request){
        $validator = Validator::make($request->all(), [
            'id_calendario' => 'required|integer',
        
        ], [
            'id_calendario.required' => 'El id_calendario es obligatorio.',
            'id_calendario.integer' => 'El id_calendario debe ser un número entero.',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        try {
            // Buscar la inspección asociada al id_calendario
            $inspeccion = inspecciones::where('id_calendario', $request->id_calendario)->firstOrFail();
            $inspeccion->fecha_inspeccion = date('Y-m-d');
            $fecha_y_hora_creacion = $inspeccion->created_at;
            $totalSegundos = Carbon::parse($fecha_y_hora_creacion)->diffInSeconds(Carbon::now());
            $tiempo_ejecucion = number_format($totalSegundos / 60, 2); 
            $inspeccion->tiempo_ejecucion = $tiempo_ejecucion;
            $inspeccion->save();
    
            // Actualizar el estado de la calendarización
            $calendarizacion = calendarizacion::find($request->id_calendario);
            $calendarizacion->estado = 'Realizado';
            $calendarizacion->save();
    
            // Registrar log para la finalización de la inspección
            $this->createLog($request, "Finalizó la inspección ID: {$inspeccion->id}", "Gestión de inspecciones");
    
            return response()->json([
                'success' => 'Inspección finalizada',
                'status' => 200,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

/**
 * Convierte un valor de minutos (en formato string) a formato de horas, minutos y segundos
 * 
 * @param string $minutosString Tiempo en minutos como string (ej. "75,286.48")
 * @return string Tiempo formateado como "Horas X, Minutos Y, Segundos Z"
 */
function convertirMinutosAHorasMinutosSegundos(string $minutosString): string
{
    $minutosString = trim($minutosString);
    
    $minutosString = str_replace(',', '', $minutosString);

    $minutos = (float) $minutosString;
    
    $horas = floor($minutos / 60);
    
    $minutosRestantes = floor(fmod($minutos, 60));
    
    $segundos = round(($minutos - floor($minutos)) * 60);
    
    if ($segundos == 60) {
        $segundos = 0;
        $minutosRestantes++;
        
        if ($minutosRestantes == 60) {
            $minutosRestantes = 0;
            $horas++;
        }
    }
    
    return "{$horas} Horas , {$minutosRestantes} Minutos, {$segundos} Segundos ";
}
    
}