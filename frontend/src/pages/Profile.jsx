import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Profile() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const { data } = await api.get('/orders/mine');
        setOrders(data);
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden der Bestellungen:", err);
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [navigate, userInfo]);

  // FUNKTION FÜR RECHNUNGS-DOWNLOAD
  const downloadInvoice = async (orderId, invoiceNumber) => {
    try {
      const { data } = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung_RE-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Fehler beim Download der Rechnung.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500"></div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      {/* Header Bereich */}
      <div className="bg-white border-b border-slate-200 mb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white text-3xl font-black shadow-xl border-4 border-cyan-500">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <p className="text-cyan-500 font-black uppercase text-xs tracking-[0.3em] mb-1">Kundenprofil</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              {userInfo.name}
            </h1>
            <p className="text-slate-400 font-bold mt-1 text-sm lowercase tracking-widest">{userInfo.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">Meine Bestellungen</h2>
            <div className="bg-white px-6 py-2 rounded-full border border-slate-200 text-xs font-black text-slate-500 shadow-sm">
              {orders.length} EINKÄUFE
            </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-bold text-xl mb-6">Du hast noch keine Schätze bei uns gefunden.</p>
            <Link to="/" className="inline-block bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-500 transition-all shadow-lg">
              Jetzt Shoppen
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm hover:border-cyan-200 transition-all flex flex-col lg:flex-row items-center justify-between gap-6 group">
                
                {/* Order Meta */}
                <div className="flex items-center gap-6 w-full lg:w-auto">
                  <div className="bg-slate-50 p-5 rounded-3xl text-center min-w-[110px] group-hover:bg-cyan-50 transition-colors">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Datum</span>
                    <span className="font-black text-slate-900 text-sm">{new Date(order.createdAt).toLocaleDateString('de-DE')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.2em]">Referenz</span>
                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter">
                      RE-{order.invoiceNumber || order._id.slice(-6).toUpperCase()}
                    </h3>
                    <div className="flex gap-2 mt-2">
                       <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                         {order.isPaid ? 'Bezahlt' : 'Offen'}
                       </span>
                       <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${order.isDelivered ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                         {order.isDelivered ? 'Geliefert' : 'In Arbeit'}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                  <div className="text-right px-4">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Betrag</span>
                    <span className="font-black text-slate-900 text-2xl tracking-tighter">{order.totalPrice.toFixed(2)} €</span>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => downloadInvoice(order._id, order.invoiceNumber)}
                      className="bg-slate-100 text-slate-900 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                    >
                      📄 Rechnung
                    </button>
                    <button 
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="bg-slate-900 text-white px-7 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-md active:scale-95"
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
  );
}