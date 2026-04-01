import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSales: 0, pendingOrders: 0, totalOrders: 0, monthlySales: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        
        // --- SORTIERUNG: NEUESTE ZUERST ---
        const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
        
        // --- STATISTIKEN BERECHNEN ---
        const sales = data
          .filter(order => order.isPaid)
          .reduce((acc, order) => acc + order.totalPrice, 0);
        
        const pending = data.filter(order => order.isPaid && !order.isDelivered).length;

        const currentMonth = new Date().getMonth();
        const monthlySales = data
          .filter(order => order.isPaid && new Date(order.createdAt).getMonth() === currentMonth)
          .reduce((acc, order) => acc + order.totalPrice, 0);
        
        setStats({
          totalSales: sales,
          pendingOrders: pending,
          totalOrders: data.length,
          monthlySales: monthlySales
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
        setLoading(false);
      }
    };

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.isAdmin) {
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // --- OPTIMIERTE SUCHFUNKTION (Inkl. Rechnungsnummer) ---
  const filteredOrders = orders.filter(order => 
    order.invoiceNumber?.toString().includes(searchTerm) ||
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.shippingAddress?.fullName && order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Bestell <span className="text-cyan-500">Überblick</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Finanzen & Status auf einen Blick</p>
        </div>
        
        <input 
          type="text"
          placeholder="RE-Nr, Name oder ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white border-2 border-slate-100 rounded-2xl px-6 py-3 text-sm font-bold focus:border-cyan-500 outline-none w-full md:w-80 transition-all shadow-sm"
        />
      </div>
      
      {/* --- STATISTIK KARTEN --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 text-center md:text-left">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 group hover:scale-[1.02] transition-transform">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Gesamtumsatz</p>
          <h2 className="text-3xl font-black text-white">{stats.totalSales.toFixed(2)} €</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:scale-[1.02] transition-transform">
          <p className="text-cyan-500 text-[10px] font-black uppercase tracking-widest mb-2">Dieser Monat</p>
          <h2 className="text-3xl font-black text-slate-900">{stats.monthlySales.toFixed(2)} €</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:scale-[1.02] transition-transform">
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-2">Offene Pakete</p>
          <h2 className="text-3xl font-black text-slate-900">{stats.pendingOrders}</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:scale-[1.02] transition-transform">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Bestellungen</p>
          <h2 className="text-3xl font-black text-slate-900">{stats.totalOrders}</h2>
        </div>
      </div>

      {/* --- TABELLE --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rechnung / Kunde</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Datum</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Summe</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Methode</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <div className="font-black text-slate-900 text-sm">
                      RE-{order.invoiceNumber || order._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-bold uppercase truncate w-40">
                      {order.shippingAddress?.fullName || 'Gast'}
                    </div>
                  </td>
                  <td className="p-6 text-xs font-bold text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="p-6 font-black text-slate-900 text-base">{order.totalPrice.toFixed(2)} €</td>
                  
                  {/* --- NEU: ZAHLUNGSMETHODE IN DER LISTE --- */}
                  <td className="p-6">
                    <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-2 py-1 rounded-lg uppercase">
                      {order.paymentMethod || 'Stripe'}
                    </span>
                  </td>

                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {order.isPaid ? 'Bezahlt' : 'Offen'}
                      </span>
                      <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.isDelivered ? 'bg-cyan-100 text-cyan-700' : 'bg-orange-100 text-orange-700'}`}>
                        {order.isDelivered ? 'Versendet' : 'Wartet'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => navigate(`/admin/order/${order._id}`)}
                      className="bg-slate-100 text-slate-900 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-cyan-500 hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      Bearbeiten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}