import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // WhatsApp Daten
  const whatsappNumber = "4369010088854"; 
  const whatsappMessage = encodeURIComponent("Hallo! Ich habe mein Passwort vergessen und benötige Hilfe bei meinem Account.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users/login', { email, password });
      // WICHTIG: Das ganze 'data' Objekt speichern (enthält Name, Email, Token, isAdmin)
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      alert('Erfolgreich eingeloggt!');
      navigate('/');
      window.location.reload(); // Erzwingt Neuladen der Navbar
    } catch (err) {
      alert(err.response?.data?.message || 'Login fehlgeschlagen');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form onSubmit={submitHandler} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Anmelden</h2>
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="E-Mail" 
              className="w-full p-4 bg-slate-50 border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Passwort" 
              className="w-full p-4 bg-slate-50 border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="submit" 
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all"
            >
              Einloggen
            </button>
          </div>

          {/* PASSWORT VERGESSEN / WHATSAPP OPTION */}
          <div className="mt-6 pt-6 border-t border-slate-50">
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all group"
            >
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Passwort vergessen?
              </span>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                📲 Hilfe via WhatsApp anfordern
              </span>
            </a>
          </div>

          <p className="mt-6 text-center text-slate-500 text-sm">
            Neu hier? <Link to="/register" className="text-blue-600 font-bold hover:underline">Konto erstellen</Link>
          </p>
        </form>
      </div>
    </div>
  );
}