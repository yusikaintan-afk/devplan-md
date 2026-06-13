<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model JadwalTes — merepresentasikan satu jadwal tes/wawancara PMB
 */
class JadwalTes extends Model
{
    protected $table = 'jadwal_tes';

    const JENIS_TES_TULIS = 'Tes Tulis';
    const JENIS_WAWANCARA = 'Wawancara';

    const JENIS_LIST = [
        self::JENIS_TES_TULIS,
        self::JENIS_WAWANCARA,
    ];

    const STATUS_TERJADWAL = 'Terjadwal';
    const STATUS_SELESAI = 'Selesai';
    const STATUS_DIBATALKAN = 'Dibatalkan';

    const STATUS_LIST = [
        self::STATUS_TERJADWAL,
        self::STATUS_SELESAI,
        self::STATUS_DIBATALKAN,
    ];

    protected $fillable = [
        'pendaftar_id',
        'jenis_tes',
        'tanggal_tes',
        'jam_tes',
        'lokasi',
        'status_jadwal',
    ];

    protected $casts = [
        'tanggal_tes' => 'date',
    ];

    /**
     * Relasi ke pendaftar pemilik jadwal ini
     */
    public function pendaftar(): BelongsTo
    {
        return $this->belongsTo(Pendaftar::class);
    }

    /**
     * Relasi ke permintaan reschedule untuk jadwal ini
     */
    public function rescheduleRequests(): HasMany
    {
        return $this->hasMany(RescheduleRequest::class);
    }
}
