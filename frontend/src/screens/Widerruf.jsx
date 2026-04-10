import React from 'react';
import { Link } from 'react-router-dom';

export default function Widerruf() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 bg-white shadow-sm my-10 rounded-[3.5rem] border border-slate-100 font-sans">
      <div className="mb-12 border-b border-slate-50 pb-10">
        <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.4em] mb-2 italic">Transparenz & Rückgabe</p>
        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-slate-900">
          Widerrufs<span className="text-cyan-600">belehrung</span>
        </h1>
        <p className="text-slate-400 mt-4 font-bold text-xs uppercase tracking-widest italic">Stand: April 2026</p>
      </div>

      <div className="space-y-12 text-slate-600 leading-relaxed text-sm font-medium">
        
        {/* 1. DAS RECHT */}
        <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-50">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">01</span> Widerrufsrecht
          </h2>
          <p>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. 
            Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
          </p>
        </section>

        {/* 2. AUSSCHLUSS */}
        <section className="bg-orange-50 p-10 rounded-[3rem] border-2 border-dashed border-orange-200 shadow-inner">
          <h2 className="text-xl font-black text-orange-900 uppercase tracking-tight mb-6 flex items-center gap-3 italic">
            <span className="bg-orange-200 text-orange-700 w-10 h-10 rounded-xl flex items-center justify-center not-italic">!</span> 
            Wichtiger Ausschluss
          </h2>
          <div className="space-y-4 text-orange-800 font-bold leading-relaxed">
            <p>
              Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die schnell verderben können oder deren Verfallsdatum schnell überschritten würde.
            </p>
            <p className="bg-white/50 p-4 rounded-2xl text-xs">
              Da der AfghanShop primär frische Lebensmittel und Spezialitäten vertreibt, ist eine Rückgabe dieser Produkte aus hygienischen Gründen ausgeschlossen.
            </p>
          </div>
        </section>

        {/* 3. AUSÜBUNG */}
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">02</span> Ausübung des Widerrufs
          </h2>
          <p className="mb-6">
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung informieren:
          </p>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <p className="font-black text-slate-900 uppercase">AfghanShop - Jawed REZAI</p>
            <p>Mozartstrasse 17/6, 5280 Braunau am Inn</p>
            <p>E-Mail: info@afghanshop.at</p>
            <p>Telefon: +43 690 10088854</p>
          </div>
        </section>

        {/* 4. FOLGEN */}
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">03</span> Folgen des Widerrufs
          </h2>
          <p>
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich zurückzuzahlen.
          </p>
        </section>

        {/* 5. RÜCKSENDEKOSTEN */}
        <section className="bg-slate-900 text-white p-10 rounded-[2.5rem] mt-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 font-black text-7xl italic">R</div>
          <h3 className="text-cyan-400 font-black text-xs uppercase tracking-[0.3em] mb-4">Rücksendung</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
          </p>
        </section>
      </div>

      <div className="mt-16 flex justify-center gap-6">
        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-all">
          ← Zurück zum Shop
        </Link>
        <button onClick={() => window.print()} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
          Seite Drucken
        </button>
      </div>
    </div>
  );
}