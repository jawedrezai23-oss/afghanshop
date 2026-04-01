import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    sales: 0,
    cashSales: 0,      // Bar-Umsatz
    transferSales: 0,  // Überweisung/QR-Umsatz
    onlineSales: 0,    // Stripe/Karte
    orders: 0,
    products: 0,
    pending: 0,
    localOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products')
        ]);

        const orders = ordersRes.data;
        const products = productsRes.data;

        // --- DETAILLIERTE UMSATZ-ANALYSE ---
        let total = 0;
        let cash = 0;
        let transfer = 0;
        let online = 0;

        orders.forEach(o => {
          // Wir zählen nur Umsätze, die entweder bezahlt sind ODER Barzahlung sind
          if (o.isPaid || o.paymentMethod === 'Barzahlung' || o.paymentMethod === 'Überweisung') {
            total += o.totalPrice;
            
            if (o.paymentMethod === 'Barzahlung') {
              cash += o.totalPrice;
            } else if (o.paymentMethod === 'Überweisung' || o.paymentMethod === 'QR-Code') {
              transfer += o.totalPrice;
            } else {
              online += o.totalPrice; // Stripe, PayPal etc.
            }
          }
        });

        const pendingOrders = orders.filter(o => !o.isDelivered).length;

        const localCount = orders.filter(o =>
          o.shippingAddress?.postalCode?.startsWith('52') ||
          o.shippingAddress?.postalCode?.trim() === '4950'
        ).length;

        setStats({
          sales: total,
          cashSales: cash,
          transferSales: transfer,
          onlineSales: online,
          orders: orders.length,
          products: products.length,
          pending: pendingOrders,
          localOrders: localCount,
          recentOrders: orders.slice(0, 8) // Jetzt 8 für besseren Überblick
        });
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden der Statistiken:", err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500 mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Finanzen werden geprüft...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em] mb-2 italic">Finanz-Zentrale</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">
            Admin <span className="text-slate-300">Dashboard</span>
          </h1>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Status</span>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>

      {/* FINANZ-PANEL (NEU) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="relative z-10">
             <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">Gesamtumsatz</p>
             <h2 className="text-5xl font-black tracking-tighter">{stats.sales.toFixed(2)}€</h2>
           </div>
           <div className="absolute -right-4 -bottom-4 text-white/5 text-9xl font-black italic">SUM</div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
           <div className="flex justify-between items-start mb-4">
             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">💵 Barumsatz</p>
             <span className="text-xl">💰</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.cashSales.toFixed(2)}€</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Direkt kassiert</p>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
           <div className="flex justify-between items-start mb-4">
             <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-lg">🏦 Überweisung / QR</p>
             <span className="text-xl">📱</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.transferSales.toFixed(2)}€</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Bank / Vorauskasse</p>
        </div>
      </div>

      {/* WEITERE STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-xl">⏳</div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase">Offen</p>
            <p className="text-xl font-black text-slate-900">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-xl">📍</div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase">Bezirk</p>
            <p className="text-xl font-black text-slate-900">{stats.localOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-xl">📦</div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase">Produkte</p>
            <p className="text-xl font-black text-slate-900">{stats.products}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">🛒</div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase">Bestellungen</p>
            <p className="text-xl font-black text-slate-900">{stats.orders}</p>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-6 px-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-slate-200"></span> Letzte Aktivitäten
          </h2>
          <Link to="/admin/orders" className="text-[10px] font-black uppercase text-cyan-500 hover:underline">Alle sehen →</Link>
        </div>
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="p-6 text-[10px] font-black uppercase text-slate-400">Kunde</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400">Methode</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400">Summe</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400">Status</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400">Aktion</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <p className="text-slate-900">{order.shippingAddress?.fullName}</p>
                    <p className="text-[9px] text-slate-400 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] px-2 py-1 rounded-md font-black uppercase border ${
                      order.paymentMethod === 'Barzahlung' ? 'border-emerald-200 text-emerald-600' : 'border-cyan-200 text-cyan-600'
                    }`}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="p-6 text-slate-900">{order.totalPrice.toFixed(2)} €</td>
                  <td className="p-6">
                    <span className={`text-[9px] px-3 py-1 rounded-full uppercase font-black ${order.isDelivered ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {order.isDelivered ? 'Geliefert' : 'In Bearbeitung'}
                    </span>
                  </td>
                  <td className="p-6">
                    <Link to={`/order/${order._id}`} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all inline-block text-center pt-2">👁️</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/admin/products" className="group bg-slate-900 p-10 rounded-[3rem] text-white hover:bg-slate-800 transition-all shadow-2xl relative overflow-hidden">
          <h3 className="text-xl font-black mb-1 uppercase italic italic tracking-tighter">📦 Inventar</h3>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Produkte & Preise</p>
          <div className="absolute -right-4 -bottom-4 text-white/5 text-7xl font-black uppercase italic">Items</div>
        </Link>
        <Link to="/admin/orders" className="group bg-cyan-500 p-10 rounded-[3rem] text-white hover:bg-cyan-600 transition-all shadow-xl relative overflow-hidden">
          <h3 className="text-xl font-black mb-1 uppercase italic tracking-tighter">🚚 Logistik</h3>
          <p className="text-cyan-100 text-[9px] font-black uppercase tracking-widest">Bestellungen managen</p>
          <div className="absolute -right-4 -bottom-4 text-white/10 text-7xl font-black uppercase italic">Ship</div>
        </Link>
        <Link to="/admin/users" className="group bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-cyan-300 transition-all shadow-lg relative overflow-hidden">
          <h3 className="text-xl font-black mb-1 text-slate-900 uppercase italic tracking-tighter">👥 CRM</h3>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Kunden-Datenbank</p>
          <div className="absolute -right-4 -bottom-4 text-slate-50 text-7xl font-black uppercase italic">Users</div>
        </Link>
      </div>

    </div>
  );
}