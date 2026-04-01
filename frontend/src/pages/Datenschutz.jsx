import React from 'react';

export default function Datenschutz() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 bg-white shadow-sm my-10 rounded-[2rem]">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Daten<span className="text-cyan-600">schutz</span></h1>
      <div className="text-sm leading-relaxed space-y-6 font-medium text-slate-600">
        <h2 className="text-xl font-black text-slate-900 uppercase">1. Datenschutz auf einen Blick</h2>
        <p>Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO).</p>
        <h2 className="text-xl font-black text-slate-900 uppercase">2. Datenerfassung</h2>
        <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z.B. Name/Adresse bei Bestellung). Andere Daten werden automatisch durch unsere IT-Systeme erfasst (z.B. IP-Adresse).</p>
        <p>Wir nutzen Stripe zur Zahlungsabwicklung. Hierbei werden Daten an Stripe übertragen.</p>
      </div>
    </div>
  );
}