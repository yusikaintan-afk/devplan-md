<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalTes;
use App\Models\RescheduleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * RescheduleController — API endpoint untuk mengelola pengajuan reschedule
 */
class RescheduleController extends Controller
{
    /**
     * Menampilkan semua request reschedule (admin)
     * GET /api/reschedule
     */
    public function index(): JsonResponse
    {
        try {
            $requests = RescheduleRequest::with([
                'jadwalTes.pendaftar:id,nomor_pendaftaran,nama,prodi',
                'approver:id,name'
            ])
            ->orderByRaw("FIELD(status_pengajuan, 'Menunggu') DESC")
            ->orderBy('created_at', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'data'    => $requests,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data reschedule',
            ], 500);
        }
    }

    /**
     * Mengajukan reschedule baru (publik, via peserta)
     * POST /api/jadwal-tes/{id}/reschedule
     */
    public function store(Request $request, int $jadwalTesId): JsonResponse
    {
        try {
            $jadwal = JadwalTes::findOrFail($jadwalTesId);

            // Validasi apakah sudah ada request yang masih menunggu atau sudah disetujui
            $existingRequest = RescheduleRequest::where('jadwal_tes_id', $jadwalTesId)
                ->whereIn('status_pengajuan', [RescheduleRequest::STATUS_MENUNGGU, RescheduleRequest::STATUS_DISETUJUI])
                ->first();

            if ($existingRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah memiliki pengajuan reschedule yang aktif untuk jadwal ini',
                ], 422);
            }

            $validated = $request->validate([
                'alasan' => 'required|string|min:10|max:1000',
            ]);

            $reschedule = RescheduleRequest::create([
                'jadwal_tes_id'    => $jadwal->id,
                'alasan'           => $validated['alasan'],
                'status_pengajuan' => RescheduleRequest::STATUS_MENUNGGU,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan reschedule berhasil dikirim',
                'data'    => $reschedule,
            ], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tes tidak ditemukan',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengajukan reschedule',
            ], 500);
        }
    }

    /**
     * Menyetujui pengajuan reschedule (admin)
     * PATCH /api/reschedule/{id}/approve
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        try {
            $reschedule = RescheduleRequest::findOrFail($id);

            if ($reschedule->status_pengajuan !== RescheduleRequest::STATUS_MENUNGGU) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengajuan ini sudah diproses sebelumnya',
                ], 422);
            }

            // Setujui request
            $reschedule->update([
                'status_pengajuan' => RescheduleRequest::STATUS_DISETUJUI,
                'approved_by'      => $request->user()->id,
            ]);

            // Batalkan jadwal lama agar admin bisa membuatkan jadwal baru nanti
            $reschedule->jadwalTes->update([
                'status_jadwal' => JadwalTes::STATUS_DIBATALKAN,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan reschedule disetujui, jadwal lama telah dibatalkan',
                'data'    => $reschedule->fresh()->load('jadwalTes', 'approver:id,name'),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Data reschedule tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses persetujuan',
            ], 500);
        }
    }

    /**
     * Menolak pengajuan reschedule (admin)
     * PATCH /api/reschedule/{id}/reject
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        try {
            $reschedule = RescheduleRequest::findOrFail($id);

            if ($reschedule->status_pengajuan !== RescheduleRequest::STATUS_MENUNGGU) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengajuan ini sudah diproses sebelumnya',
                ], 422);
            }

            // Tolak request
            $reschedule->update([
                'status_pengajuan' => RescheduleRequest::STATUS_DITOLAK,
                'approved_by'      => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan reschedule ditolak',
                'data'    => $reschedule->fresh()->load('approver:id,name'),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Data reschedule tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses penolakan',
            ], 500);
        }
    }
}
