<?php
namespace App\Http\Controllers;

use App\Models\compras;
use App\Models\detalle_compras;
use App\Models\proveedores;
use App\Models\recursos;
use App\Models\ajustesPresupuesto;
use App\Models\presupuestos;
use App\Models\mantenimientos;
use App\Models\logs;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class comprasController extends Controller
{
    // Método para obtener los detalles de una compra específica
    public function show($id)
    {
        $compra = compras::find($id);

        if (!$compra) {
            return response()->json(['message' => 'Compra no encontrada'], 404);
        }

        // Obtener detalles del proveedor
        $proveedor = proveedores::findOrFail($compra->id_proveedor);
        
        // Obtener los items(elementos) de la compra con información del recurso
        $detalles = detalle_compras::where('id_compra', $compra->id)
            ->join('recursos', 'detalle_compras.id_recurso', '=', 'recursos.id')
            ->select('detalle_compras.*', 'recursos.nombre as nombre_recurso')
            ->get();

        //Verificar si el detalle esta vacio
        if ($detalles->isEmpty()) {
            $detalles = detalle_compras::where('id_compra', $compra->id)->get();
            //renombrar material_o_servicio a nombre_recurso
            foreach ($detalles as $detalle) {
                $detalle->nombre_recurso = $detalle->material_o_servicio;
            }
        }
            
        //Formatear la fecha de la compra
        $fecha_en_español = Carbon::parse($compra->fecha_factura)->locale('es_ES')->isoFormat('dddd D [de] MMMM [de] YYYY');

        //crear la respuesta con los detalles de la compra
        $detallesCompra = [
            'id' => $compra->id,
            'proveedor' => $proveedor->nombre_proveedor, 
            'total' => $compra->total,
            'fecha_factura' => $fecha_en_español,
            'estado' => $compra->estado,
            'area' => $compra->area,
            'no_factura' => $compra->no_factura,
            'serie_factura' => $compra->serie_factura,
            'detalles' => $detalles,
            'otras_compras' => $compra->otras_compras,
            'created_at' => $compra->created_at,
            'updated_at' => $compra->updated_at
        ];

        return response()->json($detallesCompra, 200);
    }

    // Método para registrar una nueva compra
    public function register(Request $request)
    {
        try {
            DB::beginTransaction();

            // Primero validamos que existan los recursos y que las cantidades sean válidas
            foreach ($request->items as $item) {
                $recurso = recursos::findOrFail($item['id_recurso']);
                
                // Validar que la nueva cantidad no exceda las existencias máximas
                $nuevaCantidad = $recurso->existencias + $item['cantidad'];
                if ($nuevaCantidad > $recurso->existencias_maximas) {
                    return response()->json([
                        'message' => 'Error: La cantidad excede las existencias máximas permitidas para el recurso: ' . $recurso->nombre,
                        'recurso' => $recurso->nombre,
                        'cantidad_actual' => $recurso->existencias,
                        'cantidad_a_agregar' => $item['cantidad'],
                        'maximo_permitido' => $recurso->existencias_maximas
                    ], 400);
                }
                
                // Validar el nuevo precio si existe
                if (isset($item['nuevo_precio']) && $item['nuevo_precio'] > 0) {
                    // Verificar si el precio ha cambiado
                    if ($item['nuevo_precio'] != $recurso->precio) {
                        // Actualizar el precio del recurso
                        $recurso->precio = $item['nuevo_precio'];
                        $recurso->save();
                    }
                }
            }

            // Buscar el presupuesto activo para el área
            $presupuesto = presupuestos::where('area', $request->area)
                ->where('estado', 'Activo')
                ->first();

            if (!$presupuesto) {
                return response()->json([
                    'message' => 'No existe un presupuesto activo para el área especificada',
                    'area' => $request->area
                ], 404);
            }

            // Verificar si hay suficiente presupuesto
            if ($presupuesto->monto_pendiente < $request->total) {
                return response()->json([
                    'message' => 'No hay suficiente presupuesto disponible para realizar la compra',
                    'presupuesto_disponible' => $presupuesto->monto_pendiente,
                    'total_compra' => $request->total
                ], 400);
            }

            // Registrar la compra
            $compra = new compras();
            $compra->id_proveedor = $request->id_proveedor;
            $compra->id_usuario = $request->user()->id;
            $compra->id_presupuesto = $presupuesto->id; // Agregamos el id del presupuesto activo
            $compra->total = $request->total;
            $compra->estado = 'Activo';
            $compra->area = $request->area;
            $compra->fecha_factura = $request->fecha_factura;
            $compra->no_factura = $request->no_factura;
            $compra->serie_factura = $request->serie_factura;
            $compra->otras_compras = $request->otras_compras;
            $compra->save();

            // Registrar los detalles y actualizar existencias
            foreach ($request->items as $item) {
                // Guardar el detalle de la compra
                $detalle = new detalle_compras();
                $detalle->id_compra = $compra->id;
                $detalle->id_recurso = $item['id_recurso'];
                $detalle->cantidad = $item['cantidad'];
                $detalle->unidad_medida = $item['unidad_medida']; // Agregado el nuevo campo para unidad de medida
                //$detalle->precio_unitario = $item['precio_unitario'];
                // Usar el nuevo precio si existe, sino usar el precio original
                $detalle->precio_unitario = isset($item['nuevo_precio']) && $item['nuevo_precio'] > 0 
                ? $item['nuevo_precio'] 
                : $item['precio_unitario'];
                $detalle->total = $item['total'];
                //$detalle->total = $detalle->cantidad * $detalle->precio_unitario;
                $detalle->save();

                // Actualizar existencias del recurso
                $recurso = recursos::findOrFail($item['id_recurso']);
                $recurso->existencias += $item['cantidad'];
                $recurso->save();
            }

            // Actualizar el presupuesto
            $presupuesto->monto_pendiente -= $request->total;
            $presupuesto->presupuesto_ejecutado += $request->total;
            $presupuesto->save();

            // Registrar en logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Realizó una compra por Q." . $request->total . " y se ajustó el presupuesto del área " . $request->area;
            $log->modulo = "Compras";
            $log->save();

            DB::commit();
            return response()->json([
                'success' => 'Compra registrada correctamente',
                'message' => 'Se han actualizado las existencias de los recursos y el presupuesto'
            ], 200);

        } catch (QueryException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error en la base de datos al registrar la compra', 
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error inesperado al registrar la compra', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Método para cancelar una compra
    public function cancel_purchase($id)
    {
        $compra = compras::findOrFail($id);

        // Verificar si la compra ya está cancelada
        if ($compra->estado === 'Cancelado') {
            return response()->json(['message' => 'La compra ya está cancelada'], 400);
        }

        try {
            DB::beginTransaction();

            // Obtener todos los detalles de la compra
            $detalles = detalle_compras::where('id_compra', $id)->get();

            // Verificar y actualizar las existencias de cada recurso
            foreach ($detalles as $detalle) {

                //Verificamos si tiene un recurso asociado
                if ($detalle->material_o_servicio != null || $detalle->material_o_servicio != '') {
                 // No hacer nada si no tiene un recurso asociado   
                }
                else {
                    $recurso = recursos::findOrFail($detalle->id_recurso);
                    
                    // Verificar que haya suficientes existencias para cancelar
                    if ($recurso->existencias < $detalle->cantidad) {
                        DB::rollBack();
                        return response()->json([
                            'message' => 'No hay suficientes existencias para cancelar la compra',
                            'recurso' => $recurso->nombre,
                            'existencias_actuales' => $recurso->existencias,
                            'cantidad_a_cancelar' => $detalle->cantidad
                        ], 400);
                    }

                    // Restar la cantidad del recurso
                    $recurso->existencias -= $detalle->cantidad;
                    $recurso->save();
                }
            }

            // Buscar el presupuesto activo para el área de la compra
            $presupuesto = presupuestos::where('area', $compra->area)
                ->where('estado', 'Activo')
                ->first();

            if (!$presupuesto) {
                DB::rollBack();
                return response()->json([
                    'message' => 'No se encontró un presupuesto activo para el área de la compra',
                    'area' => $compra->area
                ], 404);
            }

            // Crear el ajuste de presupuesto por la cancelación
            $ajuste = new ajustesPresupuesto();
            $ajuste->id_presupuesto = $presupuesto->id;
            $ajuste->cantidad = $compra->total;
            $ajuste->tipo = 'Aumento';
            $ajuste->motivo = 'Aumento por cancelación de compra #' . $compra->id;
            $ajuste->save();

            // Actualizar el monto pendiente en el presupuesto
            $presupuesto->monto_pendiente += $compra->total;
            // Actualizar el presupuesto ejecutado
            $presupuesto->presupuesto_ejecutado -= $compra->total;
            $presupuesto->save();

            // Actualizar el estado de la compra
            $compra->estado = 'Cancelado';
            $compra->save();

            // Registrar en logs
            $log = new logs();
            $log->id_usuario = auth()->user()->id;
            $log->descripcion = "Canceló la compra #" . $compra->id . " y se ajustó el presupuesto del área " . $compra->area . " agregando Q." . $compra->total;
            $log->modulo = "Compras";
            $log->save();

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Compra cancelada correctamente, existencias y presupuesto actualizados'
            ], 200);

        } catch (QueryException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error en la base de datos al cancelar la compra', 
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error inesperado al cancelar la compra', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Método para listar todas las compras con un estado específico
    public function get_all()
    {
        $estado = $_POST['estado'];
        $compras = compras::where('estado', $estado)->get();
        $data = [];

        foreach ($compras as $compra) {
            $detalles = detalle_compras::where('id_compra', $compra->id)->get();
            $proveedor = proveedores::findOrFail($compra->id_proveedor);
            $fecha_en_español = Carbon::parse($compra->fecha_factura)->locale('es_ES')->isoFormat('dddd D [de] MMMM [de] YYYY');

            $modelo = [
                'id' => $compra->id,
                'proveedor' => $proveedor->nombre_proveedor, // Cambiado de nombre a nombre_proveedor
                'total' => $compra->total,
                'fecha_factura' => $fecha_en_español,
                'estado' => $compra->estado,
                'area' => $compra->area,
                'no_factura' => $compra->no_factura,
                'serie_factura' => $compra->serie_factura,
                'detalles' => $detalles,
                'otras_compras' => $compra->otras_compras,
                'created_at' => $compra->created_at,
                'updated_at' => $compra->updated_at
            ];

            array_push($data, $modelo);
        }

        $meta = [
            "page" => 1,
            "pages" => 1,
            "perpage" => 5,
            "total" => count($data)
        ];

        return response()->json([
            "meta" => $meta,
            "data" => $data
        ]);
    }

    public function getByPresupuesto($id_presupuesto)
    {
        // Obtenemos las compras que tienen el id_presupuesto especificado y estado Activo
        $compras = compras::where('id_presupuesto', $id_presupuesto)
                          ->where('estado', 'Activo')
                          ->get();
    
        // Verificamos si se encontraron compras para el id_presupuesto
        if ($compras->isEmpty()) {
            return response()->json([
                "message" => "No se encontraron compras activas para el presupuesto especificado."
            ]);
        }
    
        // Preparamos la respuesta con los datos de las compras
        $data = [];
        foreach ($compras as $compra) {
            $model = [
                "id" => $compra->id,
                "serie_factura" => $compra->serie_factura,
                "no_factura" => $compra->no_factura,
                //"fecha_factura" => $compra->fecha_factura,
                'fecha_factura' => Carbon::parse($compra->fecha_factura)->locale('es_ES')->isoFormat('dddd D [de] MMMM [de] YYYY'),
                "total" => $compra->total
            ];
            array_push($data, $model);
        }
    
        // Estructuramos la respuesta JSON
        return response()->json([
            "data" => $data,
            "total_compras" => count($data)
        ]);
    }

    public function register_compra_mantenimiento(Request $request)
    {
        try {
            DB::beginTransaction();

            // Buscar el presupuesto activo para el área
            $presupuesto = presupuestos::where('area', $request->area)
                ->where('estado', 'Activo')
                ->first();

            if (!$presupuesto) {
                return response()->json([
                    'message' => 'No existe un presupuesto activo para el área especificada',
                    'area' => $request->area
                ], 404);
            }

            // Verificar si hay suficiente presupuesto
            if ($presupuesto->monto_pendiente < $request->total) {
                return response()->json([
                    'message' => 'No hay suficiente presupuesto disponible para realizar la compra',
                    'presupuesto_disponible' => $presupuesto->monto_pendiente,
                    'total_compra' => $request->total
                ], 400);
            }

            // Registrar la compra
            $compra = new compras();
            $compra->id_proveedor = $request->id_proveedor;
            $compra->id_usuario = $request->user()->id;
            $compra->id_presupuesto = $presupuesto->id; // Agregamos el id del presupuesto activo
            $compra->total = $request->total;
            $compra->estado = 'Activo';
            $compra->area = $request->area;
            $compra->fecha_factura = $request->fecha_factura;
            $compra->no_factura = $request->no_factura;
            $compra->serie_factura = $request->serie_factura;
            $compra->save();

            // Registrar los detalles y actualizar existencias
            foreach ($request->items as $item) {
                // Guardar el detalle de la compra
                $detalle = new detalle_compras();
                $detalle->id_compra = $compra->id;
                $detalle->id_recurso = null; // Cambiar a null para los mantenimientos
                $detalle->cantidad = $item['cantidad'];
                $detalle->unidad_medida = $item['unidad']; // Agregado el nuevo campo para unidad de medida
                $detalle->precio_unitario = $item['precio_unitario'];
                $detalle->total = $item['total'];
                $detalle->material_o_servicio = $item['material_o_servicio'];
                $detalle->save();
            }

            // Crear el ajuste de presupuesto
            $ajuste = new ajustesPresupuesto();
            $ajuste->id_presupuesto = $presupuesto->id;
            $ajuste->cantidad = $request->total;
            $ajuste->tipo = 'Reduccion';
            $ajuste->motivo = 'Reducción por pago de mantenimiento compra #' . $compra->id;
            $ajuste->save();

            // Actualizar el presupuesto
            $presupuesto->monto_pendiente -= $request->total;
            $presupuesto->presupuesto_ejecutado += $request->total;
            $presupuesto->save();

            // Actualizar el mantenimiento
            $mantenimiento = mantenimientos::findOrFail($request->id_mantenimiento);
            $mantenimiento->estado = 'Pagado';
            $mantenimiento->save();


            // Registrar en logs
            $log = new logs();
            $log->id_usuario = $request->user()->id;
            $log->descripcion = "Realizó una pago de mantenimiento por Q." . $request->total . " y se ajustó el presupuesto del área " . $request->area;
            $log->modulo = "Compras";
            $log->save();

            DB::commit();
            return response()->json([
                'success' => 'Pago registrado correctamente',
            ], 200);

        } catch (QueryException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error en la base de datos al registrar la compra', 
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error inesperado al registrar la compra', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
