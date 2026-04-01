import React from 'react';
import { Link } from 'react-router-dom';

export default function AGB() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 bg-white shadow-sm my-10 rounded-[3.5rem] border border-slate-100 font-sans selection:bg-cyan-100">
      <div className="mb-12 border-b border-slate-50 pb-10">
        <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em] mb-2 italic">Rechtliches Fundament</p>
        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-slate-900">
          Allgemeine <span className="text-cyan-600">Geschäftsbedingungen</span>
        </h1>
        <p className="text-slate-400 mt-4 font-bold text-xs uppercase tracking-widest italic">Stand: April 2026</p>
      </div>

      <div className="space-y-12 text-slate-600 leading-relaxed">
        
        {/* §1 GELTUNGSBEREICH */}
        <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-50 hover:border-cyan-100 transition-all">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">§1</span> Geltungsbereich
          </h2>
          <p className="text-sm font-medium">
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen über den Online-Shop <span className="font-black text-slate-800">AfghanShop</span>. 
            Vertragspartner ist Jawed REZAI, Mozartstrasse 17/6, 5280 Braunau am Inn, Österreich. 
            Mit der Abgabe einer Bestellung erklärt sich der Kunde mit diesen AGB einverstanden.
          </p>
        </section>

        {/* §2 VERTRAGSSCHLUSS */}
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">§2</span> Vertragsschluss
          </h2>
          <p className="text-sm font-medium">
            Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot dar, sondern einen unverbindlichen Online-Katalog. 
            Durch Anklicken des Buttons <span className="font-bold text-slate-800">[Bestellung abschließen]</span> geben Sie eine verbindliche Bestellung der im Warenkorb enthaltenen Waren ab. 
            Die Bestätigung des Eingangs der Bestellung erfolgt unmittelbar nach dem Absenden der Bestellung per E-Mail.
          </p>
        </section>

        {/* §3 PREISE, STEUER & PFAND */}
        <section className="bg-cyan-50/30 p-8 rounded-[2.5rem] border border-cyan-100">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-600 italic">§3</span> Preise, Steuer & Pfand
          </h2>
          <p className="text-sm font-medium mb-4">
            Die angegebenen Preise sind Endpreise. Gemäß der <span className="font-bold italic text-slate-800">Kleinunternehmerregelung</span> (§ 19 UStG / § 6 Abs. 1 Z 27 UStG) wird keine Umsatzsteuer berechnet oder ausgewiesen.
          </p>
          <p className="text-sm font-medium">
            Zusätzlich zum Produktpreis wird bei entsprechenden Artikeln (z.B. Getränkeflaschen) ein <span className="font-bold text-orange-600 uppercase">Pfandwert</span> erhoben. Dieser wird im Warenkorb und auf der Rechnung separat ausgewiesen.
          </p>
        </section>

        {/* §4 ZAHLUNG & EIGENTUMSVORBEHALT */}
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">§4</span> Zahlung & Eigentum
          </h2>
          <p className="text-sm font-medium mb-4">
            Wir bieten folgende Zahlungsarten an: 
            <span className="font-bold text-slate-800"> Stripe (Kreditkarte/Online), Banküberweisung (Vorkasse)</span> und bei lokaler Zustellung <span className="font-bold text-slate-800">Barzahlung</span>.
          </p>
          <p className="text-sm font-medium">
            Die gelieferte Ware bleibt bis zur vollständigen Bezahlung im Eigentum des AfghanShops. Bei Vorkasse erfolgt der Versand erst nach vollständigem Zahlungseingang auf unser Konto.
          </p>
        </section>

        {/* §5 LIEFERUNG & BRAUNAU-SERVICE */}
        <section className="border-l-4 border-cyan-500 pl-8 py-2">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">§5</span> Versand & Lokale Zustellung
          </h2>
          <p className="text-sm font-medium mb-4">
            Der Versand erfolgt innerhalb Österreichs. Die Versandkosten werden im Bestellprozess ausgewiesen. Ab einem Warenwert von <span className="font-black text-cyan-600">60,00 €</span> erfolgt der Versand versandkostenfrei.
          </p>
          <p className="text-sm font-black italic text-slate-800">
            Besonderheit Braunau: Im Umkreis von ca. 20 km (PLZ 5280, 4950 etc.) bieten wir eine persönliche Zustellung an. Hierbei entfallen die Versandkosten unabhängig vom Bestellwert.
          </p>
        </section>

        {/* §6 GEWÄHRLEISTUNG */}
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">§6</span> Gewährleistung & Frische
          </h2>
          <p className="text-sm font-medium leading-relaxed">
            Es gelten die gesetzlichen Gewährleistungsrechte. Da wir teilweise mit frischen Lebensmitteln handeln, bitten wir den Kunden, die Ware unmittelbar nach Erhalt auf Mängel oder Vollständigkeit zu prüfen. 
            Mängelansprüche bei verderblichen Waren müssen unverzüglich gemeldet werden.
          </p>
        </section>

        {/* SCHLUSSBESTIMMUNG */}
        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] mt-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 font-black text-7xl italic">⚖️</div>
          <h3 className="text-cyan-400 font-black text-xs uppercase tracking-[0.3em] mb-4">Schlussbestimmungen</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt der Vertrag im Übrigen wirksam. Anstelle der unwirksamen Bestimmung gelten die einschlägigen gesetzlichen Vorschriften. Es gilt das Recht der Republik Österreich.
          </p>
        </div>
      </div>

      <div className="mt-16 flex justify-center gap-6">
        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-all">← Zurück zum Shop</Link>
        <button onClick={() => window.print()} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Seite Drucken 🖨️</button>
      </div>
    </div>
  );
}