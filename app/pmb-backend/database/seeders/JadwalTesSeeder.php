<?php

namespace Database\Seeders;

use App\Models\JadwalTes;
use App\Models\Pendaftar;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * JadwalTesSeeder — Membuat dummy jadwal untuk pendaftar berstatus Lolos Seleksi
 */
class JadwalTesSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil beberapa pendaftar yang Lolos Seleksi (jika ada)
        $pendaftars = Pendaftar::where('status', Pendaftar::STATUS_LOLOS)->take(3)->get();

        if ($pendaftars->isEmpty()) {
            return;
        }

        $lokasiList = ['Ruang CBT 1', 'Ruang CBT 2', 'Ruang Wawancara A'];

        foreach ($pendaftars as $index => $pendaftar) {
            JadwalTes::create([
                'pendaftar_id' => $pendaftar->id,
                'jenis_tes'    => JadwalTes::JENIS_TES_TULIS,
                'tanggal_tes'  => Carbon::tomorrow()->addDays($index)->toDateString(),
                'jam_tes'      => '08:00',
                'lokasi'       => $lokasiList[$index % count($lokasiList)],
                'status_jadwal'=> JadwalTes::STATUS_TERJADWAL,
            ]);
            
            // Berikan jadwal wawancara untuk salah satu pendaftar
            if ($index === 0) {
                JadwalTes::create([
                    'pendaftar_id' => $pendaftar->id,
                    'jenis_tes'    => JadwalTes::JENIS_WAWANCARA,
                    'tanggal_tes'  => Carbon::tomorrow()->addDays($index)->toDateString(),
                    'jam_tes'      => '13:00',
                    'lokasi'       => 'Ruang Wawancara A',
                    'status_jadwal'=> JadwalTes::STATUS_TERJADWAL,
                ]);
            }
        }
    }
}
