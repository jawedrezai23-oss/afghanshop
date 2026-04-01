import React from 'react';
import { Link } from 'react-router-dom';

export default function VersandInfo() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 min-h-screen font-sans text-slate-900">
      <div className="text-center mb-16">
        <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.4em] mb-2 italic">Logistik & Lieferung</p>
        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
          Versand<span className="text-cyan-600">informationen</span>
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Standard Versand */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl grayscale group-hover:grayscale-0 transition-all">🇦🇹</div>
          <h2 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase tracking-tight">
            <span className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">📦</span> 
            Österreich weit
          </h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-cyan-200 transition-all">
              <div>
                <p className="font-black text-slate-900 uppercase text-xs">Bestellwert ab 60,00€</p>
                <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">Inkl. Versicherung & Tracking</p>
              </div>
              <span className="font-black text-emerald-500 text-xl italic uppercase tracking-tighter">Gratis</span>
            </div>

            <div className="flex justify-between items-center p-6 bg-white rounded-2xl border border-slate-100">
              <div>
                <p className="font-black text-slate-900 uppercase text-xs">Bestellwert unter 60,00€</p>
                <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">Standardversand</p>
              </div>
              <span className="font-black text-slate-900 text-xl italic uppercase tracking-tighter">4,99 €</span>
            </div>
          </div>
          
          <p className="mt-8 text-[11px] font-bold text-slate-400 leading-relaxed italic uppercase">
            * Wir versenden schnellstmöglich nach Zahlungseingang (Vorkasse oder Stripe). 
            Die Lieferzeit beträgt in der Regel 2-4 Werktage.
          </p>
        </div>

        {/* Local Service */}
        <div className="bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl border-b-8 border-cyan-500 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <h2 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase tracking-tight italic">
            <span className="bg-cyan-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-400/20 text-xl">🏠</span> 
            Braunau Lokal
          </h2>
          
          <div className="space-y-6 relative z-10">
            <p className="text-cyan-400 font-black text-xs uppercase tracking-widest italic">Brudi-Zustellung in deiner Nähe!</p>
            <p className="text-xl font-bold leading-tight">
              In <span className="text-cyan-500 font-black">Braunau am Inn</span> und Umgebung (ca. 20 km) liefere ich deine Ware <span className="underline decoration-cyan-500 underline-offset-4">persönlich</span> aus.
            </p>
            
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mt-6">
              <ul className="space-y-3 text-xs font-black uppercase tracking-widest text-slate-300">
                <li className="flex items-center gap-3"><span className="text-cyan-500">✔</span> Keine Versandkosten</li>
                <li className="flex items-center gap-3"><span className="text-cyan-500">✔</span> Express-Lieferung am selben Tag</li>
                <li className="flex items-center gap-3"><span className="text-cyan-500">✔</span> Barzahlung bei Übergabe möglich</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link to="/" className="inline-flex items-center gap-4 bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-cyan-500 transition-all shadow-xl hover:scale-105 active:scale-95">
          <span>←</span> Zurück zum Shop
        </Link>
      </div>
    </div>
  );
}