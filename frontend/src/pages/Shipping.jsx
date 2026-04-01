import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Shipping() {
  const navigate = useNavigate();
  
  // 1. Wir laden initial, aber lassen die Felder erst mal leer oder nehmen savedAddress nur als Übergang
  const savedAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};

  const [isPickup, setIsPickup] = useState(savedAddress.isPickup || false);
  const [fullName, setFullName] = useState(savedAddress.fullName || '');
  const [address, setAddress] = useState(savedAddress.address || '');
  const [city, setCity] = useState(savedAddress.city || '');
  const [postalCode, setPostalCode] = useState(savedAddress.postalCode || '');
  const [phone, setPhone] = useState(savedAddress.phone || '');

  // 2. FORCE-UPDATE: Wir ziehen die Daten direkt vom Server ins Formular
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: user } = await api.get('/users/profile');
        
        // WICHTIG: Wenn NICHT Abholung gewählt ist, überschreiben wir die Felder 
        // mit den echten Profildaten, egal was im LocalStorage stand.
        if (!isPickup) {
            setFullName(user.name || '');
            setAddress(user.address || '');
            setCity(user.city || '');
            setPostalCode(user.postalCode || '');
            setPhone(user.phone || '');
        }
      } catch (err) {
        console.error("Profil konnte nicht geladen werden", err);
      }
    };

    fetchUserProfile();
    // Der Effekt läuft jedes Mal, wenn isPickup geändert wird
  }, [isPickup]); 

  const submitHandler = (e) => {
    e.preventDefault();
    
    const shippingData = isPickup ? { 
        fullName: 'Privatkunde', 
        address: 'Abholung im Shop',
        city: 'Braunau',
        postalCode: '5280',
        phone: '000',
        isPickup: true,
        paymentMethod: 'Barzahlung'
    } : {
        fullName, 
        address, 
        city, 
        postalCode, 
        phone,
        isPickup: false,
        paymentMethod: 'Vorkasse/Bar'
    };

    localStorage.setItem('shippingAddress', JSON.stringify(shippingData));
    navigate('/order/summary'); 
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100">
        <div className="flex items-center gap-4 mb-10">
           <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center text-xl font-black">1</div>
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Liefer<span className="text-cyan-600">adresse</span></h1>
        </div>

        {/* Checkbox für Abholung */}
        <div className="mb-8 bg-cyan-50 border-2 border-cyan-100 p-6 rounded-[1.5rem]">
          <label className="flex items-center space-x-4 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isPickup}
              onChange={(e) => setIsPickup(e.target.checked)}
              className="w-6 h-6 text-cyan-600 rounded"
            />
            <span className="font-bold text-lg text-cyan-900">
              Abholung im Shop / Barzahlung <br/>
              <span className='text-sm font-normal'>(Keine Adressdaten nötig)</span>
            </span>
          </label>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          {!isPickup && (
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Vollständiger Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Straße & Hausnummer</label>
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">PLZ</label>
                  <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Stadt</label>
                  <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Telefon für Rückfragen</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold" />
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-xl active:scale-95 mt-6">
            {isPickup ? "Weiter zur Bestellung" : "Weiter zur Zahlung"}
          </button>
        </form>
      </div>
    </div>
  );
}