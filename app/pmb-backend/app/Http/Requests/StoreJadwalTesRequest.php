<?php

namespace App\Http\Requests;

use App\Models\JadwalTes;
use App\Models\Pendaftar;
use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreJadwalTesRequest — validasi input pembuatan jadwal tes baru
 */
class StoreJadwalTesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pendaftar_id' => 'required|integer|exists:pendaftars,id',
            'jenis_tes'    => 'required|string|in:' . implode(',', JadwalTes::JENIS_LIST),
            'tanggal_tes'  => 'required|date|after_or_equal:today',
            'jam_tes'      => 'required|date_format:H:i',
            'lokasi'       => 'required|string|max:255',
        ];
    }

    /**
     * Validasi tambahan setelah rule dasar lolos
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Cek pendaftar harus berstatus "Lolos Seleksi"
            if ($this->pendaftar_id) {
                $pendaftar = Pendaftar::find($this->pendaftar_id);
                if ($pendaftar && $pendaftar->status !== Pendaftar::STATUS_LOLOS) {
                    $validator->errors()->add(
                        'pendaftar_id',
                        'Hanya pendaftar berstatus "Lolos Seleksi" yang dapat diberikan jadwal tes'
                    );
                }
            }

            // Cek bentrok jadwal (pendaftar + tanggal + jam yang sama)
            if ($this->pendaftar_id && $this->tanggal_tes && $this->jam_tes) {
                $bentrok = JadwalTes::where('pendaftar_id', $this->pendaftar_id)
                    ->where('tanggal_tes', $this->tanggal_tes)
                    ->where('jam_tes', $this->jam_tes)
                    ->where('status_jadwal', '!=', JadwalTes::STATUS_DIBATALKAN)
                    ->exists();

                if ($bentrok) {
                    $validator->errors()->add(
                        'jam_tes',
                        'Pendaftar sudah memiliki jadwal pada tanggal dan jam yang sama'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'pendaftar_id.required' => 'Pendaftar wajib dipilih',
            'pendaftar_id.exists'   => 'Pendaftar tidak ditemukan',
            'jenis_tes.required'    => 'Jenis tes wajib dipilih',
            'jenis_tes.in'          => 'Jenis tes tidak valid',
            'tanggal_tes.required'  => 'Tanggal tes wajib diisi',
            'tanggal_tes.date'      => 'Format tanggal tidak valid',
            'tanggal_tes.after_or_equal' => 'Tanggal tes tidak boleh di masa lalu',
            'jam_tes.required'      => 'Jam tes wajib diisi',
            'jam_tes.date_format'   => 'Format jam harus HH:MM',
            'lokasi.required'       => 'Lokasi tes wajib diisi',
        ];
    }
}
