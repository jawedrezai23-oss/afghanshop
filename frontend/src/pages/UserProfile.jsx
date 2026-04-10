import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function UserProfile() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchProfileAndOrders = async () => {
      try {
        // Parallel abrufen für maximale Geschwindigkeit
        const [profileRes, ordersRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/orders/mine')
        ]);

        const user = profileRes.data;
        setName(user.name);
        setEmail(user.email);
        setAddress(user.address || '');
        setCity(user.city || '');
        setPostalCode(user.postalCode || '');
        setPhone(user.phone || '');

        // Sicherheitscheck: Verhindert Abstürze falls orders kein Array ist
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('userInfo');
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, [navigate, userInfoStr]); 

  const downloadInvoice = async (orderId, invoiceNumber) => {
    try {
      const { data } = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung_RE-${invoiceNumber || orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url); // Speicher wieder freigeben
    } catch (err) {
      alert("Fehler beim Herunterladen der Rechnung.");
    }
  };

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwörter stimmen nicht überein!' });
      return;
    }

    setUpdateLoading(true);
    setMessage(null);

    try {
      const { data } = await api.put('/users/profile', {
        name,
        email,
        password,
        address,
        city,
        postalCode,
        phone
      });
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert! ✅' });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || "Fehler beim Update" });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500"></div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      {/* HEADER BEREICH MIT AVATAR */}
      <div className="bg-white border-b border-slate-200 mb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-slate-200 border-4 border-cyan-500">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-cyan-500 font-black uppercase text-xs tracking-[0.3em] mb-1">Kundenkonto</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Hallo, <span className="text-slate-700">{name}</span>
            </h1>
            <p className="text-slate-400 font-bold mt-1 text-sm lowercase tracking-widest">{email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LINKER BEREICH: FORMULAR */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Meine Daten</h2>
            
            {message && (
                <div className={`p-4 mb-6 rounded-2xl font-bold text-xs uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={updateProfileHandler} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Vollständiger Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">E-Mail Adresse</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Neues Passwort</label>
                    <input 
                    type="password" 
                    placeholder="Optional"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Bestätigen</label>
                    <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                    />
                </div>
              </div>

              {/* ADRESS BEREICH */}
              <div className="pt-4 mt-4 border-t border-slate-50">
                <p className="text-[10px] font-black uppercase text-cyan-600 mb-4 tracking-widest">Lieferadresse</p>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Straße / Hausnummer" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="PLZ" 
                      value={postalCode} 
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                    />
                    <input 
                      type="text" 
                      placeholder="Stadt" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Telefonnummer" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={updateLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-500 transition-all shadow-xl disabled:opacity-50"
              >
                {updateLoading ? 'Speichert...' : 'Profil aktualisieren'}
              </button>
            </form>
          </div>
        </div>

        {/* RECHTER BEREICH: BESTELLHISTORIE */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Bestellhistorie</h2>
              <span className="bg-white px-4 py-1 rounded-full border border-slate-100 text-[10px] font-black text-slate-400">{orders.length} Bestellungen</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
              <p className="text-slate-400 font-bold text-xl mb-4">Noch keine Einkäufe getätigt.</p>
              <Link to="/" className="text-cyan-500 font-black uppercase text-xs tracking-widest hover:underline">Jetzt Shoppen gehen</Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm hover:border-cyan-100 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-slate-50 p-4 rounded-2xl text-center min-w-[100px]">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Datum</span>
                      <span className="font-black text-slate-900 text-sm">{new Date(order.createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.2em]">Referenz</span>
                      <h3 className="font-black text-slate-900 text-md uppercase">#{order.invoiceNumber || order._id.slice(-8)}</h3>
                      <div className="flex gap-2 mt-1">
                         <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                           {order.isPaid ? 'Bezahlt' : 'Offen'}
                         </span>
                         <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${order.isDelivered ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
                           {order.isDelivered ? 'Geliefert' : 'Bearbeitung'}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-right mr-4">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Gesamt</span>
                      <span className="font-black text-slate-900 text-xl tracking-tighter">{(order.totalPrice || 0).toFixed(2)} €</span>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={() => downloadInvoice(order._id, order.invoiceNumber)}
                            className="bg-slate-100 text-slate-900 px-4 py-3 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                            title="Rechnung PDF"
                        >
                            📄 PDF
                        </button>
                        <button 
                            /* WICHTIG: Navigiert zu /order/ID passend zur App.jsx */
                            onClick={() => navigate(`/order/${order._id}`)} 
                            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-cyan-500 transition-all"
                        >
                            Details
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}