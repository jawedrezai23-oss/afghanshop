import React from 'react';

export default function Impressum() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 bg-white shadow-sm my-10 rounded-[3rem] border border-slate-100 font-sans">
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-10 italic">Impres<span className="text-cyan-600">sum</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-600">
        <div className="space-y-6">
          <div>
            <p className="font-black text-cyan-600 text-[10px] uppercase tracking-[0.2em] mb-2">Angaben gemäß § 5 TMG</p>
            <p className="text-xl font-black text-slate-900 leading-tight uppercase">
              AfghanShop<br />
              Jawed REZAI
            </p>
            <p className="mt-2 font-bold text-lg">
              Mozartstrasse 17/6<br />
              5280 Braunau am Inn, Österreich
            </p>
          </div>

          <div>
            <p className="font-black text-cyan-600 text-[10px] uppercase tracking-[0.2em] mb-2">Kontakt</p>
            <p className="font-bold text-slate-900 text-lg">
              Telefon: +43 690 10088854<br />
              E-Mail: afghanshop.braunau@gmail.com
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
          <p className="font-black text-slate-900 uppercase text-xs mb-4">Haftungsausschluss</p>
          <p className="text-[11px] leading-relaxed">
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. 
            Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich. 
            Die auf dieser Webseite bereitgestellten Informationen wurden sorgfältig geprüft und werden regelmäßig aktualisiert.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
          © {new Date().getFullYear()} AfghanShop Braunau - Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
}