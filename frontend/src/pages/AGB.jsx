import React from 'react';

export default function AGB() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 bg-white shadow-sm my-10 rounded-[2rem]">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Allgemeine <span className="text-cyan-600">Geschäftsbedingungen</span></h1>
      <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6 font-medium text-slate-600">
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase">§1 Geltungsbereich</h2>
          <p>Diese AGB gelten für alle Bestellungen über unseren Online-Shop AfghanShop. Vertragspartner ist AfghanShop, Inhaber [Dein Name], [Deine Adresse].</p>
        </section>
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase">§2 Vertragsschluss</h2>
          <p>Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot dar. Durch Anklicken des Buttons [Kaufen] geben Sie eine verbindliche Bestellung ab.</p>
        </section>
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase">§3 Preise und Versandkosten</h2>
          <p>Alle Preise enthalten die gesetzliche Mehrwertsteuer. Grundpreise (z.B. Preis pro kg) werden deutlich am Produkt ausgewiesen. Versandkosten kommen ggf. hinzu.</p>
        </section>
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase">§4 Zahlungsbedingungen</h2>
          <p>Wir bieten Zahlung per Stripe (Kreditkarte), Überweisung oder Barzahlung bei Abholung/Lieferung an.</p>
        </section>
      </div>
    </div>
  );
}