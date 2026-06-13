import { useState, useEffect } from 'react';
import AdminLogin from '../components/pmb/AdminLogin';
import TabelJadwalTes from '../components/pmb/TabelJadwalTes';
import FormJadwalTes from '../components/pmb/FormJadwalTes';
import TabelReschedule from '../components/pmb/TabelReschedule';
import { jadwalTesApi, rescheduleApi, authApi, removeToken, getToken } from '../utils/api';

/**
 * AdminJadwal — Halaman admin untuk mengelola jadwal tes dan reschedule
 */
const AdminJadwal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('jadwal'); // 'jadwal' atau 'reschedule'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [jadwalList, setJadwalList] = useState([]);
  const [rescheduleList, setRescheduleList] = useState([]);
  const [statistik, setStatistik] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = sessionStorage.getItem('pmb_admin_session');
    if (session === 'true' && getToken()) setIsLoggedIn(true);
  }, []);

  const fetchAllData = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError('');
    try {
      const [jadwalRes, reschedRes, statRes] = await Promise.all([
        jadwalTesApi.getAll(),
        rescheduleApi.getAll(),
        jadwalTesApi.statistik(),
      ]);
      setJadwalList(jadwalRes.data);
      setRescheduleList(reschedRes.data);
      setStatistik(statRes.data);
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
      } else {
        setError(err.message || 'Gagal memuat data. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* abaikan error */ }
    removeToken();
    sessionStorage.removeItem('pmb_admin_session');
    setIsLoggedIn(false);
  };

  const handleCreateSuccess = (newJadwal) => {
    setIsModalOpen(false);
    // Refresh all data
    fetchAllData();
  };

  const handleUpdateStatusJadwal = async (id, status) => {
    try {
      await jadwalTesApi.update(id, { status_jadwal: status });
      fetchAllData();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status jadwal');
    }
  };

  const handleDeleteJadwal = async (id) => {
    try {
      await jadwalTesApi.delete(id);
      fetchAllData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus jadwal');
    }
  };

  const handleApproveReschedule = async (id) => {
    try {
      await rescheduleApi.approve(id);
      fetchAllData();
    } catch (err) {
      alert(err.message || 'Gagal menyetujui reschedule');
    }
  };

  const handleRejectReschedule = async (id) => {
    try {
      await rescheduleApi.reject(id);
      fetchAllData();
    } catch (err) {
      alert(err.message || 'Gagal menolak reschedule');
    }
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header (reuse style Admin) */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-base">Manajemen Jadwal</h1>
              <p className="text-xs text-slate-400">Admin PMB 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-blue-600 hover:text-blue-700 transition-colors hidden sm:block font-medium">
              Data Pendaftar
            </a>
            <a href="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors hidden sm:block ml-2">
              ← Publik
            </a>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors ml-2"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stat cards */}
        {statistik && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">Total Jadwal</p>
              <p className="text-2xl font-bold mt-1 text-slate-800">{statistik.total}</p>
            </div>
            {statistik.per_jenis.map((stat) => (
              <div key={stat.jenis_tes} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500">{stat.jenis_tes}</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{stat.total}</p>
              </div>
            ))}
            <div className="bg-white border border-amber-200 bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-amber-700">Pending Reschedule</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">{statistik.pending_reschedule}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setActiveTab('jadwal')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'jadwal' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua Jadwal
            </button>
            <button
              onClick={() => setActiveTab('reschedule')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'reschedule' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Pengajuan Reschedule
              {statistik && statistik.pending_reschedule > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-xs">
                  {statistik.pending_reschedule}
                </span>
              )}
            </button>
          </div>
          
          {activeTab === 'jadwal' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Buat Jadwal Baru
            </button>
          )}
        </div>

        {/* Content area */}
        <div>
          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              Memuat data...
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {!loading && !error && activeTab === 'jadwal' && (
            <TabelJadwalTes 
              jadwalList={jadwalList} 
              onUpdateStatus={handleUpdateStatusJadwal}
              onDelete={handleDeleteJadwal}
            />
          )}

          {!loading && !error && activeTab === 'reschedule' && (
            <TabelReschedule 
              requestList={rescheduleList}
              onApprove={handleApproveReschedule}
              onReject={handleRejectReschedule}
            />
          )}
        </div>
      </div>

      {/* Modal Buat Jadwal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-slate-800">Buat Jadwal Tes Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <FormJadwalTes onSuccess={handleCreateSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJadwal;
