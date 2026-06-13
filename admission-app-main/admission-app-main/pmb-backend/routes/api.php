<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\JadwalTesController;
use App\Http\Controllers\Api\PendaftarController;
use App\Http\Controllers\Api\RescheduleController;
use Illuminate\Support\Facades\Route;

/*
 * API Routes — Sistem PMB
 * Semua route di bawah prefix /api secara otomatis
 */

// --- Auth ---
Route::post('/auth/login', [AdminAuthController::class, 'login']);

// --- Publik (tidak butuh auth) ---
Route::post('/pendaftar', [PendaftarController::class, 'store']);
Route::get('/pendaftar/{nomorPendaftaran}', [PendaftarController::class, 'show'])
    ->where('nomorPendaftaran', 'PMB-[0-9]{4}-[0-9]{4}');
Route::post('/pendaftar/{nomorPendaftaran}/heregistrasi', [PendaftarController::class, 'heregistrasi'])
    ->where('nomorPendaftaran', 'PMB-[0-9]{4}-[0-9]{4}');

// Jadwal & Reschedule Publik
Route::get('/jadwal-tes/peserta/{nomorPendaftaran}', [JadwalTesController::class, 'getByNomor'])
    ->where('nomorPendaftaran', 'PMB-[0-9]{4}-[0-9]{4}');
Route::post('/jadwal-tes/{id}/reschedule', [RescheduleController::class, 'store']);

// --- Admin (butuh Sanctum token) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AdminAuthController::class, 'logout']);
    Route::get('/pendaftar', [PendaftarController::class, 'index']);
    Route::patch('/pendaftar/{id}/status', [PendaftarController::class, 'updateStatus']);
    Route::get('/statistik', [PendaftarController::class, 'statistik']);
    Route::get('/pendaftar/export/csv', [PendaftarController::class, 'exportCsv']);

    // Penjadwalan Tes
    Route::get('/jadwal-tes/statistik', [JadwalTesController::class, 'statistik']);
    Route::get('/jadwal-tes/pendaftar-eligible', [JadwalTesController::class, 'pendaftarEligible']);
    Route::get('/jadwal-tes', [JadwalTesController::class, 'index']);
    Route::post('/jadwal-tes', [JadwalTesController::class, 'store']);
    Route::get('/jadwal-tes/{id}', [JadwalTesController::class, 'show']);
    Route::put('/jadwal-tes/{id}', [JadwalTesController::class, 'update']);
    Route::delete('/jadwal-tes/{id}', [JadwalTesController::class, 'destroy']);

    // Manajemen Reschedule
    Route::get('/reschedule', [RescheduleController::class, 'index']);
    Route::patch('/reschedule/{id}/approve', [RescheduleController::class, 'approve']);
    Route::patch('/reschedule/{id}/reject', [RescheduleController::class, 'reject']);
});
