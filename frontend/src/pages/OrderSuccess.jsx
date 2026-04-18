import { useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const OrderSuccess = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search);
  const orderId = location.state?.orderId || searchParams.get('orderId');
  const [order, setOrder] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (orderId) {
      api.get(`/orders/${orderId}`).then(({ data }) => setOrder(data))
    }
  }, [orderId])

  // PROFESSIONELLE RECHNUNGS-FUNKTION (PDF)
  const downloadInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(6, 182, 212);
    doc.setFont("helvetica", "bold");
    doc.text("AFGHANSHOP", 105, 25, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Afghanische Spezialitäten - Mozartstrasse 17/6, 5280 Braunau", 105, 32, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("RECHNUNG", 20, 50);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Rechnungsnummer: RE-${order.invoiceNumber}`, 20, 60);
    doc.text(`Datum: ${new Date(order.createdAt).toLocaleDateString('de-DE')}`, 20, 65);
    doc.text(`Zahlungsart: ${order.paymentMethod}`, 20, 70);

    const tableRows = order.orderItems.map(item => [
      item.name, 
      item.qty, 
      `${item.price.toFixed(2)} €`, 
      `${(item.qty * item.price).toFixed(2)} €`
    ]);

    const totalDeposit = order.totalDeposit || 0;
    if (totalDeposit > 0) {
      tableRows.push([{ content: 'zzgl. Getränkepfand', colSpan: 3, styles: { fontStyle: 'italic', textColor: [249, 115, 22] } }, `${totalDeposit.toFixed(2)} €`]);
    }

    if (order.shippingPrice > 0) {
      tableRows.push([{ content: 'Versandkosten', colSpan: 3 }, `${order.shippingPrice.toFixed(2)} €`]);
    }

    doc.autoTable({ 
      startY: 80, 
      head: [['Produkt', 'Menge', 'Einzelpreis', 'Gesamt']], 
      body: tableRows, 
      headStyles: { fillColor: [6, 182, 212] },
      styles: { font: "helvetica" }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(241, 245, 249);
    doc.rect(130, finalY - 8, 60, 15, 'F');
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${order.totalPrice.toFixed(2)} €`, 140, finalY);

    doc.save(`Rechnung_AfghanShop_${order.invoiceNumber}.pdf`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-2xl rounded-[3.5rem] overflow-hidden border border-slate-100">
          
          {/* Top Banner */}
          <div className="bg-cyan-500 p-10 text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-1 italic">Bestellung erhalten!</h1>
            <p className="text-cyan-50 font-bold opacity-90 uppercase text-[10px] tracking-widest">Vielen Dank für deinen Einkauf</p>
          </div>

          <div className="p-8 md:p-12 text-center">
            {order && (
              <>
                {/* ZAHLUNGS-INFO BLOCK (Wie im Screenshot) */}
                {(order.paymentMethod === 'Überweisung' || order.paymentMethod === 'Sofortüberweisung') && !order.isPaid && (
                  <div className="bg-slate-900 border-2 border-cyan-500/30 p-8 rounded-[3rem] mb-10 flex flex-col items-center text-center text-white shadow-2xl">
                    <div className="bg-cyan-500 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 italic">Sicher & Schnell Überweisen</div>
                    
                    {order.qrCode ? (
                      <div className="bg-white p-4 rounded-[2.5rem] shadow-xl mb-6">
                        <img src={order.qrCode} alt="Zahlungs QR" className="w-40 h-40" />
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6 border border-white/10 italic text-slate-500 text-xs">QR wird geladen...</div>
                    )}

                    <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] w-full max-w-xs mb-6">
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-2">Verwendungszweck für deine App</p>
                        <p className="text-cyan-400 font-mono text-xl font-black mb-1">RE-{order.invoiceNumber}</p>
                        <p className="text-[9px] text-slate-500 font-bold italic">IBAN: IE49 SUMU 9903 6512 7681 45</p>
                    </div>

                    {/* TURBO VERSAND WHATSAPP */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2.5rem] w-full max-w-sm">
                        <h3 className="text-emerald-400 font-black text-xs uppercase tracking-tighter mb-2">🚀 Turbo-Versand gefällig?</h3>
                        <p className="text-[10px] text-slate-300 font-medium mb-4 leading-relaxed">
                            Schicke uns einen **Screenshot der Überweisung** mit dem Code <strong>RE-{order.invoiceNumber}</strong> per WhatsApp!
                        </p>
                        <a 
                          href={`https://wa.me/4367761125211?text=Hallo AfghanShop, hier ist der Beleg für meine Bestellung RE-${order.invoiceNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                          📸 Screenshot per WhatsApp
                        </a>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-10">
                  <h2 className="text-xs font-black uppercase text-slate-800 mb-6 tracking-widest">Deine Bestellung im Überblick</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                        <span>Status:</span>
                        <span className="text-cyan-600">In Bearbeitung</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                        <span>Summe:</span>
                        <span className="text-slate-900">{order.totalPrice.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/" className="bg-slate-100 text-slate-900 py-5 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                Weiter Einkaufen
              </Link>
              <button 
                onClick={downloadInvoice} 
                className="bg-cyan-500 text-white py-5 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-cyan-100"
              >
                📄 Rechnung (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess;