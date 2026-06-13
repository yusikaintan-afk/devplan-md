<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJadwalTesRequest;
use App\Models\JadwalTes;
use App\Models\Pendaftar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * JadwalTesController — API endpoint untuk mengelola jadwal tes PMB
 */
class JadwalTesController extends Controller
{
    /**
     * Menampilkan semua jadwal tes (admin)
     * GET /api/jadwal-tes
     */
    public function index(): JsonResponse
    {
        try {
            $jadwalList = JadwalTes::with('pendaftar:id,nomor_pendaftaran,nama,prodi,jalur')
                ->orderBy('tanggal_tes', 'desc')
                ->orderBy('jam_tes', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $jadwalList,
                'meta'    => ['total' => $jadwalList->count()],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data jadwal tes',
            ], 500);
        }
    }

    /**
     * Menyimpan jadwal tes baru (admin)
     * POST /api/jadwal-tes
     */
    public function store(StoreJadwalTesRequest $request): JsonResponse
    {
        try {
            $jadwal = JadwalTes::create([
                'pendaftar_id' => $request->pendaftar_id,
                'jenis_tes'    => $request->jenis_tes,
                'tanggal_tes'  => $request->tanggal_tes,
                'jam_tes'      => $request->jam_tes,
                'lokasi'       => $request->lokasi,
                'status_jadwal' => JadwalTes::STATUS_TERJADWAL,
            ]);

            $jadwal->load('pendaftar:id,nomor_pendaftaran,nama,prodi');

            return response()->json([
                'success' => true,
                'message' => 'Jadwal tes berhasil dibuat',
                'data'    => $jadwal,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan jadwal tes',
            ], 500);
        }
    }

    /**
     * Menampilkan detail satu jadwal tes (admin)
     * GET /api/jadwal-tes/{id}
     */
    public function show(int $id): JsonResponse
    {
        $jadwal = JadwalTes::with([
            'pendaftar:id,nomor_pendaftaran,nama,email,nomor_hp,prodi,jalur',
            'rescheduleRequests.approver:id,name',
        ])->find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tes tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $jadwal,
        ]);
    }

    /**
     * Mengubah jadwal tes (admin)
     * PUT /api/jadwal-tes/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $jadwal = JadwalTes::findOrFail($id);

            $validated = $request->validate([
                'jenis_tes'    => 'sometimes|string|in:' . implode(',', JadwalTes::JENIS_LIST),
                'tanggal_tes'  => 'sometimes|date',
                'jam_tes'      => 'sometimes|date_format:H:i',
                'lokasi'       => 'sometimes|string|max:255',
                'status_jadwal' => 'sometimes|string|in:' . implode(',', JadwalTes::STATUS_LIST),
            ]);

            $jadwal->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Jadwal tes berhasil diperbarui',
                'data'    => $jadwal->fresh()->load('pendaftar:id,nomor_pendaftaran,nama,prodi'),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tes tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui jadwal tes',
            ], 500);
        }
    }

    /**
     * Menghapus jadwal tes (admin)
     * DELETE /api/jadwal-tes/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $jadwal = JadwalTes::findOrFail($id);
            $jadwal->delete();

            return response()->json([
                'success' => true,
                'message' => 'Jadwal tes berhasil dihapus',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tes tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus jadwal tes',
            ], 500);
        }
    }

    /**
     * Cek jadwal tes berdasarkan nomor pendaftaran (publik)
     * GET /api/jadwal-tes/peserta/{nomorPendaftaran}
     */
    public function getByNomor(string $nomorPendaftaran): JsonResponse
    {
        $pendaftar = Pendaftar::where('nomor_pendaftaran', $nomorPendaftaran)->first();

        if (!$pendaftar) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor pendaftaran tidak ditemukan',
            ], 404);
        }

        $jadwalList = JadwalTes::where('pendaftar_id', $pendaftar->id)
            ->with('rescheduleRequests:id,jadwal_tes_id,alasan,status_pengajuan,created_at')
            ->orderBy('tanggal_tes', 'asc')
            ->orderBy('jam_tes', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'pendaftar' => [
                    'id'                => $pendaftar->id,
                    'nomor_pendaftaran' => $pendaftar->nomor_pendaftaran,
                    'nama'              => $pendaftar->nama,
                    'prodi'             => $pendaftar->prodi,
                    'status'            => $pendaftar->status,
                ],
                'jadwal' => $jadwalList,
            ],
        ]);
    }

    /**
     * Statistik jadwal tes (admin)
     * GET /api/jadwal-tes/statistik
     */
    public function statistik(): JsonResponse
    {
        try {
            $perJenis = JadwalTes::selectRaw('jenis_tes, COUNT(*) as total')
                ->groupBy('jenis_tes')
                ->get();

            $perStatus = JadwalTes::selectRaw('status_jadwal, COUNT(*) as total')
                ->groupBy('status_jadwal')
                ->get();

            $pendingReschedule = \App\Models\RescheduleRequest::where('status_pengajuan', 'Menunggu')->count();

            return response()->json([
                'success' => true,
                'data'    => [
                    'total'              => JadwalTes::count(),
                    'per_jenis'          => $perJenis,
                    'per_status'         => $perStatus,
                    'pending_reschedule' => $pendingReschedule,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat statistik jadwal',
            ], 500);
        }
    }

    /**
     * Daftar pendaftar yang eligible untuk dijadwalkan (status Lolos Seleksi)
     * GET /api/jadwal-tes/pendaftar-eligible
     */
    public function pendaftarEligible(): JsonResponse
    {
        try {
            $eligible = Pendaftar::where('status', Pendaftar::STATUS_LOLOS)
                ->select('id', 'nomor_pendaftaran', 'nama', 'prodi', 'jalur')
                ->orderBy('nama')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $eligible,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data pendaftar',
            ], 500);
        }
    }
}
