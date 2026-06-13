import { useState } from 'react';
import Button from '../ui/Button';

/**
 * TabelReschedule — Menampilkan daftar pengajuan reschedule untuk admin
 * Props: requestList, onApprove, onReject
 */
const TabelReschedule = ({ requestList = [], onApprove, onReject }) => {
  const [processingId, setProcessingId] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>;
      case 'Disetujui':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Disetujui</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const formatTanggalWaktu = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTanggalSaja = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {requestList.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📬</div>
          <p className="text-slate-500 font-medium">Belum ada pengajuan reschedule</p>
        </div>
      )}

      {requestList.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Waktu Pengajuan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Peserta</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jadwal Lama</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Alasan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requestList.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatTanggalWaktu(req.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{req.jadwal_tes?.pendaftar?.nama}</p>
                        <p className="text-xs text-slate-500 font-mono">{req.jadwal_tes?.pendaftar?.nomor_pendaftaran}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-800">{formatTanggalSaja(req.jadwal_tes?.tanggal_tes)}</p>
                      <p className="text-xs text-slate-500">{req.jadwal_tes?.jenis_tes}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-700 max-w-xs break-words">{req.alasan}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(req.status_pengajuan)}
                      {req.approver && (
                        <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[100px]">
                          oleh: {req.approver.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {req.status_pengajuan === 'Menunggu' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={async () => {
                              if (confirm('Setujui pengajuan ini? Jadwal lama akan dibatalkan.')) {
                                setProcessingId(req.id);
                                await onApprove?.(req.id);
                                setProcessingId(null);
                              }
                            }}
                            disabled={processingId === req.id}
                            className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded disabled:opacity-50 transition-colors"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Tolak pengajuan ini?')) {
                                setProcessingId(req.id);
                                await onReject?.(req.id);
                                setProcessingId(null);
                              }
                            }}
                            disabled={processingId === req.id}
                            className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded disabled:opacity-50 transition-colors"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Selesai</span>
                      )}
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

export default TabelReschedule;
