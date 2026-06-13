import { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import { JENIS_TES_LIST, STATUS_JADWAL_LIST } from '../../constants';
import Button from '../ui/Button';

/**
 * TabelJadwalTes — Menampilkan daftar jadwal tes peserta untuk admin
 * Props: jadwalList, onUpdateStatus, onDelete
 */
const TabelJadwalTes = ({ jadwalList = [], onUpdateStatus, onDelete }) => {
  const [filterJenis, setFilterJenis] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const filteredList = useMemo(() => {
    return jadwalList.filter((j) => {
      const matchJenis = !filterJenis || j.jenis_tes === filterJenis;
      const matchStatus = !filterStatus || j.status_jadwal === filterStatus;
      const pendaftar = j.pendaftar || {};
      const matchSearch =
        !searchQuery ||
        (pendaftar.nama && pendaftar.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (pendaftar.nomor_pendaftaran && pendaftar.nomor_pendaftaran.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchJenis && matchStatus && matchSearch;
    });
  }, [jadwalList, filterJenis, filterStatus, searchQuery]);

  const selectClass =
    'px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] bg-white';

  const formatTanggal = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatJam = (timeStr) => {
    return timeStr.substring(0, 5); // Ambil HH:MM dari HH:MM:SS
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Cari nama atau nomor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
          />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className={selectClass}
          >
            <option value="">Semua Jenis Tes</option>
            {JENIS_TES_LIST.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={selectClass}
          >
            <option value="">Semua Status</option>
            {STATUS_JADWAL_LIST.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500">
          Menampilkan <span className="font-semibold text-slate-700">{filteredList.length}</span> jadwal
        </p>
      </div>

      {jadwalList.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-slate-500 font-medium">Belum ada jadwal tes yang dibuat</p>
        </div>
      )}

      {jadwalList.length > 0 && filteredList.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          Tidak ada jadwal yang sesuai dengan filter.
        </div>
      )}

      {filteredList.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Peserta</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jenis Tes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Waktu & Lokasi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((jadwal) => (
                  <tr key={jadwal.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{jadwal.pendaftar?.nama}</p>
                        <p className="text-xs text-slate-500 font-mono">{jadwal.pendaftar?.nomor_pendaftaran}</p>
                        <p className="text-xs text-blue-600 mt-0.5">{jadwal.pendaftar?.prodi}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${jadwal.jenis_tes === 'Tes Tulis' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {jadwal.jenis_tes}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800 font-medium">{formatTanggal(jadwal.tanggal_tes)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">⏱ {formatJam(jadwal.jam_tes)} WIB</p>
                      <p className="text-xs text-slate-500 mt-0.5">📍 {jadwal.lokasi}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={jadwal.status_jadwal}
                        disabled={processingId === jadwal.id}
                        onChange={async (e) => {
                          setProcessingId(jadwal.id);
                          await onUpdateStatus?.(jadwal.id, e.target.value);
                          setProcessingId(null);
                        }}
                        className={`text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 ${
                          jadwal.status_jadwal === 'Terjadwal' ? 'bg-white text-slate-700' :
                          jadwal.status_jadwal === 'Selesai' ? 'bg-green-50 text-green-700' :
                          'bg-red-50 text-red-700'
                        }`}
                      >
                        {STATUS_JADWAL_LIST.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={async () => {
                          if (confirm('Hapus jadwal ini?')) {
                            setProcessingId(jadwal.id);
                            await onDelete?.(jadwal.id);
                            setProcessingId(null);
                          }
                        }}
                        disabled={processingId === jadwal.id}
                        className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabelJadwalTes;
