import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShippingScreen() {
  // Wir schauen, ob schon Daten im LocalStorage sind
  const savedDetails = JSON.parse(localStorage.getItem('shippingAddress')) || {};

  const [fullName, setFullName] = useState(savedDetails.fullName || '');
  const [address, setAddress] = useState(savedDetails.address || '');
  const [city, setCity] = useState(savedDetails.city || '');
  const [postalCode, setPostalCode] = useState(savedDetails.postalCode || '');
  const [phone, setPhone] = useState(savedDetails.phone || '');

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    // Daten speichern
    localStorage.setItem('shippingAddress', JSON.stringify({
      fullName, address, city, postalCode, phone
    }));
    // Weiter zur Bezahlung oder Bestellübersicht
    navigate('/payment'); 
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-xl p-8 md:p-12">
        <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
          Liefer<span className="text-cyan-600">adresse</span>
        </h1>

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Vollständiger Name</label>
            <input 
              type="text" 
              required 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Vor- und Nachname"
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Straße & Hausnummer</label>
            <input 
              type="text" 
              required 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">PLZ</label>
              <input 
                type="text" 
                required 
                value={postalCode} 
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Stadt</label>
              <input 
                type="text" 
                required 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Telefonnummer (für Rückfragen)</label>
            <input 
              type="text" 
              required 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+43 6XX XXXX"
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-xl active:scale-95 mt-6"
          >
            Weiter zur Kasse
          </button>
        </form>
      </div>
    </div>
  );
}