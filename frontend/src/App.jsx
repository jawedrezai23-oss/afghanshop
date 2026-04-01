import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Kern-Komponenten
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // <--- NEU: Footer importiert

// Öffentliche Seiten
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Success from './pages/Success';
import Order from './pages/Order';
import UserProfile from './pages/UserProfile';

// NEU: Checkout Flow Seiten
import Shipping from './pages/Shipping';
import PlaceOrder from './pages/PlaceOrder'; 

// Rechtliche Seiten (Footer)
import VersandInfo from './screens/VersandInfo';
import AGB from './screens/AGB';
import Datenschutz from './screens/Datenschutz';
import Widerruf from './screens/Widerruf'; // <--- NEU
import Impressum from './screens/Impressum'; // <--- NEU

// Admin Seiten
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import ProductEdit from './pages/ProductEdit';

function App() {
  return (
    <Router>
      {/* Das 'flex flex-col' sorgt dafür, dass der Footer am Boden bleibt */}
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 flex flex-col">
        <Navbar />
        
        {/* 'flex-grow' füllt den Platz, damit der Footer nach unten gedrückt wird */}
        <main className="flex-grow min-h-[calc(100vh-80px)]">
          <Routes>
            {/* --- 1. ÖFFENTLICHE SHOP ROUTEN --- */}
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* --- 2. AUTHENTIFIZIERUNG --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* --- 3. CHECKOUT FLOW (WICHTIG) --- */}
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/order/summary" element={<PlaceOrder />} /> 
            
            {/* --- 4. RECHTLICHES --- */}
            <Route path="/versandinfo" element={<VersandInfo />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/widerruf" element={<Widerruf />} /> {/* <--- NEUE ROUTE */}
            <Route path="/impressum" element={<Impressum />} /> {/* <--- NEUE ROUTE */}
            
            {/* --- 5. KUNDENBEREICH (USER) --- */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/order/success" element={<Success />} />
            <Route path="/order/:id" element={<Order />} />

            {/* --- 6. ADMINBEREICH --- */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/product/:id/edit" element={<ProductEdit />} />
            
            {/* --- 7. 404 FEHLERSEITE --- */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center py-32 px-6">
                <div className="bg-white p-16 rounded-[3rem] shadow-xl text-center border border-slate-100 max-w-md">
                  <span className="text-8xl mb-6 block">🛸</span>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">404 - Lost in Space</h2>
                  <p className="text-slate-400 font-bold mb-8">Diese Seite wurde entweder verschoben oder existiert gar nicht.</p>
                  <button 
                    onClick={() => window.location.href = "/"}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-500 transition-all shadow-lg active:scale-95"
                  >
                    Zurück zur Basis
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </main>

        <Footer /> {/* <--- HIER IST ER JETZT AKTIV */}
      </div>
    </Router>
  );
}

export default App;