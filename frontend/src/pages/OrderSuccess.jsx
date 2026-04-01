import { useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const OrderSuccess = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search);
  // Wir holen die ID entweder aus dem State oder aus der URL (Stripe Redirect)
  const orderId = location.state?.orderId || searchParams.get('orderId');
  const [order, setOrder] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (orderId) {
      api.get(`/orders/${orderId}`).then(({ data }) => setOrder(data))
    }
  }, [orderId])

  // PROFESSIONELLE RECHNUNGS-FUNKTION (Inkl. Pfand & Richtiger Nummer)
  const downloadInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(6, 182, 212); // Cyan
    doc.setFont("helvetica", "bold");
    doc.text("AFGHANSHOP", 105, 25, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Afghanische Spezialitäten - Mozartstrasse 17/6, 5280 Braunau", 105, 32, { align: "center" });

    // Rechnungs-Titel & Info
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("RECHNUNG", 20, 50);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Rechnungsnummer: RE-${order.invoiceNumber || order._id.slice(-6)}`, 20, 60);
    doc.text(`Datum: ${new Date(order.createdAt).toLocaleDateString('de-DE')}`, 20, 65);
    doc.text(`Zahlungsart: ${order.paymentMethod}`, 20, 70);

    // Tabellen-Inhalt vorbereiten
    const tableRows = order.orderItems.map(item => [
      item.name, 
      item.qty, 
      `${item.price.toFixed(2)} €`, 
      `${(item.qty * item.price).toFixed(2)} €`
    ]);

    // --- PFAND ALS EXTRA ZEILE ---
    const totalDeposit = order.orderItems.reduce((acc, item) => 
      acc + (item.isDeposit ? (item.depositValue * item.qty) : 0), 0
    );

    if (totalDeposit > 0) {
      tableRows.push([{ content: 'zzgl. Getränkepfand', colSpan: 3, styles: { fontStyle: 'italic', textColor: [249, 115, 22] } }, `${totalDeposit.toFixed(2)} €`]);
    }

    // Versandkosten
    if (order.shippingPrice > 0) {
      tableRows.push([{ content: 'Versandkosten', colSpan: 3 }, `${order.shippingPrice.toFixed(2)} €`]);
    }

    // Tabelle generieren
    doc.autoTable({ 
      startY: 80, 
      head: [['Produkt', 'Menge', 'Einzelpreis', 'Gesamt']], 
      body: tableRows, 
      headStyles: { fillColor: [6, 182, 212] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { font: "helvetica" }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Gesamtsumme Box
    doc.setFillColor(241, 245, 249);
    doc.rect(130, finalY - 8, 60, 15, 'F');
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${order.totalPrice.toFixed(2)} €`, 140, finalY);

    // Rechtlicher Hinweis
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120);
    doc.text("Hinweis: Gemäß Kleinunternehmerregelung (§ 19 UStG / § 6 Abs. 1 Z 27 UStG)", 20, finalY + 30);
    doc.text("wird keine Umsatzsteuer berechnet und ausgewiesen.", 20, finalY + 35);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 182, 212);
    doc.text("Vielen Dank für Ihren Einkauf!", 105, finalY + 55, { align: "center" });

    doc.save(`Rechnung_AfghanShop_${order.invoiceNumber || 'Order'}.pdf`);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Top Banner */}
        <div className="bg-cyan-500 p-12 text-center text-white relative">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Bestellung Läuft!</h1>
          <p className="text-cyan-50 font-bold opacity-90 uppercase text-xs tracking-widest">Vielen Dank für dein Vertrauen</p>
        </div>

        <div className="p-10 text-center">
          {order && (
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">Deine Rechnungsnummer</p>
              <div className="inline-block bg-slate-900 text-white px-8 py-3 rounded-2xl font-mono text-2xl font-black shadow-xl">
                RE-{order.invoiceNumber}
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-8 rounded-[2rem] border border-dashed border-slate-200 mb-10">
            <h2 className="text-sm font-black uppercase text-slate-800 mb-4">Wie geht es weiter?</h2>
            <div className="text-xs text-slate-500 space-y-3 font-bold uppercase leading-relaxed text-left max-w-xs mx-auto">
              <p className="flex items-center gap-3">
                <span className="w-5 h-5 bg-cyan-500 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                Bestellung wird geprüft
              </p>
              <p className="flex items-center gap-3">
                <span className="w-5 h-5 bg-cyan-500 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                Frische Ware wird verpackt
              </p>
              <p className="flex items-center gap-3">
                <span className="w-5 h-5 bg-cyan-500 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                Express-Zustellung startet
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/" className="bg-slate-100 text-slate-900 py-5 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
              Zurück zum Shop
            </Link>
            <button 
              onClick={downloadInvoice} 
              className="bg-cyan-500 text-white py-5 px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-cyan-200"
            >
              Rechnung Laden (PDF)
            </button>
          </div>
          
          <button 
            onClick={() => window.print()} 
            className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-cyan-500 transition-all"
          >
            Seite drucken
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess;