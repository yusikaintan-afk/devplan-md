import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { JENIS_TES_LIST } from '../../constants';
import { jadwalTesApi } from '../../utils/api';

/**
 * FormJadwalTes — Form untuk membuat jadwal tes baru
 * Props: onSuccess (callback setelah sukses save)
 */
const FormJadwalTes = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    pendaftar_id: '',
    jenis_tes: '',
    tanggal_tes: '',
    jam_tes: '',
    lokasi: '',
  });

  const [eligiblePendaftars, setEligiblePendaftars] = useState([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const fetchEligible = async () => {
      setLoadingEligible(true);
      try {
        const res = await jadwalTesApi.getPendaftarEligible();
        setEligiblePendaftars(res.data);
      } catch (err) {
        setApiError('Gagal memuat daftar pendaftar yang eligible.');
      } finally {
        setLoadingEligible(false);
      }
    };
    fetchEligible();
  }, []);

  const validate = (data) => {
    const errs = {};
    if (!data.pendaftar_id) errs.pendaftar_id = 'Pilih pendaftar';
    if (!data.jenis_tes) errs.jenis_tes = 'Pilih jenis tes';
    if (!data.tanggal_tes) errs.tanggal_tes = 'Tentukan tanggal tes';
    if (!data.jam_tes) errs.jam_tes = 'Tentukan jam tes';
    if (!data.lokasi || data.lokasi.trim().length < 3) errs.lokasi = 'Lokasi minimal 3 karakter';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    try {
      const res = await jadwalTesApi.create({
        ...formData,
        pendaftar_id: parseInt(formData.pendaftar_id, 10),
      });
      onSuccess?.(res.data);
      // Reset form on success
      setFormData({
        pendaftar_id: '',
        jenis_tes: '',
        tanggal_tes: '',
        jam_tes: '',
        lokasi: '',
      });
    } catch (err) {
      if (err.errors) {
        const backendErrs = {};
        Object.keys(err.errors).forEach((key) => {
          backendErrs[key] = err.errors[key][0];
        });
        setErrors(backendErrs);
      } else {
        setApiError(err.message || 'Gagal menyimpan jadwal tes');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert for Input 'select' format
  const pendaftarOptions = eligiblePendaftars.map(p => ({
    value: p.id,
    label: `${p.nomor_pendaftaran} - ${p.nama} (${p.prodi})`
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Pilih Pendaftar (Status Lolos Seleksi)
        </label>
        {loadingEligible ? (
          <p className="text-sm text-slate-500 py-2">Memuat daftar pendaftar...</p>
        ) : (
          <select
            name="pendaftar_id"
            value={formData.pendaftar_id}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none bg-white min-h-[44px] ${
              errors.pendaftar_id ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
            }`}
          >
            <option value="">-- Pilih Pendaftar --</option>
            {pendaftarOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        {errors.pendaftar_id && <p className="text-xs text-red-600 mt-1">{errors.pendaftar_id}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Jenis Tes"
          name="jenis_tes"
          as="select"
          value={formData.jenis_tes}
          onChange={handleChange}
          error={errors.jenis_tes}
          options={JENIS_TES_LIST}
        />
        <Input
          label="Tanggal Tes"
          name="tanggal_tes"
          type="date"
          value={formData.tanggal_tes}
          onChange={handleChange}
          error={errors.tanggal_tes}
          min={new Date().toISOString().split('T')[0]} // tidak boleh hari berlalu
        />
        <Input
          label="Jam Tes"
          name="jam_tes"
          type="time"
          value={formData.jam_tes}
          onChange={handleChange}
          error={errors.jam_tes}
        />
        <Input
          label="Lokasi / Ruangan"
          name="lokasi"
          value={formData.lokasi}
          onChange={handleChange}
          error={errors.lokasi}
          placeholder="Contoh: Ruang CBT 1"
        />
      </div>

      {apiError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {apiError}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" disabled={isSubmitting || loadingEligible}>
          {isSubmitting ? 'Menyimpan...' : 'Buat Jadwal'}
        </Button>
      </div>
    </form>
  );
};

export default FormJadwalTes;
