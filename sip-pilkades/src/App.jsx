import React, { useState, useEffect } from 'react';
import { 
  Users, Vote, BarChart2, LogOut, Lock, User, 
  Plus, Edit2, Trash2, CheckCircle, Building, Award, 
  RefreshCw, Send
} from 'lucide-react';
import { supabase } from './supabaseClient';
import logoImage from './logo.png';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginRole, setLoginRole] = useState('admin');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  const [tpsList, setTpsList] = useState([
    { id: 1, name: 'TPS 01 - Banjar Kaja', dpt: 450, target_suara: 300, suara_masuk: 380, suara_sah: 370, suara_tidak_sah: 10, suara_kandidat: 240, status: 'Masuk', koordinator: 'Wayan Sudana', username: 'tps1', password: '123', catatan: 'Partisipasi tinggi, saksi lengkap.' },
    { id: 2, name: 'TPS 02 - Banjar Kelod', dpt: 500, target_suara: 350, suara_masuk: 420, suara_sah: 410, suara_tidak_sah: 10, suara_kandidat: 270, status: 'Masuk', koordinator: 'Made Merta', username: 'tps2', password: '123', catatan: 'Aman dan kondusif.' },
    { id: 3, name: 'TPS 03 - Banjar Tengah', dpt: 420, target_suara: 280, suara_masuk: 0, suara_sah: 0, suara_tidak_sah: 0, suara_kandidat: 0, status: 'Belum', koordinator: 'Nyoman Suardana', username: 'tps3', password: '123', catatan: 'Menunggu rekap akhir.' },
    { id: 4, name: 'TPS 04 - Banjar Puseh', dpt: 480, target_suara: 320, suara_masuk: 0, suara_sah: 0, suara_tidak_sah: 0, suara_kandidat: 0, status: 'Belum', koordinator: 'Ketut Astawa', username: 'tps4', password: '123', catatan: 'Persiapan penghitungan.' },
  ]);

  const [showTpsModal, setShowTpsModal] = useState(false);
  const [editingTps, setEditingTps] = useState(null);
  const [tpsForm, setTpsForm] = useState({ name: '', dpt: '', target_suara: '', koordinator: '', username: '', password: '' });

  useEffect(() => {
    fetchTpsData();
  }, []);

  const fetchTpsData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('tps_list').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        setTpsList(data);
      }
    } catch (err) {
      console.log('Menggunakan mode lokal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginRole === 'admin') {
      if (loginUsername === 'admin' && loginPassword === 'pilihdésa2026') {
        setCurrentUser({ username: 'admin', role: 'admin', name: 'Administrator Utama' });
        setActiveTab('dashboard');
      } else {
        setLoginError('Username atau password Admin salah! (Gunakan admin / pilihdésa2026)');
      }
    } else {
      const foundTps = tpsList.find(t => t.username === loginUsername && t.password === loginPassword);
      if (foundTps) {
        setCurrentUser({ username: foundTps.username, role: 'tps', tpsId: foundTps.id, name: `Petugas ${foundTps.name}` });
        setActiveTab('laporan');
      } else {
        setLoginError('Username atau password TPS tidak ditemukan!');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
  };

  const totalDPT = tpsList.reduce((acc, curr) => acc + Number(curr.dpt || 0), 0);
  const totalTarget = tpsList.reduce((acc, curr) => acc + Number(curr.target_suara || 0), 0);
  const totalSuaraSah = tpsList.reduce((acc, curr) => acc + Number(curr.suara_sah || 0), 0);
  const totalSuaraKandidat = tpsList.reduce((acc, curr) => acc + Number(curr.suara_kandidat || 0), 0);
  
  const tpsSelesaiCount = tpsList.filter(t => t.status === 'Masuk').length;
  const persentaseProgres = tpsList.length > 0 ? ((tpsSelesaiCount / tpsList.length) * 100).toFixed(1) : 0;
  const persentaseKemenangan = totalSuaraSah > 0 ? ((totalSuaraKandidat / totalSuaraSah) * 100).toFixed(1) : 0;
  const pencapaianTarget = totalTarget > 0 ? ((totalSuaraKandidat / totalTarget) * 100).toFixed(1) : 0;

  const handleSaveTps = async (e) => {
    e.preventDefault();
    if (editingTps) {
      const { error } = await supabase.from('tps_list').update(tpsForm).eq('id', editingTps.id);
      if (!error) {
        fetchTpsData();
      } else {
        setTpsList(tpsList.map(t => t.id === editingTps.id ? { ...t, ...tpsForm } : t));
      }
    } else {
      const newId = tpsList.length > 0 ? Math.max(...tpsList.map(t => t.id)) + 1 : 1;
      const newTpsEntry = { 
        id: newId, 
        ...tpsForm, 
        suara_masuk: 0, 
        suara_sah: 0, 
        suara_tidak_sah: 0, 
        suara_kandidat: 0, 
        status: 'Belum', 
        catatan: 'Belum ada laporan.' 
      };

      const { error } = await supabase.from('tps_list').insert([newTpsEntry]);
      if (!error) {
        fetchTpsData();
      } else {
        setTpsList([...tpsList, newTpsEntry]);
      }
    }
    setShowTpsModal(false);
    setEditingTps(null);
    setTpsForm({ name: '', dpt: '', target_suara: '', koordinator: '', username: '', password: '' });
  };

  const handleDeleteTps = async (id) => {
    if (confirm('Yakin ingin menghapus TPS ini?')) {
      const { error } = await supabase.from('tps_list').delete().eq('id', id);
      if (!error) {
        fetchTpsData();
      } else {
        setTpsList(tpsList.filter(t => t.id !== id));
      }
    }
  };

  const handleReportSubmit = async (e, tpsId) => {
    e.preventDefault();
    const form = e.target;
    const updatedPayload = {
      suara_masuk: Number(form.suara_masuk.value),
      suara_sah: Number(form.suara_sah.value),
      suara_tidak_sah: Number(form.suara_tidak_sah.value),
      suara_kandidat: Number(form.suara_kandidat.value),
      catatan: form.catatan.value,
      status: 'Masuk'
    };

    const { error } = await supabase.from('tps_list').update(updatedPayload).eq('id', tpsId);

    if (!error) {
      alert('Laporan suara TPS berhasil dikirim dan tersinkronisasi secara real-time!');
      fetchTpsData();
    } else {
      setTpsList(tpsList.map(t => t.id === tpsId ? { ...t, ...updatedPayload } : t));
      alert('Laporan tersimpan di memori lokal.');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 text-white text-center relative">
            <div className="mx-auto bg-white/15 w-28 h-28 rounded-full flex items-center justify-center mb-3 shadow-inner border border-white/30 overflow-hidden">
              <img src={logoImage} alt="Logo" className="w-full h-full object-contain p-2" />
            </div>
            <h1 className="text-2xl font-bold tracking-wide">PILKADES DESA</h1>
            <p className="text-emerald-200 text-sm mt-1">Kalkulator & Tabulasi Suara Timses</p>
            <div className="mt-3 inline-block bg-emerald-600/60 text-xs px-3 py-1 rounded-full border border-emerald-400/30">
              Kandidat No. 1: <strong className="text-white">I Kadek Indra Putra</strong>
            </div>
          </div>

          <div className="p-8">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => { setLoginRole('admin'); setLoginError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginRole === 'admin' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Admin Utama
              </button>
              <button 
                type="button"
                onClick={() => { setLoginRole('tps'); setLoginError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginRole === 'tps' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Petugas / Timses TPS
              </button>
            </div>

            {loginError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {loginRole === 'admin' ? 'Username Admin' : 'Username / Kode TPS'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder={loginRole === 'admin' ? "Contoh: admin" : "Contoh: tps1"}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm"
                  />
                </div>
              </div>

              {loginRole === 'admin' && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Info Login Admin:</span><br/>
                  Username: <code className="text-emerald-700 font-bold">admin</code> | Password: <code className="text-emerald-700 font-bold">pilihdésa2026</code>
                </div>
              )}

              {loginRole === 'tps' && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Info Akun TPS:</span><br/>
                  Gunakan username <code className="text-emerald-700 font-bold">tps1</code> s/d <code className="text-emerald-700 font-bold">tps4</code> dengan password <code className="text-emerald-700 font-bold">123</code>.
                </div>
              )}

              <button 
                type="submit"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <span>Masuk ke Sistem</span>
              </button>
            </form>
          </div>
          <div className="bg-slate-50 py-3 px-6 text-center text-xs text-slate-500 border-t border-slate-100">
            Sistem Tabulasi Suara Pemilu Desa © 2026
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-700 p-1.5 rounded-lg border border-emerald-600 shadow-inner flex items-center justify-center w-10 h-10 overflow-hidden">
              <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
                PILKADES DESA 
                <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded text-emerald-100 border border-emerald-500">No. Urut 1</span>
              </h1>
              <p className="text-xs text-emerald-200">Kandidat: I Kadek Indra Putra</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchTpsData}
              className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100 p-2 rounded-lg text-xs flex items-center space-x-1 border border-emerald-600"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-emerald-100">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-300 uppercase">{currentUser.role === 'admin' ? 'Administrator' : 'Petugas TPS'}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors border border-emerald-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        <div className="bg-emerald-900/60 border-t border-emerald-700/50">
          <div className="max-w-7xl mx-auto px-4 flex space-x-2 overflow-x-auto py-1">
            {currentUser.role === 'admin' && (
              <>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-white text-emerald-900 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Dashboard Real-Count</span>
                </button>
                <button 
                  onClick={() => setActiveTab('tps')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all whitespace-nowrap ${activeTab === 'tps' ? 'bg-white text-emerald-900 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}
                >
                  <Building className="w-4 h-4" />
                  <span>Manajemen & Pendaftaran TPS</span>
                </button>
              </>
            )}

            {currentUser.role === 'tps' && (
              <button 
                onClick={() => setActiveTab('laporan')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all whitespace-nowrap ${activeTab === 'laporan' ? 'bg-white text-emerald-900 shadow' : 'text-emerald-100 hover:bg-emerald-800'}`}
              >
                <Building className="w-4 h-4" />
                <span>Form Laporan Suara TPS Saya</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {currentUser.role === 'admin' && (
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-2 text-center md:text-left">
              <span className="bg-emerald-600/80 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
                Kandidat Unggulan • No. Urut 1
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">I Kadek Indra Putra</h2>
              <p className="text-emerald-100 text-sm max-w-xl">
                Tabulasi pemenangan berbasis laporan tim sukses internal TPS. Pantau perolehan suara secara real-time.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <div className="bg-black/25 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 text-center">
                <div className="text-xs text-emerald-200 uppercase font-semibold">Suara Masuk</div>
                <div className="text-xl font-bold mt-0.5">{totalSuaraKandidat} <span className="text-xs font-normal">suara</span></div>
              </div>
              <div className="bg-black/25 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 text-center">
                <div className="text-xs text-emerald-200 uppercase font-semibold">Persentase</div>
                <div className="text-xl font-bold mt-0.5 text-emerald-300">{persentaseKemenangan}%</div>
              </div>
              <div className="bg-black/25 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 text-center col-span-2 sm:col-span-1">
                <div className="text-xs text-emerald-200 uppercase font-semibold">Progres TPS</div>
                <div className="text-xl font-bold mt-0.5">{tpsSelesaiCount} / {tpsList.length} <span className="text-xs font-normal">({persentaseProgres}%)</span></div>
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'admin' && activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Total DPT Desa</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalDPT.toLocaleString()}</h3>
                </div>
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Users className="w-6 h-6" /></div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Target Suara Paslon 1</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{totalTarget.toLocaleString()}</h3>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Award className="w-6 h-6" /></div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Perolehan Suara Paslon 1</p>
                  <h3 className="text-2xl font-bold text-teal-700 mt-1">{totalSuaraKandidat.toLocaleString()}</h3>
                </div>
                <div className="bg-teal-50 text-teal-600 p-3 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Pencapaian Target</p>
                  <h3 className="text-2xl font-bold text-indigo-600 mt-1">{pencapaianTarget}%</h3>
                </div>
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl"><BarChart2 className="w-6 h-6" /></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-base">Grafik Progres Suara I Kadek Indra Putra</h3>
                <span className="text-xs font-semibold text-slate-500">{tpsSelesaiCount} dari {tpsList.length} TPS Telah Masuk</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(persentaseKemenangan, 100)}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-sm text-slate-600">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Total Suara Sah Masuk</span>
                  <strong className="text-lg text-slate-800">{totalSuaraSah.toLocaleString()}</strong> suara
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Suara Tidak Sah</span>
                  <strong className="text-lg text-slate-800">{tpsList.reduce((acc, c) => acc + Number(c.suara_tidak_sah || 0), 0).toLocaleString()}</strong> suara
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="block text-xs text-slate-400 font-semibold uppercase">Status Keunggulan</span>
                  <strong className="text-lg text-emerald-600">{persentaseKemenangan >= 50 ? 'Unggul Mutlak (>50%)' : 'Dalam Proses Penghitungan'}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Rekapitulasi Per TPS</h3>
                <button onClick={() => setActiveTab('tps')} className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1">
                  <span>Kelola TPS & Laporan</span> &rarr;
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="p-3">Nama TPS</th>
                      <th className="p-3">Koordinator</th>
                      <th className="p-3 text-center">DPT</th>
                      <th className="p-3 text-center">Target Suara</th>
                      <th className="p-3 text-center">Suara Paslon 1</th>
                      <th className="p-3 text-center">Suara Sah</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {tpsList.map((tps) => {
                      const persenTps = tps.suara_sah > 0 ? ((tps.suara_kandidat / tps.suara_sah) * 100).toFixed(1) : 0;
                      return (
                        <tr key={tps.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-semibold text-slate-900">{tps.name}</td>
                          <td className="p-3 text-slate-600">{tps.koordinator}</td>
                          <td className="p-3 text-center font-medium">{tps.dpt}</td>
                          <td className="p-3 text-center font-medium text-emerald-700">{tps.target_suara}</td>
                          <td className="p-3 text-center font-bold text-teal-800">{tps.suara_kandidat} <span className="text-[10px] text-slate-400 font-normal">({persenTps}%)</span></td>
                          <td className="p-3 text-center">{tps.suara_sah}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tps.status === 'Masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {tps.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'admin' && activeTab === 'tps' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Manajemen TPS & Pendaftaran Akun Timses</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tambah TPS baru, atur target suara, dan tentukan username serta password untuk koordinator TPS.</p>
              </div>

              <button 
                onClick={() => {
                  setEditingTps(null);
                  setTpsForm({ name: '', dpt: '', target_suara: '', koordinator: '', username: '', password: '' });
                  setShowTpsModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl shadow transition-all text-xs flex items-center space-x-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah TPS Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tpsList.map((tps) => (
                <div key={tps.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        ID TPS: {tps.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-1">{tps.name}</h4>
                      <p className="text-xs text-slate-500">Koordinator: <strong className="text-slate-700">{tps.koordinator}</strong></p>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => {
                          setEditingTps(tps);
                          setTpsForm({ name: tps.name, dpt: tps.dpt, target_suara: tps.target_suara, koordinator: tps.koordinator, username: tps.username, password: tps.password });
                          setShowTpsModal(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit TPS"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTps(tps.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus TPS"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">DPT</span>
                      <strong className="text-slate-800">{tps.dpt}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Paslon 1</span>
                      <strong className="text-emerald-700">{tps.target_suara}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Perolehan Masuk</span>
                      <strong className="text-teal-700">{tps.suara_kandidat}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                      Login Petugas: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-bold">{tps.username}</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{tps.password}</code>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tps.status === 'Masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {tps.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentUser.role === 'tps' && (
          <div className="space-y-6">
            {(() => {
              const myTps = tpsList.find(t => t.id === currentUser.tpsId);
              if (!myTps) return <div className="p-6 bg-white rounded-xl shadow-sm text-center text-slate-500">Data TPS tidak ditemukan.</div>;

              return (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 max-w-2xl mx-auto space-y-6">
                  <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 rounded-xl shadow-md space-y-2">
                    <span className="bg-emerald-600 text-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
                      Area Petugas / Saksi TPS
                    </span>
                    <h3 className="text-2xl font-extrabold">{myTps.name}</h3>
                    <p className="text-xs text-emerald-200">
                      Koordinator: <strong className="text-white">{myTps.koordinator}</strong> | DPT: {myTps.dpt} | Target Suara Paslon 1: {myTps.target_suara}
                    </p>
                  </div>

                  <form onSubmit={(e) => handleReportSubmit(e, myTps.id)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Total Pemilih Hadir (Suara Masuk)</label>
                        <input type="number" name="suara_masuk" defaultValue={myTps.suara_masuk} required min="0" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Total Suara Sah</label>
                        <input type="number" name="suara_sah" defaultValue={myTps.suara_sah} required min="0" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Total Suara Tidak Sah</label>
                        <input type="number" name="suara_tidak_sah" defaultValue={myTps.suara_tidak_sah} required min="0" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">Perolehan Suara No. 1 (I Kadek Indra Putra)</label>
                        <input type="number" name="suara_kandidat" defaultValue={myTps.suara_kandidat} required min="0" className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-emerald-900 font-bold text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Catatan / Keterangan Saksi / Kendala</label>
                      <textarea name="catatan" defaultValue={myTps.catatan} rows="3" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" placeholder="Tuliskan catatan kondisi di TPS..."></textarea>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all text-sm flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Kirim Laporan Rekapitulasi Suara</span>
                    </button>
                  </form>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {showTpsModal && currentUser.role === 'admin' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-800 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">{editingTps ? 'Edit TPS & Akun Timses' : 'Tambah TPS Baru'}</h3>
              <button onClick={() => setShowTpsModal(false)} className="text-emerald-200 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleSaveTps} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Nama TPS / Wilayah</label>
                <input type="text" required value={tpsForm.name} onChange={(e) => setTpsForm({...tpsForm, name: e.target.value})} placeholder="Contoh: TPS 05 - Banjar Anyar" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Jumlah DPT</label>
                  <input type="number" required min="1" value={tpsForm.dpt} onChange={(e) => setTpsForm({...tpsForm, dpt: e.target.value})} placeholder="450" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Target Suara Paslon 1</label>
                  <input type="number" required min="1" value={tpsForm.target_suara} onChange={(e) => setTpsForm({...tpsForm, target_suara: e.target.value})} placeholder="300" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Nama Koordinator / Saksi TPS</label>
                <input type="text" required value={tpsForm.koordinator} onChange={(e) => setTpsForm({...tpsForm, koordinator: e.target.value})} placeholder="Contoh: I Wayan Darma" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Username Login TPS</label>
                  <input type="text" required value={tpsForm.username} onChange={(e) => setTpsForm({...tpsForm, username: e.target.value})} placeholder="Contoh: tps5" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Password Login TPS</label>
                  <input type="text" required value={tpsForm.password} onChange={(e) => setTpsForm({...tpsForm, password: e.target.value})} placeholder="Contoh: 123" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm" />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowTpsModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow">Simpan TPS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
