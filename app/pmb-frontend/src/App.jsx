import Home from './pages/Home';
import Admin from './pages/Admin';
import AdminJadwal from './pages/AdminJadwal';

/**
 * App — root component yang menangani routing sederhana via window.location.pathname
 * /              → Home (halaman publik)
 * /admin         → Admin (dashboard admin pendaftar, butuh login)
 * /admin/jadwal  → AdminJadwal (dashboard admin jadwal tes, butuh login)
 */
const App = () => {
  const path = window.location.pathname;

  if (path === '/admin' || path === '/admin/') {
    return <Admin />;
  }
  
  if (path === '/admin/jadwal' || path === '/admin/jadwal/') {
    return <AdminJadwal />;
  }

  return <Home />;
};

export default App;
