<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model RescheduleRequest — permintaan perubahan jadwal tes dari peserta
 */
class RescheduleRequest extends Model
{
    const STATUS_MENUNGGU = 'Menunggu';
    const STATUS_DISETUJUI = 'Disetujui';
    const STATUS_DITOLAK = 'Ditolak';

    const STATUS_LIST = [
        self::STATUS_MENUNGGU,
        self::STATUS_DISETUJUI,
        self::STATUS_DITOLAK,
    ];

    protected $fillable = [
        'jadwal_tes_id',
        'alasan',
        'status_pengajuan',
        'approved_by',
    ];

    /**
     * Relasi ke jadwal tes yang ingin di-reschedule
     */
    public function jadwalTes(): BelongsTo
    {
        return $this->belongsTo(JadwalTes::class);
    }

    /**
     * Relasi ke admin yang menyetujui/menolak
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
