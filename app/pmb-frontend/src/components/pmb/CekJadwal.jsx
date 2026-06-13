import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { jadwalTesApi, rescheduleApi } from '../../utils/api';

/**
 * CekJadwal — Komponen untuk peserta melihat jadwal tes dan mengajukan reschedule
 */
const CekJadwal = () => {
  const [nomorPendaftaran, setNomorPendaftaran] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk modal reschedule
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedJadwalId, setSelectedJadwalId] = useState(null);
  const [alasanReschedule, setAlasanReschedule] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  const handleCari = async (e) => {
    e.preventDefault();
    if (!nomorPendaftaran || nomorPendaftaran.length < 5) {
      setError('Masukkan nomor pendaftaran yang valid');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await jadwalTesApi.getByNomor(nomorPendaftaran);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Data tidak ditemukan. Pastikan nomor pendaftaran benar.');
    } finally {
      setLoading(false);
    }
  };

  const openRescheduleModal = (jadwalId) => {
    setSelectedJadwalId(jadwalId);
    setAlasanReschedule('');
    setRescheduleError('');
    setIsRescheduleModalOpen(true);
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    if (!alasanReschedule || alasanReschedule.trim().length < 10) {
      setRescheduleError('Alasan harus diisi minimal 10 karakter');
      return;
    }

    setSubmittingReschedule(true);
    setRescheduleError('');
    
    try {
      await rescheduleApi.create(selectedJadwalId, alasanReschedule);
      setIsRescheduleModalOpen(false);
      // Refresh data to show new reschedule request
      const res = await jadwalTesApi.getByNomor(nomorPendaftaran);
      setData(res.data);
      alert('Pengajuan reschedule berhasil dikirim. Silakan cek status secara berkala.');
    } catch (err) {
      setRescheduleError(err.message || 'Gagal mengajukan reschedule');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const formatTanggalWaktu = (dateStr, timeStr) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeFormatted = timeStr ? timeStr.substring(0, 5) : '';
    return `${dateFormatted} - ${timeFormatted} WIB`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Terjadwal': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">Terjadwal</span>;
      case 'Selesai': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Selesai</span>;
      case 'Dibatalkan': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Dibatalkan</span>;
      default: return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Cek Jadwal Tes PMB</h2>
        <p className="text-slate-500 text-sm mt-1">Masukkan nomor pendaftaran Anda untuk melihat jadwal tes dan wawancara.</p>
      </div>

      <form onSubmit={handleCari} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            name="nomor_pendaftaran"
            value={nomorPendaftaran}
            onChange={(e) => setNomorPendaftaran(e.target.value)}
            placeholder="PMB-2025-XXXX"
            required
            className="w-full"
          />
        </div>
        <Button type="submit" variant="primary" disabled={loading} className="sm:w-auto h-[44px]">
          {loading ? 'Mencari...' : 'Cari Jadwal'}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Info Pendaftar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Data Pendaftar</p>
              <h3 className="text-lg font-bold text-slate-800 mt-1">{data.pendaftar.nama}</h3>
              <p className="text-sm text-slate-600">{data.pendaftar.nomor_pendaftaran} • {data.pendaftar.prodi}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-slate-500 mb-1">Status Kelulusan</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                data.pendaftar.status === 'Lolos Seleksi' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.pendaftar.status}
              </span>
            </div>
          </div>

          {/* Daftar Jadwal */}
          <div>
            <h3 className="text-md font-bold text-slate-800 mb-4 border-b pb-2">Jadwal Anda</h3>
            
            {data.pendaftar.status !== 'Lolos Seleksi' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <p className="text-yellow-800 text-sm">
                  Jadwal tes hanya diberikan kepada peserta yang telah dinyatakan <strong>Lolos Seleksi</strong> administrasi.
                </p>
              </div>
            )}

            {data.pendaftar.status === 'Lolos Seleksi' && data.jadwal.length === 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                <div className="text-3xl mb-2">⏳</div>
                <p className="text-slate-600 font-medium">Jadwal Anda Sedang Disiapkan</p>
                <p className="text-slate-500 text-sm mt-1">Silakan cek kembali halaman ini secara berkala.</p>
              </div>
            )}

            {data.jadwal.length > 0 && (
              <div className="space-y-4">
                {data.jadwal.map((jadwal) => {
                  // Cek apakah ada request reschedule yang aktif (Menunggu/Disetujui)
                  const activeReschedule = jadwal.reschedule_requests?.find(
                    req => req.status_pengajuan === 'Menunggu' || req.status_pengajuan === 'Disetujui'
                  );

                  return (
                    <div key={jadwal.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                      {/* Decorative side bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        jadwal.jenis_tes === 'Tes Tulis' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                      
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800 text-lg">{jadwal.jenis_tes}</span>
                            {getStatusBadge(jadwal.status_jadwal)}
                          </div>
                          
                          <div className="space-y-1 text-sm text-slate-600">
                            <p className="flex items-center gap-2">
                              <span className="text-lg">🗓️</span>
                              {formatTanggalWaktu(jadwal.tanggal_tes, jadwal.jam_tes)}
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="text-lg">📍</span>
                              <span className="font-medium">{jadwal.lokasi}</span>
                            </p>
                          </div>
                        </div>

                        {/* Actions & Reschedule Info */}
                        <div className="flex flex-col items-start md:items-end justify-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          {activeReschedule ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-right max-w-xs w-full">
                              <p className="text-xs font-semibold text-amber-800 mb-1">Status Reschedule:</p>
                              <p className="text-sm font-bold text-amber-600">{activeReschedule.status_pengajuan}</p>
                              <p className="text-[10px] text-amber-700/70 mt-1 line-clamp-2" title={activeReschedule.alasan}>
                                Alasan: {activeReschedule.alasan}
                              </p>
                            </div>
                          ) : (
                            jadwal.status_jadwal === 'Terjadwal' && (
                              <button
                                onClick={() => openRescheduleModal(jadwal.id)}
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-sm font-medium px-4 py-2 rounded-lg border border-amber-200 transition-colors w-full md:w-auto"
                              >
                                Ajukan Reschedule
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Reschedule */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Ajukan Reschedule</h3>
              <button 
                onClick={() => setIsRescheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitReschedule} className="p-5 space-y-4">
              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg leading-relaxed">
                Pengajuan reschedule maksimal <strong>1 kali</strong> per jadwal dan harus disetujui oleh admin. Jika disetujui, jadwal lama akan dibatalkan.
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Alasan Reschedule</label>
                <textarea
                  value={alasanReschedule}
                  onChange={(e) => setAlasanReschedule(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none text-sm min-h-[100px] resize-none ${
                    rescheduleError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                  placeholder="Jelaskan alasan Anda tidak dapat hadir pada jadwal ini (min. 10 karakter)..."
                />
                {rescheduleError && <p className="text-xs text-red-600 mt-1">{rescheduleError}</p>}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsRescheduleModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500" disabled={submittingReschedule}>
                  {submittingReschedule ? 'Mengirim...' : 'Kirim Pengajuan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CekJadwal;
