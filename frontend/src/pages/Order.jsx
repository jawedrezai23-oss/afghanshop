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

  // User Info aus LocalStorage holen
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // FUNKTION: Rechnung vom Backend laden
  const downloadInvoice = async () => {
    setInvoiceLoading(true);
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const reNr = `Rechnung_RE-${order.invoiceNumber || orderId.slice(-6).toUpperCase()}.pdf`;
      link.setAttribute('download', reNr);
      document.body.appendChild(link);
      link.click();
      link.remove();
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

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 text-2xl animate-pulse uppercase">Lade Bestellung...</div>;
  if (!order) return <div className="p-20 text-center text-red-500 font-bold">FEHLER: BESTELLUNG NICHT GEFUNDEN</div>;

  // PFAND-BERECHNUNG
  const depositValue = order.totalDeposit > 0 
    ? order.totalDeposit 
    : order.orderItems.reduce((acc, item) => acc + (item.isDeposit ? (Number(item.depositValue) * item.qty) : 0), 0);

  const refCode = `RE-${order.invoiceNumber || order._id.slice(-6).toUpperCase()}`;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-[3.5rem] p-8 md:p-12 border border-slate-100 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Bestellübersicht</h1>
              <p className="text-cyan-500 font-black tracking-widest text-sm uppercase">NR: {order.invoiceNumber || order._id.slice(-6).toUpperCase()}</p>
              
              <div className="flex gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {order.isPaid ? `Bezahlt am ${new Date(order.paidAt).toLocaleDateString()}` : 'Nicht Bezahlt'}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.isDelivered ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                  {order.isDelivered ? `Geliefert am ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Versand ausstehend'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={downloadInvoice}
                disabled={invoiceLoading}
                className="bg-cyan-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 shadow-xl transition-all disabled:opacity-50"
              >
                {invoiceLoading ? 'LADE PDF...' : '📄 RECHNUNG LADEN'}
              </button>

              {userInfo && userInfo.isAdmin && !order.isDelivered && (
                <button
                  onClick={deliverHandler}
                  disabled={deliverLoading}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-600 shadow-xl transition-all disabled:opacity-50"
                >
                  {deliverLoading ? 'WIRD AKTUALISIERT...' : '🚚 ALS GELIEFERT MARKIEREN'}
                </button>
              )}
            </div>
          </div>

          {/* ZAHLUNGS-INFO BLOCK FÜR ÜBERWEISUNG */}
          {(order.paymentMethod === 'Überweisung' || order.paymentMethod === 'Sofortüberweisung') && !order.isPaid && (
            <div className="bg-slate-900 border-2 border-cyan-500/30 p-8 rounded-[3rem] mb-12 flex flex-col items-center text-center text-white shadow-2xl">
              <div className="bg-cyan-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Zahlungsinformationen</div>
              
              <p className="text-slate-300 font-bold text-sm mb-2 uppercase tracking-tight">Verwendungszweck:</p>
              <p className="bg-white/10 text-cyan-400 px-6 py-2 rounded-xl font-mono text-xl font-black border border-white/10 mb-6">
                {refCode}
              </p>

              {/* Dynamischer QR Code vom Backend */}
              {order.qrCode ? (
                <div className="bg-white p-4 rounded-[2.5rem] shadow-xl mb-6">
                  <img src={order.qrCode} alt="Zahlungs QR" className="w-48 h-48" />
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-6">QR-Code wird generiert...</p>
              )}

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Empfänger: Jawed REZAI</p>
                <p className="text-xs font-mono font-bold text-cyan-400">IBAN: IE49 SUMU 9903 6512 7681 45</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">BIC: SUMUIE22XXX</p>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-10">
            <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400 mb-6">Bestellte Artikel</h3>
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-50">
                <div className="flex flex-col">
                  <span className="font-black text-slate-700 uppercase text-sm leading-tight">{item.name.split('/')[0]}</span>
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Menge: {item.qty} x {item.price.toFixed(2)} €</span>
                </div>
                <span className="font-black text-slate-900 text-lg">{(item.qty * item.price).toFixed(2)} €</span>
              </div>
            ))}
            
            <div className="mt-12 flex flex-col items-end border-t-2 border-slate-50 pt-8 space-y-1">
              <div className="flex justify-between w-full max-w-[200px] text-slate-500 font-bold text-xs uppercase">
                <span>Zwischensumme:</span>
                <span>{order.itemsPrice.toFixed(2)} €</span>
              </div>

              {depositValue > 0 && (
                <div className="flex justify-between w-full max-w-[200px] text-orange-600 font-bold text-xs uppercase">
                  <span>zzgl. Getränkepfand:</span>
                  <span>{depositValue.toFixed(2)} €</span>
                </div>
              )}

              <div className="flex justify-between w-full max-w-[200px] text-slate-500 font-bold text-xs uppercase">
                <span>Versand:</span>
                <span>{order.shippingPrice.toFixed(2)} €</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-end">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Gesamtbetrag</p>
                <p className="text-6xl font-black text-slate-900 tracking-tighter">{order.totalPrice.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}