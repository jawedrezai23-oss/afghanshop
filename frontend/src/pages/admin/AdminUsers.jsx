import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debugError, setDebugError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      // Wir holen die User-Liste
      const { data } = await api.get('/users', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      // OPTIONAL: Wenn dein Backend es unterstützt, könnten wir hier 
      // auch die Bestell-Anzahl pro User mitgeben. 
      const finalData = Array.isArray(data) ? data : data.users;
      setUsers(finalData || []);
      setLoading(false);
    } catch (err) {
      console.error("Fehler beim Laden der User:", err);
      setDebugError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm("Bist du sicher? Dieser User wird unwiderruflich gelöscht!")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Fehler beim Löschen des Users.");
      }
    }
  };

  const toggleAdminHandler = async (user) => {
    if (window.confirm(`Möchtest du die Rechte von ${user.name} wirklich ändern?`)) {
      try {
        await api.put(`/users/${user._id}`, {
          ...user,
          isAdmin: !user.isAdmin
        });
        fetchUsers();
      } catch (err) {
        alert("Fehler beim Aktualisieren der Rechte.");
      }
    }
  };

  const resetPasswordHandler = async (user) => {
    const newPassword = window.prompt(`Neues Passwort für ${user.name} eingeben:`, "Braunau2026!");
    if (newPassword) {
      try {
        await api.put(`/users/${user._id}`, {
          ...user,
          password: newPassword
        });
        alert(`Passwort für ${user.name} erfolgreich geändert!`);
      } catch (err) {
        alert("Fehler beim Passwort-Reset: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500 mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Kunden-Datenbank wird synchronisiert...</p>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & SUCHE */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em] mb-2 italic">User Management</p>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">
              Kunden <span className="text-slate-300">Datenbank</span>
            </h1>
          </div>
          
          <div className="w-full md:w-96 relative">
            <input 
              type="text" 
              placeholder="NAME, EMAIL ODER TELEFON..." 
              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-cyan-500 shadow-sm transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
          </div>
        </div>

        {/* STATS QUICK VIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Registrierte Kunden</p>
            <p className="text-3xl font-black text-slate-900">{users.length}</p>
          </div>
          <div className="bg-cyan-500 p-6 rounded-[2rem] shadow-lg shadow-cyan-200">
            <p className="text-[9px] font-black text-cyan-100 uppercase tracking-widest mb-1">Admins</p>
            <p className="text-3xl font-black text-white">{users.filter(u => u.isAdmin).length}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Neue User (24h)</p>
            <p className="text-3xl font-black text-slate-900">
              {users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 24*60*60*1000)).length}
            </p>
          </div>
        </div>

        {debugError && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-2xl text-xs font-bold border border-red-200 uppercase">
            ⚠️ API Fehler: {debugError}
          </div>
        )}

        {/* TABELLE */}
        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
                  <th className="p-10">Benutzer</th>
                  <th className="p-10">Kontakt & Adresse</th>
                  <th className="p-10 text-center">Status</th>
                  <th className="p-10 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="p-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:bg-cyan-500 transition-colors">
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{user.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase italic">Beitritt: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-10">
                      <p className="text-sm font-bold text-slate-600 mb-1">{user.email}</p>
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">
                          📞 {user.phone || 'KEINE NUMMER'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic truncate max-w-[200px]">
                          📍 {user.address ? `${user.address}, ${user.city}` : 'KEINE ADRESSE'}
                        </p>
                      </div>
                    </td>
                    <td className="p-10 text-center">
                      <button 
                        onClick={() => toggleAdminHandler(user)}
                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.isAdmin ? 'bg-cyan-50 text-cyan-600 border border-cyan-100 shadow-sm' : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'}`}
                      >
                        {user.isAdmin ? '🛡️ Admin' : '👤 Kunde'}
                      </button>
                    </td>
                    <td className="p-10 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {/* Passwort Reset Button */}
                        <button 
                          onClick={() => resetPasswordHandler(user)}
                          className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                          title="Passwort zurücksetzen"
                        >
                          🔑
                        </button>
                        {/* NEU: Button zu den Bestellungen dieses Users */}
                        <button 
                          onClick={() => navigate(`/admin/orders?user=${user._id}`)}
                          className="w-10 h-10 bg-cyan-50 text-cyan-500 rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
                          title="Bestellungen ansehen"
                        >
                          🛍️
                        </button>
                        <button 
                          onClick={() => deleteHandler(user._id)}
                          className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          title="Benutzer löschen"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(filteredUsers.length === 0 && !loading) && (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">Keine Kunden gefunden.</p>
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 flex justify-between items-center px-10">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Datenstand: {new Date().toLocaleDateString('de-DE')}
           </p>
           <div className="flex gap-2 items-center">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Cloud Sync</span>
           </div>
        </div>
      </div>
    </div>
  );
}