/**
 * api.js — helper untuk fetch ke Laravel API backend
 * Base URL diambil dari env variable atau default ke localhost:8000
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'pmb_admin_token';

/** Ambil token yang tersimpan di sessionStorage */
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
/** Simpan token ke sessionStorage */
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
/** Hapus token dari sessionStorage */
export const removeToken = () => sessionStorage.removeItem(TOKEN_KEY);

/**
 * Fetch wrapper dengan format response standar dari backend PMB
 * Menyertakan Bearer token jika tersedia
 */
const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.message || 'Terjadi kesalahan pada server');
    err.errors = json.errors || null;
    err.status = res.status;
    throw err;
  }
  return json;
};

export const authApi = {
  /** POST /api/auth/login */
  login: (username, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  /** POST /api/auth/logout */
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

export const pendaftarApi = {
  /** GET /api/pendaftar — ambil semua pendaftar (perlu token) */
  getAll: () => apiFetch('/pendaftar'),

  /** GET /api/pendaftar/{nomor} — cari berdasarkan nomor pendaftaran */
  getByNomor: (nomor) => apiFetch(`/pendaftar/${encodeURIComponent(nomor)}`),

  /** POST /api/pendaftar — daftar baru */
  store: (data) =>
    apiFetch('/pendaftar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** PATCH /api/pendaftar/{id}/status — ubah status (perlu token) */
  updateStatus: (id, status) =>
    apiFetch(`/pendaftar/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  /** POST /api/pendaftar/{nomor}/heregistrasi — heregistrasi mahasiswa lolos */
  heregistrasi: (nomor) =>
    apiFetch(`/pendaftar/${encodeURIComponent(nomor)}/heregistrasi`, {
      method: 'POST',
    }),
};

export const statistikApi = {
  /** GET /api/statistik — statistik per prodi, jalur, status (perlu token) */
  get: () => apiFetch('/statistik'),
};

/** URL langsung untuk download CSV (buka di tab baru dengan token di header tidak bisa — gunakan query param workaround) */
export const getExportCsvUrl = () =>
  `${BASE_URL}/pendaftar/export/csv`;

export const jadwalTesApi = {
  /** GET /api/jadwal-tes — ambil semua jadwal (admin) */
  getAll: () => apiFetch('/jadwal-tes'),

  /** POST /api/jadwal-tes — buat jadwal baru (admin) */
  create: (data) =>
    apiFetch('/jadwal-tes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** PUT /api/jadwal-tes/{id} — ubah jadwal (admin) */
  update: (id, data) =>
    apiFetch(`/jadwal-tes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** DELETE /api/jadwal-tes/{id} — hapus jadwal (admin) */
  delete: (id) =>
    apiFetch(`/jadwal-tes/${id}`, {
      method: 'DELETE',
    }),

  /** GET /api/jadwal-tes/peserta/{nomor} — cek jadwal berdasarkan nomor pendaftaran (publik) */
  getByNomor: (nomor) => apiFetch(`/jadwal-tes/peserta/${encodeURIComponent(nomor)}`),

  /** GET /api/jadwal-tes/statistik — statistik jadwal tes (admin) */
  statistik: () => apiFetch('/jadwal-tes/statistik'),

  /** GET /api/jadwal-tes/pendaftar-eligible — ambil daftar pendaftar yang lolos (admin) */
  getPendaftarEligible: () => apiFetch('/jadwal-tes/pendaftar-eligible'),
};

export const rescheduleApi = {
  /** GET /api/reschedule — daftar semua request reschedule (admin) */
  getAll: () => apiFetch('/reschedule'),

  /** POST /api/jadwal-tes/{id}/reschedule — ajukan reschedule (publik) */
  create: (jadwalId, alasan) =>
    apiFetch(`/jadwal-tes/${jadwalId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ alasan }),
    }),

  /** PATCH /api/reschedule/{id}/approve — setujui request (admin) */
  approve: (id) =>
    apiFetch(`/reschedule/${id}/approve`, {
      method: 'PATCH',
    }),

  /** PATCH /api/reschedule/{id}/reject — tolak request (admin) */
  reject: (id) =>
    apiFetch(`/reschedule/${id}/reject`, {
      method: 'PATCH',
    }),
};
