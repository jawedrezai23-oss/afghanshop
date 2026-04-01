import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Logo / Shop Name */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">
              Afghan<span className="text-cyan-600">Shop</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              &copy; {currentYear} Alle Rechte vorbehalten.
            </p>
          </div>

          {/* Rechtliche Links */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/impressum" className="text-[10px] font-black uppercase text-slate-500 hover:text-cyan-600 transition-colors tracking-widest">
              Impressum
            </Link>
            <Link to="/agb" className="text-[10px] font-black uppercase text-slate-500 hover:text-cyan-600 transition-colors tracking-widest">
              AGB
            </Link>
            <Link to="/datenschutz" className="text-[10px] font-black uppercase text-slate-500 hover:text-cyan-600 transition-colors tracking-widest">
              Datenschutz
            </Link>
            <Link to="/widerruf" className="text-[10px] font-black uppercase text-slate-500 hover:text-cyan-600 transition-colors tracking-widest">
              Widerruf
            </Link>
            <Link to="/versandinfo" className="text-[10px] font-black uppercase text-slate-500 hover:text-cyan-600 transition-colors tracking-widest">
              Versand
            </Link>
          </div>

          {/* Kontakt Kurzhinweis */}
          <div className="text-center md:text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Support</p>
            <p className="text-xs font-bold text-slate-900 mt-1">info@afghanshop.at</p>
          </div>
        </div>
      </div>
    </footer>
  );
}