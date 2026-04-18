import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import QRCode from 'qrcode';

export default function PlaceOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Stripe'); 
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [nextInvoiceNum, setNextInvoiceNum] = useState(null);

  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};

  const isLocal = shippingAddress.postalCode && (
    shippingAddress.postalCode.startsWith('52') || 
    shippingAddress.postalCode.trim() === '4950'
  );

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  const totalDeposit = cartItems.reduce((acc, item) => 
    acc + (item.isDeposit ? (Number(item.depositValue) * item.qty) : 0), 0
  );

  const shippingPrice = isLocal ? 0 : (itemsPrice >= 40 ? 0 : 4.99);
  const totalPrice = itemsPrice + shippingPrice + totalDeposit;

  useEffect(() => {
    const fetchInvoiceNumber = async () => {
      try {
        const { data } = await api.get('/orders/next-number');
        setNextInvoiceNum(data.nextInvoiceNumber);
      } catch (err) {
        console.error("Fehler beim Laden der Rechnungsnummer", err);
      }
    };
    fetchInvoiceNumber();
  }, []);

  const refCode = nextInvoiceNum ? `RE-${nextInvoiceNum}` : 'RE-LÄDT...';

  useEffect(() => {
    const generateQR = async () => {
      if (paymentMethod === 'Überweisung' && nextInvoiceNum) {
        const iban = "IE49SUMU99036512768145"; 
        const bic = "SUMUIE22XXX"; 
        const name = "Jawed REZAI";
        const amount = totalPrice.toFixed(2);
        
        // --- KORRIGIERTE STRUKTUR FÜR DEN EPC-STANDARD ---
        // Wir nutzen ein Array und join('\n'), um exakt 11 Zeilenumbrüche zu haben.
        const qrData = [
          'BCD',              // 1. Service Tag
          '001',              // 2. Version
          '1',                // 3. Character Set (UTF-8)
          'SCT',              // 4. Identification
          bic,                // 5. BIC
          name,               // 6. Name
          iban,               // 7. IBAN
          `EUR${amount}`,     // 8. Betrag
          '',                 // 9. Purpose (leer)
          '',                 // 10. Structured Reference (MUSS LEER SEIN)
          refCode,            // 11. Unstructured Remittance (HIER LANDET DER VERWENDUNGSZWECK)
          ''                  // 12. Beneficiary Info (leer)
        ].join('\n');
        
        try {
          const url = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: { dark: '#000000', light: '#ffffff' }
          });
          setQrCodeUrl(url);
        } catch (err) {
          console.error("QR Code Fehler", err);
        }
      }
    };
    generateQR();
  }, [paymentMethod, totalPrice, refCode, nextInvoiceNum]);

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const placeOrderHandler = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: Number(item.qty),
          image: item.image,
          price: Number(item.price),
          oldPrice: item.oldPrice ? Number(item.oldPrice) : null,
          weight: item.weight ? Number(item.weight) : 0,
          unit: item.unit || 'g',
          product: item._id,
          isDeposit: item.isDeposit,
          depositValue: item.depositValue
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: Number(itemsPrice.toFixed(2)),
        shippingPrice: Number(shippingPrice.toFixed(2)),
        totalDeposit: Number(totalDeposit.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2))
      };

      const { data: createdOrder } = await api.post('/orders', orderData);

      if (paymentMethod === 'Stripe') {
        const { data: stripeSession } = await api.post('/orders/create-checkout-session', {
          items: cartItems,
          orderId: createdOrder._id,
          shippingPrice: shippingPrice 
        });
        if (stripeSession.url) window.location.href = stripeSession.url;
      } else {
        localStorage.removeItem('cartItems');
        window.dispatchEvent(new Event("cart-updated"));
        navigate(`/order/success?orderId=${createdOrder._id}`);
      }
    } catch (err) {
      alert("Fehler: " + (err.response?.data?.message || "Server Fehler"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
           <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center text-xl font-black italic shadow-sm">!</div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">
             Bestell<span className="text-cyan-600">übersicht</span>
           </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight mb-6">Zahlungsart wählen</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div onClick={() => setPaymentMethod('Stripe')} className={`cursor-pointer p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'Stripe' ? 'border-cyan-500 bg-cyan-50 shadow-md' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}>
                  <span className="text-2xl">💳</span>
                  <p className="font-black text-slate-900 mt-2">Online</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Stripe / Karte</p>
                </div>

                <div onClick={() => setPaymentMethod('Überweisung')} className={`cursor-pointer p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'Überweisung' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}>
                  <span className="text-2xl">📱</span>
                  <p className="font-black text-slate-900 mt-2">Überweisung</p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider italic">QR-Code Scan</p>
                </div>

                {isLocal && (
                  <div onClick={() => setPaymentMethod('Barzahlung')} className={`cursor-pointer p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'Barzahlung' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}>
                    <span className="text-2xl">💵</span>
                    <p className="font-black text-slate-900 mt-2">Barzahlung</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider italic">Bei Zustellung</p>
                  </div>
                )}
              </div>

              {paymentMethod === 'Überweisung' && qrCodeUrl && (
                <div className="mt-8 p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col items-center animate-fade-in border-2 border-blue-500/30 shadow-2xl">
                  <div className="bg-blue-500/10 text-blue-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">Sicher & Schnell Überweisen</div>
                  <div className="bg-white p-4 rounded-3xl">
                    <img src={qrCodeUrl} alt="Zahlung QR Code" className="w-44 h-44" />
                  </div>
                  <div className="mt-8 text-center space-y-4 w-full max-w-sm">
                    <div className="py-4 px-6 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1 italic">Verwendungszweck für deine App</p>
                      <p className="text-sm font-mono font-bold tracking-wider select-all text-white bg-blue-600/20 py-1 px-3 rounded-lg border border-blue-500/30 inline-block">{refCode}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-2">IBAN: IE49 SUMU 9903 6512 7681 45</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem]">
                      <p className="text-emerald-400 text-sm font-black uppercase tracking-tighter mb-2">🚀 Turbo-Versand gefällig?</p>
                      <p className="text-xs text-slate-300 leading-relaxed">Schicke uns einen **Screenshot der Überweisung** mit dem Code <span className="text-white font-bold">{refCode}</span> per WhatsApp!</p>
                      <a 
                        href={`https://wa.me/4369010088854?text=Hallo Jawed! 👋 Ich habe gerade ${totalPrice.toFixed(2)}€ überwiesen. Referenz: ${refCode}. Hier ist mein Beleg!`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-4 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                      >
                        📸 Screenshot per WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* ... Rest der Produktanzeige bleibt gleich ... */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black uppercase tracking-tight mb-6">Deine Auswahl</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-6 py-4 border-b border-slate-50 last:border-0">
                    <img src={item.image?.startsWith('http') ? item.image : `http://localhost:5001${item.image}`} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-slate-50 shadow-sm" />
                    <div className="flex-grow">
                      <h4 className="font-black text-slate-900">{item.name}</h4>
                      <p className="text-xs font-bold text-slate-500">
                        {item.weight ? `${item.weight}${item.unit || 'g'}` : ''}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase">{item.qty} Stück á {item.price.toFixed(2)} €</p>
                      {item.isDeposit && <p className="text-[10px] font-black text-orange-500 uppercase mt-1">+ {(item.depositValue * item.qty).toFixed(2)} € Pfand</p>}
                    </div>
                    <div className="font-black text-slate-900">{(item.qty * item.price).toFixed(2)} €</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl sticky top-24 border-b-8 border-cyan-500 overflow-hidden">
              <h3 className="text-cyan-400 uppercase text-[10px] font-black tracking-[0.3em] mb-8 text-center">Zusammenfassung</h3>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <span>Warenwert</span>
                  <span className="text-white text-lg font-black">{itemsPrice.toFixed(2)} €</span>
                </div>
                {totalDeposit > 0 && (
                  <div className="flex justify-between items-center text-orange-400 font-bold text-xs uppercase tracking-widest">
                    <span>Gesamtpfand</span>
                    <span className="text-lg font-black">{totalDeposit.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <span>Versand</span>
                  <span className={shippingPrice === 0 ? "text-cyan-400 font-black italic" : "text-white text-lg font-black"}>{shippingPrice === 0 ? "GRATIS" : `${shippingPrice.toFixed(2)} €`}</span>
                </div>
                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                  <span className="font-black text-xs uppercase tracking-[0.2em] text-cyan-400">Total</span>
                  <span className="text-4xl font-black tracking-tighter text-white">{totalPrice.toFixed(2)} €</span>
                </div>
              </div>
              <button onClick={placeOrderHandler} disabled={cartItems.length === 0 || loading} className="w-full bg-cyan-500 py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all shadow-xl disabled:bg-slate-700">
                {loading ? 'Wird verarbeitet...' : 'Bestellung abschließen'}
              </button>
              <p className="mt-6 text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest italic">Sichere Verschlüsselung 🔒</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}