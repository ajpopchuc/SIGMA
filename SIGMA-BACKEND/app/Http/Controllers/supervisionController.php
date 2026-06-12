<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\supervision;
use App\Models\mantenimientos;
use App\Models\usuarios;
use App\Models\logs;
use Carbon\Carbon;
use App\Models\calendarizacion;
use App\Models\mantenimiento_supervisiones_inspecciones_fotografias;
use Illuminate\Foundation\Auth\User;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;

class supervisionController extends Controller
{
    public function get_supervisiones()
    {
        $supervisiones = supervision::with(['mantenimientos', 'usuarios'])
            ->get();

        $data = [];

        foreach ($supervisiones as $supervision) {
            $model = [
                "id" => $supervision->id,
                "descripcion" => $supervision->descripcion,
                "resumen_actividad" => $supervision->resumen_actividad,
                "observaciones" => $supervision->observaciones,
                "tiempo_ejecucion" => $supervision->tiempo_ejecucion,
                "lugar_mantenimiento" => $supervision->lugar_mantenimiento,
                "id_mantenimiento" => $supervision->id_mantenimiento,
                "mantenimiento" => $supervision->mantenimientos->id,
                "id_usuario" => $supervision->id_usuario,
                "usuario" => $supervision->usuarios->usuario ?? '',
                "id_calendario" => $supervision->id_calendario,
                "created_at" => $supervision->created_at,
                "updated_at" => $supervision->updated_at
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

    public function get_equipos()
    {
        $supervisiones = supervision::with(['mantenimientos', 'usuarios'])
        ->where('lugar_mantenimiento', 'Equipo')  // Cambiado para buscar directamente en supervisiones
        ->get();

        $data = [];

        foreach ($supervisiones as $supervision) {
            $model = [
                "id" => $supervision->id,
                "descripcion" => $supervision->descripcion,
                "resumen_actividad" => $supervision->resumen_actividad,
                "observaciones" => $supervision->observaciones,
                "tiempo_ejecucion" => $supervision->tiempo_ejecucion,
                "lugar_mantenimiento" => $supervision->lugar_mantenimiento,
                "id_mantenimiento" => $supervision->id_mantenimiento,
                "mantenimiento" => $supervision->mantenimientos->id,
                "id_usuario" => $supervision->id_usuario,
                "usuario" => $supervision->usuarios->usuario ?? '',
                "id_calendario" => $supervision->id_calendario,
                "created_at" => $supervision->created_at,
                "updated_at" => $supervision->updated_at
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
        $supervisiones = supervision::with(['mantenimientos', 'usuarios'])
        ->where('lugar_mantenimiento', 'Infraestructura')  // Cambiado para buscar directamente en supervisiones
        ->get();

        $data = [];

        foreach ($supervisiones as $supervision) {
            $model = [
                "id" => $supervision->id,
                "descripcion" => $supervision->descripcion,
                "resumen_actividad" => $supervision->resumen_actividad,
                "observaciones" => $supervision->observaciones,
                "tiempo_ejecucion" => $supervision->tiempo_ejecucion,
                "lugar_mantenimiento" => $supervision->lugar_mantenimiento,
                "id_mantenimiento" => $supervision->id_mantenimiento,
                "mantenimiento" => $supervision->mantenimientos->id,
                "id_usuario" => $supervision->id_usuario,
                "usuario" => $supervision->usuarios->usuario ?? '',
                "id_calendario" => $supervision->id_calendario,
                "created_at" => $supervision->created_at,
                "updated_at" => $supervision->updated_at
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

    public function get_detalle_supervision($id)
    {
        $supervision = supervision::with(['mantenimientos', 'usuarios'])
            ->where('id', $id)
            ->first();

        $imagenes = mantenimiento_supervisiones_inspecciones_fotografias::where('id_mantenimiento_supervision_inspeccion', $id)
            ->where('tipo', 'Supervision')
            ->get(['url'])
            ->map(function ($item) {
                $item->url = url($item->url);
                return $item;
            });

        $data = [
            "id" => $supervision->id,
            "descripcion" => $supervision->descripcion,
            "resumen_actividad" => $supervision->resumen_actividad,
            "observaciones" => $supervision->observaciones,
            "tiempo_ejecucion" => $supervision->tiempo_ejecucion,
            "id_mantenimiento" => $supervision->id_mantenimiento,
            "mantenimiento" => $supervision->mantenimientos->id,
            "id_usuario" => $supervision->id_usuario,
            "usuario" => $supervision->usuarios->usuario ?? '',
            "id_calendario" => $supervision->id_calendario,
            "created_at" => $supervision->created_at,
            "imagenes" => $imagenes
        ];

        return response()->json($data);
    }

    public function crear_supervision(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'descripcion' => 'required|string|max:300',
            'resumen_actividad' => 'required|string',
            'observaciones' => 'nullable|string',
            'tiempo_ejecucion' => 'required|numeric',
            'lugar_mantenimiento' => 'required|string',
            'id_mantenimiento' => 'required|integer|exists:mantenimientos,id',
            'id_calendario' => 'required|integer|exists:calendarizacion,id',
            'fotografia_inicial.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:51200',
            'fotografia_final.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:51200',
            'fotografias_adicionales.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:51200',
        ], [
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string' => 'El campo descripción debe ser una cadena de texto.',
            'descripcion.max' => 'El campo descripción no debe exceder 300 caracteres.',
            'resumen_actividad.required' => 'El campo resumen de actividad es obligatorio.',
            'resumen_actividad.string' => 'El campo resumen de actividad debe ser una cadena de texto.',
            'observaciones.string' => 'El campo observaciones debe ser una cadena de texto.',
            'tiempo_ejecucion.required' => 'El campo tiempo de ejecución es obligatorio.',
            'tiempo_ejecucion.numeric' => 'El campo tiempo de ejecución debe ser un número.',
            'id_mantenimiento.required' => 'El campo mantenimiento es obligatorio.',
            'id_mantenimiento.integer' => 'El campo mantenimiento debe ser un número entero.',
            'id_mantenimiento.exists' => 'El mantenimiento seleccionado no existe.',
            'id_calendario.required' => 'El campo calendario es obligatorio.',
            'id_calendario.integer' => 'El campo calendario debe ser un número entero.',
            'id_calendario.exists' => 'El calendario seleccionado no existe.',
            'fotografia_inicial.*.image' => 'Las fotografías iniciales deben ser imágenes.',
            'fotografia_inicial.*.mimes' => 'Las fotografías iniciales deben ser de tipo: jpeg, png, jpg, gif, svg.',
            'fotografia_inicial.*.max' => 'Las fotografías iniciales no deben exceder 51200 kilobytes.',
            'fotografia_final.*.image' => 'Las fotografías finales deben ser imágenes.',
            'fotografia_final.*.mimes' => 'Las fotografías finales deben ser de tipo: jpeg, png, jpg, gif, svg.',
            'fotografia_final.*.max' => 'Las fotografías finales no deben exceder 51200 kilobytes.',
            'fotografias_adicionales.*.image' => 'Las fotografías adicionales deben ser imágenes.',
            'fotografias_adicionales.*.mimes' => 'Las fotografías adicionales deben ser de tipo: jpeg, png, jpg, gif, svg.',
            'fotografias_adicionales.*.max' => 'Las fotografías adicionales no deben exceder 51200 kilobytes.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            if ($request->hasFile('fotografia_inicial')) {
                //Guardar fotografía inicial
                $fotografia_inicial = $request->file('fotografia_inicial');
                $fotografia_inicial_path = [];
                if ($fotografia_inicial) {
                    foreach ($fotografia_inicial as $key => $fotografia) {
                        // crear nombre de la fotografía
                        $nombre_fotografia = 'fotografia_inicial_' . date('YmdHis') . '_' . $key . '_' . $request->user()->id . '.' . $fotografia->getClientOriginalExtension();
                        
                        Image::configure(array('driver' => 'imagick'));
                        // Redimensionar la imagen, null
                        $image = Image::make($fotografia)->resize(800, null, function ($constraint) {
                            $constraint->aspectRatio();
                            $constraint->upsize();
                        })->encode($fotografia->getClientOriginalExtension(), 75); // Ajustar calidad de la imagen al 75%
                        
                        if (!file_exists(storage_path('app/public/fotografias/supervisiones'))) {
                            mkdir(storage_path('app/public/fotografias/supervisiones'), 0777, true);
                        }
                        
                        // Guardar la imagen optimizada
                        $image->save(storage_path('app/public/fotografias/supervisiones/' . $nombre_fotografia));
                        //$image->storeAs('fotografias/supervisiones', $nombre_fotografia, 'public');
                        array_push($fotografia_inicial_path, 'storage/fotografias/supervisiones/' . $nombre_fotografia);
                    }
                }
            }

            if ($request->hasFile('fotografia_final')) {
                //Guardar fotografías finales
                $fotografia_final = $request->file('fotografia_final');
                $fotografia_final_path = [];
                if ($fotografia_final) {
                    foreach ($fotografia_final as $key => $fotografia) {
                        $nombre_fotografia = 'fotografia_final_' . date('YmdHis') . '_' . $key . '_' . $request->user()->id . '.' . $fotografia->getClientOriginalExtension();

                        Image::configure(array('driver' => 'imagick'));
                        // Redimensionar la imagen
                        $image = Image::make($fotografia)->resize(800, null, function ($constraint) {
                            $constraint->aspectRatio();
                            $constraint->upsize();
                        })->encode($fotografia->getClientOriginalExtension(), 75); // Ajustar calidad de la imagen al 75%


                        if (!file_exists(storage_path('app/public/fotografias/supervisiones'))) {
                            mkdir(storage_path('app/public/fotografias/supervisiones'), 0777, true);
                        }

                        // Guardar la imagen optimizada
                        $image->save(storage_path('app/public/fotografias/supervisiones/' . $nombre_fotografia));
                        //$image->storeAs('fotografias/supervisiones', $nombre_fotografia, 'public');
                        array_push($fotografia_final_path, 'storage/fotografias/supervisiones/' . $nombre_fotografia);
                    }
                }
            }

            $fotografias_adicionales = null;
            if ($request->hasFile('fotografias_adicionales')) {
                //Guardar fotografías adicionales
                $fotografias_adicionales = $request->file('fotografias_adicionales');
                $fotografias_adicionales_paths = [];
                if ($fotografias_adicionales) {
                    foreach ($fotografias_adicionales as $key => $fotografia) {
                        $nombre_fotografia = 'fotografia_adicional_' . date('YmdHis') . '_' . $key . '_' . $request->user()->id . '.' . $fotografia->getClientOriginalExtension();

                        Image::configure(array('driver' => 'imagick'));
                        // Redimensionar la imagen
                        $image = Image::make($fotografia)->resize(800, null, function ($constraint) {
                            $constraint->aspectRatio();
                            $constraint->upsize();
                        })->encode($fotografia->getClientOriginalExtension(), 75); // Ajustar calidad de la imagen al 75%

                        if (!file_exists(storage_path('app/public/fotografias/supervisiones'))) {
                            mkdir(storage_path('app/public/fotografias/supervisiones'), 0777, true);
                        }
                        
                        // Guardar la imagen optimizada
                        $image->save(storage_path('app/public/fotografias/supervisiones/' . $nombre_fotografia));
                        //$image->storeAs('fotografias/supervisiones', $nombre_fotografia, 'public');
                        array_push($fotografias_adicionales_paths, 'storage/fotografias/supervisiones/' . $nombre_fotografia);
                    }
                }
            }

            $supervision = new supervision();
            $supervision->descripcion = $request->descripcion;
            $supervision->resumen_actividad = $request->resumen_actividad;
            $supervision->observaciones = $request->observaciones;
            $supervision->tiempo_ejecucion = $request->tiempo_ejecucion;
            $supervision->lugar_mantenimiento = $request->lugar_mantenimiento;
            $supervision->id_mantenimiento = $request->id_mantenimiento;
            $supervision->id_usuario = $request->user()->id;
            $supervision->id_calendario = $request->id_calendario;
            $supervision->save();

            // Obtener el mantenimiento asociado
            $mantenimiento = mantenimientos::find($request->id_mantenimiento);
            if ($mantenimiento) {
                // Actualizar el resumen de actividad del mantenimiento
                $mantenimiento->resumen_actividad = $request->resumen_actividad;
                $mantenimiento->save();
                }

            if ($fotografia_inicial) {
                foreach ($fotografia_inicial_path as $fotografia) {
                    $fotografia_registro = new mantenimiento_supervisiones_inspecciones_fotografias();
                    $fotografia_registro->id_mantenimiento_supervision_inspeccion = $supervision->id;
                    $fotografia_registro->tipo = "Supervision";
                    $fotografia_registro->url = $fotografia;
                    $fotografia_registro->save();
                }
            }

            if ($fotografia_final) {
                foreach ($fotografia_final_path as $fotografia) {
                    $fotografia_registro = new mantenimiento_supervisiones_inspecciones_fotografias();
                    $fotografia_registro->id_mantenimiento_supervision_inspeccion = $supervision->id;
                    $fotografia_registro->tipo = "Supervision";
                    $fotografia_registro->url = $fotografia;
                    $fotografia_registro->save();
                }
            }

            if ($fotografias_adicionales) {
                foreach ($fotografias_adicionales_paths as $fotografia) {
                    $fotografia_registro = new mantenimiento_supervisiones_inspecciones_fotografias();
                    $fotografia_registro->id_mantenimiento_supervision_inspeccion = $supervision->id;
                    $fotografia_registro->tipo = "Supervision";
                    $fotografia_registro->url = $fotografia;
                    $fotografia_registro->save();
                }
            }

            //Actualizar calendario
            $calendario = calendarizacion::find($request->id_calendario);
            $calendario->estado = "Realizado";
            $calendario->save();

            // Crear log
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Creó la supervisión del mantenimiento con ID " . $request->id_mantenimiento;
            $log->modulo  = "Gestión de Supervisiones";
            $log->save();

            DB::commit();

            return response()->json(['success' => 'Supervisión creada correctamente', 'status' => 200], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear la supervisión', 'error' => $e->getMessage()], 500);
        }
    }
}