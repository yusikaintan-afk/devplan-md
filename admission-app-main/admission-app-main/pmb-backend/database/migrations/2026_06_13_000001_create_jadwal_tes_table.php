<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jadwal_tes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pendaftar_id')->constrained('pendaftars')->onDelete('cascade');
            $table->string('jenis_tes', 20); // 'Tes Tulis' atau 'Wawancara'
            $table->date('tanggal_tes');
            $table->time('jam_tes');
            $table->string('lokasi', 255);
            $table->string('status_jadwal', 20)->default('Terjadwal'); // Terjadwal, Selesai, Dibatalkan
            $table->timestamps();

            // Index untuk query yang sering digunakan
            $table->index('pendaftar_id');
            $table->index('tanggal_tes');
            $table->index('status_jadwal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_tes');
    }
};
