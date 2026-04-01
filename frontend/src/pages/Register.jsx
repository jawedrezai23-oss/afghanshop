import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users/register', formData);
      // Wir speichern den User im LocalStorage, damit er eingeloggt bleibt
      localStorage.setItem('userInfo', JSON.stringify(data));
      alert('Registrierung erfolgreich!');
      navigate('/');
      window.location.reload(); // Damit die Navbar den Login-Status erkennt
    } catch (err) {
      alert(err.response?.data?.message || 'Registrierung fehlgeschlagen');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Konto erstellen</h2>
        <p className="text-slate-500 mb-8">Werde Teil des Afghanshops.</p>
        
        <div className="space-y-4">
          <input 
            type="text" placeholder="Name" required
            className="w-full p-4 bg-slate-50 border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" placeholder="E-Mail" required
            className="w-full p-4 bg-slate-50 border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Passwort" required
            className="w-full p-4 bg-slate-50 border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
            Registrieren
          </button>
        </div>
        <p className="mt-6 text-center text-slate-500">
          Schon ein Konto? <Link civic-color to="/login" className="text-blue-600 font-bold">Anmelden</Link>
        </p>
      </form>
    </div>
  );
}