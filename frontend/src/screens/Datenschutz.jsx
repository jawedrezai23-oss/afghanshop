import React from 'react';
import { Link } from 'react-router-dom';

export default function Datenschutz() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 bg-white shadow-sm my-10 rounded-[3.5rem] border border-slate-100 font-sans selection:bg-cyan-100">
      <div className="mb-12 border-b border-slate-50 pb-10">
        <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.4em] mb-2 italic">Privatsphäre & Sicherheit</p>
        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-slate-900">
          Daten<span className="text-cyan-600">schutz</span>erklärung
        </h1>
        <p className="text-slate-400 mt-4 font-bold text-xs uppercase tracking-widest italic">Stand: April 2026</p>
      </div>

      <div className="space-y-12 text-slate-600 leading-relaxed text-sm font-medium">
        
        {/* 1. ALLGEMEIN */}
        <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-50">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">01</span> Datenschutz auf einen Blick
          </h2>
          <p>
            Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung. 
            Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis.
          </p>
        </section>

        {/* 2. VERANTWORTLICHER */}
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">02</span> Verantwortlicher
          </h2>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="font-black text-slate-800 uppercase text-xs mb-2 italic">Verantwortlich für die Datenverarbeitung:</p>
            <p className="text-lg font-black text-slate-900 leading-tight uppercase">
              AfghanShop<br />
              Jawed REZAI
            </p>
            <p className="mt-2 font-bold">
              Mozartstrasse 17/6<br />
              5280 Braunau am Inn, Österreich<br />
              E-Mail: afghanshop.braunau@gmail.com
            </p>
          </div>
        </section>

        {/* 3. DATENERFASSUNG */}
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">03</span> Datenerfassung bei Bestellung
          </h2>
          <p className="mb-4">
            Wenn Sie in unserem Shop eine Bestellung aufgeben, erheben wir folgende Daten zur Vertragserfüllung:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <li className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">✔ Name & Vorname</li>
            <li className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">✔ Liefer- & Rechnungsadresse</li>
            <li className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">✔ E-Mail Adresse</li>
            <li className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">✔ Telefonnummer (für Rückfragen)</li>
          </ul>
          <p>
            Diese Daten werden verschlüsselt in unserer Datenbank gespeichert und nur zum Zweck der Bestellabwicklung und Zustellung (z.B. Brudi-Zustellung in Braunau) verwendet.
          </p>
        </section>

        {/* 4. ZAHLUNGSDIENSTE */}
        <section className="bg-cyan-50/30 p-8 rounded-[2.5rem] border border-cyan-100">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-600 italic">04</span> Stripe & Zahlungsabwicklung
          </h2>
          <p className="mb-4">
            Wir bieten die Zahlung via <span className="font-bold text-slate-900 italic">Stripe</span> an. Bei Auswahl dieser Zahlungsart werden die von Ihnen eingegebenen Zahlungsdaten an Stripe (Stripe Payments Europe Ltd.) übermittelt.
          </p>
          <p className="text-xs italic text-slate-500">
            Die Übermittlung Ihrer Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Stripe ist PCI-DSS zertifiziert und sorgt für eine hochsichere Verarbeitung Ihrer Kreditkartendaten. Wir selbst speichern keine Kreditkartennummern auf unseren Servern.
          </p>
        </section>

        {/* 5. WHATSAPP & KOMMUNIKATION */}
        <section className="border-l-4 border-emerald-500 pl-8 py-2">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-emerald-500 italic">05</span> Kommunikation via WhatsApp
          </h2>
          <p>
            Sofern Sie uns Screenshots von Überweisungen oder Support-Anfragen via <span className="font-bold text-emerald-600 italic">WhatsApp</span> senden, erfolgt dies auf Ihre eigene Initiative. Bitte beachten Sie, dass WhatsApp Daten auf Servern außerhalb der EU speichern kann. Wir nutzen diese Daten ausschließlich zur schnelleren Bearbeitung Ihrer Bestellung.
          </p>
        </section>

        {/* 6. IHRE RECHTE */}
        <section>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-3">
            <span className="text-cyan-500 italic">06</span> Ihre Rechte (Auskunft & Löschung)
          </h2>
          <p>
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen. Kontaktieren Sie uns hierzu einfach per E-Mail.
          </p>
        </section>

        {/* FOOTER NOTE */}
        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] mt-16 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center text-9xl font-black">🔒</div>
          <p className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Sicherheit Garantiert</p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Wir nutzen moderne SSL-Verschlüsselung (HTTPS), um Ihre Daten während der Übertragung bestmöglich zu schützen. Ihre Daten werden niemals ohne Ihre ausdrückliche Zustimmung an unbefugte Dritte weitergegeben.
          </p>
        </div>
      </div>

      <div className="mt-16 flex justify-center gap-6">
        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-all">← Zurück zum Shop</Link>
        <button onClick={() => window.print()} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Dokument Drucken 🖨️</button>
      </div>
    </div>
  );
}