import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function AdminOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingData, setTrackingData] = useState({});
  
  // Statistiken Status
  const [stats, setStats] = useState({ totalSales: 0, pendingOrders: 0, totalOrders: 0, monthlySales: 0 });

  // --- HILFSFUNKTIONEN ---
  const cleanTextForPDF = (text) => {
    if (!text) return "Produkt";
    let cleaned = text.split('/')[0].trim();
    cleaned = cleaned
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
      .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue")
      .replace(/ß/g, "ss");
    return cleaned.replace(/[^a-zA-Z0-9\s\-\.\,]/g, "").trim() || "Produkt";
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
      
      // Statistiken berechnen
      const sales = data.filter(o => o.isPaid).reduce((acc, o) => acc + o.totalPrice, 0);
      const pending = data.filter(o => o.isPaid && !o.isDelivered).length;
      const currentMonth = new Date().getMonth();
      const monthly = data.filter(o => o.isPaid && new Date(o.createdAt).getMonth() === currentMonth)
                          .reduce((acc, o) => acc + o.totalPrice, 0);

      setStats({ totalSales: sales, pendingOrders: pending, totalOrders: data.length, monthlySales: monthly });
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Kombinierter Filter für Tabs + Suche
  useEffect(() => {
    let result = orders;
    if (filter === 'unpaid') result = result.filter(o => !o.isPaid);
    if (filter === 'to-ship') result = result.filter(o => o.isPaid && !o.isDelivered);
    
    if (searchTerm) {
      result = result.filter(o => 
        o.invoiceNumber?.toString().includes(searchTerm) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredOrders(result);
  }, [filter, orders, searchTerm]);

  const handlePayToggle = async (orderId) => {
    if (window.confirm("Zahlungsstatus manuell ändern?")) {
      try {
        await api.put(`/orders/${orderId}/pay-admin`);
        fetchOrders();
      } catch (err) { alert("Fehler!"); }
    }
  };

  const deliverHandler = async (orderId) => {
    const info = trackingData[orderId] || {};
    if (!info.trackingNumber || !info.carrier) return alert("Daten fehlen!");
    try {
      await api.put(`/orders/${orderId}/deliver`, { trackingNumber: info.trackingNumber, carrier: info.carrier });
      fetchOrders();
    } catch (err) { alert("Fehler!"); }
  };

  const quickDeliverHandler = async (orderId) => {
    if (window.confirm("Als Eigenzustellung / Abgeholt markieren?")) {
      try {
        await api.put(`/orders/${orderId}/deliver`, { carrier: "Eigenzustellung", trackingNumber: "Persönlich übergeben" });
        fetchOrders();
      } catch (err) { alert("Fehler!"); }
    }
  };

  const deleteOrderHandler = async (orderId) => {
    if (window.confirm("Wirklich LÖSCHEN?")) {
      try {
        await api.delete(`/orders/${orderId}`);
        fetchOrders(); 
      } catch (err) { alert("Fehler!"); }
    }
  };

  const generateInvoicePDF = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung_${orderId.slice(-6).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) { alert("PDF Fehler!"); }
  };

  const sendWhatsAppMessage = (order) => {
    const phone = order.shippingAddress?.phone || order.user?.phone;
    if (!phone) return alert("Keine Nummer!");
    const message = encodeURIComponent(`Hallo ${order.shippingAddress.fullName}, hier ist AfghanShop. Ihre Bestellung #${order.invoiceNumber || order._id.slice(-6).toUpperCase()} wird bearbeitet.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const printPackingSlip = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = order.orderItems.map(item => `<tr><td>${cleanTextForPDF(item.name)}</td><td style="text-align:center">${item.qty}</td></tr>`).join('');
    printWindow.document.write(`<html><head><title>Slip</title><style>body{font-family:sans-serif;padding:30px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #eee;padding:10px;text-align:left}</style></head><body><h2>Lieferschein #${order.invoiceNumber}</h2><p>${order.shippingAddress.fullName}</p><table><thead><tr><th>Art.</th><th>Menge</th></tr></thead><tbody>${itemsHtml}</tbody></table><script>window.print();window.close();</script></body></html>`);
    printWindow.document.close();
  };

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-400 animate-pulse">Lade System...</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header & Stats */}
      <div className="bg-white border-b p-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter italic">Order<span className="text-cyan-600">Master</span></h1>
              <div className="flex gap-4 mt-2">
                <input 
                  type="text" 
                  placeholder="Suche Name, RE-Nr..." 
                  className="bg-slate-100 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-cyan-500 outline-none w-64"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              {['all', 'unpaid', 'to-ship'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {f === 'all' ? 'Alle' : f === 'unpaid' ? 'Offen' : 'Versandbereit'}
                </button>
              ))}
            </div>
          </div>

          {/* --- STATISTIKEN AUS ORDERLIST --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
              <p className="text-[9px] font-black uppercase opacity-50 tracking-widest">Umsatz Gesamt</p>
              <h2 className="text-2xl font-black tracking-tighter">{stats.totalSales.toFixed(2)} €</h2>
            </div>
            <div className="bg-cyan-500 p-6 rounded-[2rem] text-white">
              <p className="text-[9px] font-black uppercase opacity-70 tracking-widest">Dieser Monat</p>
              <h2 className="text-2xl font-black tracking-tighter">{stats.monthlySales.toFixed(2)} €</h2>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem]">
              <p className="text-orange-500 text-[9px] font-black uppercase tracking-widest">Offene Pakete</p>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{stats.pendingOrders}</h2>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem]">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Bestellungen</p>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{stats.totalOrders}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Bestellliste */}
      <div className="max-w-7xl mx-auto px-6 mt-10 space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-xs">Keine Treffer</div>
        ) : filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* KUNDE */}
              <div className="lg:col-span-3">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">RE-{order.invoiceNumber || order._id.slice(-6).toUpperCase()}</span>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${order.isPaid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                    {order.isPaid ? 'Bezahlt' : 'Unbezahlt'}
                  </span>
                  <span className="text-[10px] font-black bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full uppercase">
                    {order.paymentMethod === 'Stripe' ? '💳 Stripe' : order.paymentMethod === 'Barzahlung' ? '💵 Bar' : '🏦 Bank'}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 uppercase text-lg leading-tight mb-1">{order.shippingAddress?.fullName}</h3>
                <p className="text-[11px] text-slate-500 font-bold mb-4">{new Date(order.createdAt).toLocaleString('de-DE')}</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[11px] text-slate-700 font-bold leading-relaxed">{order.shippingAddress?.address}, {order.shippingAddress?.postalCode} {order.shippingAddress?.city}</p>
                  <p className="text-[11px] text-cyan-600 font-black mt-2">📞 {order.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* ARTIKEL */}
              <div className="lg:col-span-3">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Warenkorb</p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] font-bold text-slate-700 border-b border-slate-50 pb-1">
                      <span className="truncate w-4/5">{item.qty}x {item.name}</span>
                      <span className="text-slate-400">{(item.price * item.qty).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{order.totalPrice.toFixed(2)}€</p>
                  </div>
                  {order.totalDeposit > 0 && <p className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">+{order.totalDeposit.toFixed(2)}€ Pfand</p>}
                </div>
              </div>

              {/* LOGISTIK */}
              <div className="lg:col-span-3">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Versandstatus</p>
                {!order.isDelivered && order.isPaid && (
                  <div className="space-y-2">
                    <input type="text" placeholder="Dienst (Post...)" className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500" 
                      onChange={(e) => setTrackingData({...trackingData, [order._id]: {...trackingData[order._id], carrier: e.target.value}})} />
                    <input type="text" placeholder="Sendungs-Nr." className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500" 
                      onChange={(e) => setTrackingData({...trackingData, [order._id]: {...trackingData[order._id], trackingNumber: e.target.value}})} />
                  </div>
                )}
                {order.isDelivered ? (
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-emerald-700">
                    <p className="text-[10px] font-black uppercase mb-1">✅ {order.carrier}</p>
                    <p className="text-[11px] font-bold break-all">{order.trackingNumber}</p>
                  </div>
                ) : (
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-orange-600">
                    <p className="text-[10px] font-black uppercase italic">Warten auf Versand</p>
                  </div>
                )}
              </div>

              {/* BUTTONS */}
              <div className="lg:col-span-3 grid grid-cols-2 gap-2">
                <button onClick={() => sendWhatsAppMessage(order)} className="bg-emerald-500 text-white text-[10px] font-black p-3 rounded-xl hover:bg-emerald-600 shadow-sm transition-all flex flex-col items-center gap-1"><span>WA</span><span className="text-[8px] opacity-70">CHAT</span></button>
                <button onClick={() => handlePayToggle(order._id)} className={`${order.isPaid ? 'bg-slate-100 text-slate-400' : 'bg-orange-500 text-white'} text-[10px] font-black p-3 rounded-xl shadow-sm transition-all flex flex-col items-center gap-1`}><span>{order.isPaid ? '❌' : '💰'}</span><span className="text-[8px] opacity-70">{order.isPaid ? 'STORN.' : 'PAY'}</span></button>
                {order.isPaid && !order.isDelivered && (
                  <>
                    <button onClick={() => quickDeliverHandler(order._id)} className="bg-cyan-500 text-white text-[10px] font-black p-3 rounded-xl shadow-sm transition-all flex flex-col items-center gap-1"><span>🚚</span><span className="text-[8px] opacity-70">HAUS</span></button>
                    <button onClick={() => deliverHandler(order._id)} className="bg-slate-900 text-white text-[10px] font-black p-3 rounded-xl shadow-sm transition-all flex flex-col items-center gap-1"><span>📦</span><span className="text-[8px] opacity-70">SEND</span></button>
                  </>
                )}
                <button onClick={() => generateInvoicePDF(order._id)} className="bg-slate-100 text-slate-700 text-[10px] font-black p-3 rounded-xl hover:bg-slate-200 transition-all flex flex-col items-center gap-1"><span>📄</span><span className="text-[8px] opacity-70">PDF</span></button>
                <button onClick={() => printPackingSlip(order)} className="bg-slate-100 text-slate-700 text-[10px] font-black p-3 rounded-xl hover:bg-slate-200 transition-all flex flex-col items-center gap-1"><span>🖨️</span><span className="text-[8px] opacity-70">SLIP</span></button>
                <button onClick={() => navigate(`/order/${order._id}`)} className="bg-slate-100 text-slate-700 text-[10px] font-black p-3 rounded-xl hover:bg-slate-200 transition-all flex flex-col items-center gap-1"><span>👁️</span><span className="text-[8px] opacity-70">INFO</span></button>
                <button onClick={() => deleteOrderHandler(order._id)} className="bg-red-50 text-red-500 text-[10px] font-black p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all flex flex-col items-center gap-1"><span>🗑️</span><span className="text-[8px] opacity-70">DEL</span></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}