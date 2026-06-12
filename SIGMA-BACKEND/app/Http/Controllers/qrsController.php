<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\qrs;
use App\Models\activos;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class qrsController extends Controller
{
    public function generate($activo_id)
    {
        try {
            DB::beginTransaction();

            $activo = activos::findOrFail($activo_id);
            
            if (!Storage::disk('public')->exists('qrcodes')) {
                Storage::disk('public')->makeDirectory('qrcodes');
            }
            
            $jsonData = json_encode($activo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Error en la codificación JSON: ' . json_last_error_msg());
            }

            $qrCode = QrCode::size(400)
                        ->margin(1)
                        ->generate($jsonData);

            $fileName = 'qr_' . $activo_id . '_' . time() . '.svg';

            if (!Storage::disk('public')->put('qrcodes/' . $fileName, $qrCode)) {
                throw new \Exception('Error al guardar el archivo QR');
            }

            $qrCodePath = 'storage/qrcodes/' . $fileName;

            $qr = qrs::updateOrCreate(
                ['activo_id' => $activo_id],
                ['codigo_qr' => $qrCodePath]
            );

            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Código QR generado correctamente',
                'data' => [
                    'id' => $qr->id,
                    'activo_id' => $qr->activo_id,
                    'url' => url($qr->codigo_qr)
                ]
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al generar QR: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al generar el código QR: ' . $e->getMessage()
            ], 500);
        }
        }

        public function get($activo_id)
        {
        try {
            $qr = qrs::where('activo_id', $activo_id)->firstOrFail();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $qr->id,
                    'activo_id' => $qr->activo_id,
                    'url' => url($qr->codigo_qr) // Usar url() helper para generar URL completa
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'QR no encontrado'
            ], 404);
        }
    }

    public function delete($activo_id)
    {
        try {
            $qr = qrs::where('activo_id', $activo_id)->firstOrFail();
            
            // Eliminar el archivo de imagen si existe
            if (Storage::disk('public')->exists(str_replace('storage/', '', $qr->codigo_qr))) {
                Storage::disk('public')->delete(str_replace('storage/', '', $qr->codigo_qr));
            }

            $qr->delete();
            return response()->json(['success' => 'Código QR eliminado correctamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar el c��digo QR: ' . $e->getMessage()], 500);
        }
    }

    public function testGenerate($activo_id)
    {
        try {
            $activo = activos::findOrFail($activo_id);
            
            // Generate QR code
            $qrCode = QrCode::size(300)->errorCorrection('H')->generate(json_encode($activo));

            // Crear un nombre único para el archivo
            $fileName = 'test_qr_' . $activo_id . '_' . time() . '.svg';

            // Guardar el SVG en storage/app/public/qrcodes
            Storage::disk('public')->put('qrcodes/' . $fileName, $qrCode);

            // Obtener la ruta del archivo guardado
            $qrCodePath = 'storage/qrcodes/' . $fileName;

            return response()->json([
                'success' => true,
                'message' => 'QR Code generated successfully',
                'qr_code_path' => $qrCodePath,
                'activo' => $activo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating QR Code: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getPNG($activo_id) 
    {
        try {
            $qr = qrs::where('activo_id', $activo_id)->firstOrFail();
            $svgPath = public_path(str_replace('storage/', 'storage/app/public/', $qr->codigo_qr));
            
            // Return SVG path for client-side conversion
            return response()->json([
                'success' => true,
                'svg_url' => url($qr->codigo_qr)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'QR no encontrado'
            ], 404);
        }
    }
    
}