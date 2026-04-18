import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Order() {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliverLoading, setDeliverLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden der Bestellung:", err);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const downloadInvoice = async () => {
    setInvoiceLoading(true);
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const reNr = `Rechnung_RE-${order?.invoiceNumber || orderId.slice(-6).toUpperCase()}.pdf`;
      link.setAttribute('download', reNr);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setInvoiceLoading(false);
    } catch (err) {
      console.error("Fehler beim Laden der Rechnung:", err);
      alert("Fehler beim Laden der Rechnung vom Server.");
      setInvoiceLoading(false);
    }
  };

  const deliverHandler = async () => {
    setDeliverLoading(true);
    try {
      const { data } = await api.put(`/orders/${orderId}/deliver`);
      setOrder(data);
      setDeliverLoading(false);
      alert("Bestellung als geliefert markiert!");
    } catch (err) {
      setDeliverLoading(false);
      alert("Fehler beim Aktualisieren: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return (
    <div className="p-20 text-center font-bold text-slate-400 text-2xl animate-pulse uppercase">
      Bestellung wird geladen...
    </div>
  );

  if (!order) return (
    <div className="p-20 text-center text-red-500 font-bold uppercase tracking-widest">
      ❌ Fehler: Bestellung nicht gefunden
    </div>
  );

  const depositValue = order.totalDeposit > 0 
    ? order.totalDeposit 
    : order.orderItems.reduce((acc, item) => acc + (item.isDeposit ? (Number(item.depositValue) * item.qty) : 0), 0);

  const refCode = `RE-${order.invoiceNumber || order._id.slice(-6).toUpperCase()}`;

  // Logik für die Status-Timeline
  const statusSteps = [
    { label: 'Bestellt', done: true, date: order.createdAt },
    { label: 'Bezahlt', done: order.isPaid, date: order.paidAt },
    { label: 'Versendet', done: order.isDelivered, date: order.deliveredAt }, // Hier könnte man auch isShipped nutzen falls vorhanden
    { label: 'Geliefert', done: order.isDelivered, date: order.deliveredAt },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-16 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-[3rem] p-6 md:p-12 border border-slate-100 overflow-hidden">
          
          {/* HEADER SEKTION */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
            <div>
              <p className="text-cyan-500 font-black tracking-[0.2em] text-[10px] uppercase mb-1">Deine Bestellung</p>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">Details</h1>
              <p className="inline-block bg-slate-100 px-4 py-1 rounded-lg font-mono font-bold text-slate-600 text-sm italic">NR: {order.invoiceNumber}</p>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <button
                onClick={downloadInvoice}
                disabled={invoiceLoading}
                className="flex-1 md:flex-none bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 shadow-lg transition-all disabled:opacity-50"
              >
                {invoiceLoading ? 'WIRD ERSTELLT...' : '📄 RECHNUNG (PDF)'}
              </button>

              {userInfo?.isAdmin && !order.isDelivered && (
                <button
                  onClick={deliverHandler}
                  className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 shadow-lg transition-all"
                >
                  🚚 GELIEFERT MARKIEREN
                </button>
              )}
            </div>
          </div>

          {/* NEU: TRACKING & STATUS TIMELINE */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-12 border border-slate-100 shadow-inner">
             <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                {statusSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-md ${step.done ? 'bg-cyan-500 text-white' : 'bg-white text-slate-300 border-2 border-slate-200'}`}>
                      {step.done ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> : <span className="text-xs font-black">{index + 1}</span>}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</span>
                    {step.done && step.date && (
                      <span className="text-[9px] font-bold text-cyan-600 mt-1 uppercase opacity-70">{new Date(step.date).toLocaleDateString('de-DE')}</span>
                    )}
                  </div>
                ))}
             </div>

             {/* PAKETVERFOLGUNG (Falls trackingNumber existiert) */}
             {order.trackingNumber && (
               <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col items-center">
                  <div className="bg-white px-6 py-6 rounded-3xl shadow-sm border border-slate-100 w-full text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Sendungsverfolgung</p>
                    <p className="text-lg font-black text-slate-900 mb-4">{order.trackingNumber}</p>
                    <a 
                      href={`https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${order.trackingNumber}`}
                      target="_blank" rel="noreferrer"
                      className="bg-slate-900 text-white px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-600 transition-all inline-block"
                    >
                      📦 Paket verfolgen
                    </a>
                  </div>
               </div>
             )}
          </div>

          {/* ZAHLUNGS-INFO (Nur wenn unbezahlt) */}
          {(order.paymentMethod === 'Überweisung' || order.paymentMethod === 'Sofortüberweisung') && !order.isPaid && (
            <div className="bg-slate-900 border-2 border-cyan-500/30 p-8 rounded-[3rem] mb-12 flex flex-col items-center text-center text-white shadow-2xl animate-in fade-in zoom-in duration-500">
              <div className="bg-cyan-500 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 italic">Bezahlung ausstehend</div>
              
              <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] w-full max-w-xs mb-6">
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-2">Verwendungszweck</p>
                  <p className="text-cyan-400 font-mono text-2xl font-black mb-1">{refCode}</p>
                  <p className="text-[9px] text-slate-500 font-bold italic">IBAN: IE49 SUMU 9903 6512 7681 45</p>
              </div>

              {order.qrCode && (
                <div className="bg-white p-4 rounded-[2.5rem] shadow-xl mb-4">
                  <img src={order.qrCode} alt="Zahlungs QR" className="w-40 h-40" />
                </div>
              )}
              <p className="text-[9px] text-slate-400 font-bold italic uppercase tracking-widest mt-2">Scan für automatische Überweisung</p>
            </div>
          )}

          {/* ARTIKELLISTE */}
          <div className="space-y-4">
            <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 px-4">Deine Produkte</h3>
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-50 hover:border-cyan-100 transition-all">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-black text-slate-800 uppercase text-xs leading-tight">{item.name}</span>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">{item.qty} Stück x {item.price.toFixed(2)} €</span>
                  </div>
                </div>
                <span className="font-black text-slate-900 text-lg w-full md:w-auto text-right">{(item.qty * item.price).toFixed(2)} €</span>
              </div>
            ))}
          </div>

          {/* KOSTEN-ÜBERSICHT */}
          <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col items-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-slate-500 font-bold text-[10px] uppercase tracking-widest px-2">
                <span>Warenwert</span>
                <span>{order.itemsPrice.toFixed(2)} €</span>
              </div>
              {depositValue > 0 && (
                <div className="flex justify-between text-orange-500 font-black text-[10px] uppercase tracking-widest px-2">
                  <span>Getränkepfand</span>
                  <span>{depositValue.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 font-bold text-[10px] uppercase tracking-widest px-2">
                <span>Versand</span>
                <span className={order.shippingPrice === 0 ? "text-emerald-500 italic" : ""}>{order.shippingPrice === 0 ? "GRATIS" : `${order.shippingPrice.toFixed(2)} €`}</span>
              </div>
              <div className="mt-4 p-6 bg-slate-900 rounded-3xl text-right">
                <p className="text-cyan-400 font-black text-[10px] uppercase tracking-widest mb-1">Gesamtsumme</p>
                <p className="text-4xl font-black text-white tracking-tighter">{order.totalPrice.toFixed(2)} €</p>
              </div>
            </div>
          </div>

          {/* SUPPORT FOOTER */}
          <div className="mt-12 pt-10 border-t border-slate-50 text-center">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Fragen zu dieser Bestellung?</p>
             <a 
               href={`https://wa.me/4369010088854?text=Frage zur Bestellung ${refCode}`}
               target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 font-bold text-xs uppercase transition-all"
             >
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               Kundenservice kontaktieren
             </a>
          </div>

        </div>
      </div>
    </div>
  );
}