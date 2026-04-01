import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); 
  const [updatingField, setUpdatingField] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
      const uniqueCats = [...new Set(data.map(p => p.category).filter(c => c))];
      setCategories(uniqueCats);
      setLoading(false);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    let valA = a[sortConfig.key] || 0;
    let valB = b[sortConfig.key] || 0;
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // --- AUTOMATISCHE BERECHNUNG & UPDATE ---
  const handleManualUpdate = async (product, field, value) => {
    const numValue = parseFloat(value) || 0;
    if (product[field] === numValue) return;

    setUpdatingId(product._id);
    setUpdatingField(field);

    // Vorbereitung der Update-Daten
    let updateData = { ...product, [field]: numValue };

    // AUTOMATIK: Wenn "sold" geändert wird, berechne "revenue" neu
    if (field === 'sold') {
      const newRevenue = numValue * product.price;
      updateData.revenue = newRevenue;
    }

    try {
      await api.put(`/products/${product._id}`, updateData);
      
      // UI lokal aktualisieren (beide Felder falls nötig)
      setProducts(prev => prev.map(p => 
        p._id === product._id ? updateData : p
      ));
    } catch (err) {
      alert(`Fehler beim Speichern`);
    } finally {
      setUpdatingId(null);
      setUpdatingField(null);
    }
  };

  const quickStockUpdate = async (product, newCount) => {
    if (newCount < 0) return;
    handleManualUpdate(product, 'countInStock', newCount);
  };

  // --- STANDARD HANDLER ---
  const addCategoryHandler = async () => {
    if (!newCategoryName.trim()) return alert("Name eingeben!");
    try {
      await api.post('/products', {
        name: `Platzhalter für ${newCategoryName}`,
        price: 0,
        image: '/images/sample.jpg',
        category: newCategoryName,
        countInStock: 0,
        description: 'Neue Kategorie'
      });
      setNewCategoryName('');
      fetchProducts();
    } catch (err) {
      alert("Fehler beim Erstellen");
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Produkt wirklich löschen?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert("Fehler beim Löschen");
      }
    }
  };

  const createProductHandler = async () => {
    try {
      const { data } = await api.post('/products', {
        name: 'Neues Produkt ' + Date.now(),
        price: 0,
        image: '/images/sample.jpg',
        brand: 'AfghanShop',
        category: 'Lebensmittel',
        countInStock: 0,
        description: 'Beschreibung'
      });
      navigate(`/admin/product/${data._id}/edit`);
    } catch (err) {
      alert("Fehler beim Erstellen");
    }
  };

  const outOfStock = products.filter(p => p.countInStock === 0).length;
  const lowStock = products.filter(p => p.countInStock > 0 && p.countInStock <= 5).length;

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em] mb-2 text-left">Lagerverwaltung & Analyse</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase text-left">
            Inventar <span className="text-slate-300">Management</span>
          </h1>
        </div>
        <button onClick={createProductHandler} className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-xl active:scale-95 border-b-4 border-slate-950">
          + Neues Produkt
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-center">
        <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Gesamt Artikel</p>
          <h2 className="text-3xl font-black text-slate-900">{products.length}</h2>
        </div>
        <div className={`p-8 rounded-[2.5rem] border-2 ${outOfStock > 0 ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-white'}`}>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Ausverkauft</p>
          <h2 className={`text-3xl font-black ${outOfStock > 0 ? 'text-red-600' : 'text-slate-900'}`}>{outOfStock}</h2>
        </div>
        <div className={`p-8 rounded-[2.5rem] border-2 ${lowStock > 0 ? 'border-orange-400 bg-orange-50' : 'border-slate-100 bg-white'}`}>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Nachbestellen</p>
          <h2 className={`text-3xl font-black ${lowStock > 0 ? 'text-orange-600' : 'text-slate-900'}`}>{lowStock}</h2>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th onClick={() => requestSort('name')} className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest cursor-pointer hover:text-cyan-500">Produkt</th>
                <th onClick={() => requestSort('price')} className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Preis</th>
                <th className="p-8 text-[10px] font-black uppercase text-cyan-600 tracking-widest text-center italic bg-cyan-50/30">Analyse (Editierbar)</th>
                <th onClick={() => requestSort('countInStock')} className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Bestand</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedProducts.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50/80 transition-all">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <img src={product.image?.startsWith('http') ? product.image : `http://localhost:5001${product.image}`} className="w-16 h-16 object-cover rounded-2xl shadow-md" alt={product.name} />
                      <div>
                        <div className="font-black text-slate-900 text-lg uppercase tracking-tighter">{product.name}</div>
                        <span className="text-cyan-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-cyan-50 rounded-md mt-1 inline-block">{product.category}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-8 font-black text-slate-900 text-xl text-center">
                    {product.price.toFixed(2)}€
                  </td>

                  {/* MANUELLE ANALYSE MIT AUTO-BERECHNUNG */}
                  <td className="p-8 text-center bg-cyan-50/10">
                    <div className="bg-white border border-slate-200 rounded-3xl p-3 inline-flex flex-col gap-2 min-w-[160px] shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                         <span className="text-[9px] font-black uppercase text-slate-400">Stk Verkauft:</span>
                         <input 
                            type="number"
                            value={product.sold || 0}
                            onChange={(e) => setProducts(prev => prev.map(p => p._id === product._id ? {...p, sold: e.target.value} : p))}
                            onBlur={(e) => handleManualUpdate(product, 'sold', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleManualUpdate(product, 'sold', e.target.value)}
                            className="w-16 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black p-1 text-center outline-none focus:border-cyan-500"
                         />
                      </div>
                      <div className="h-[1px] bg-slate-100"></div>
                      <div className="flex items-center justify-between gap-2">
                         <span className="text-[9px] font-black uppercase text-slate-400">Umsatz €:</span>
                         <input 
                            type="number"
                            step="0.01"
                            value={product.revenue ? Number(product.revenue).toFixed(2) : "0.00"}
                            onChange={(e) => setProducts(prev => prev.map(p => p._id === product._id ? {...p, revenue: e.target.value} : p))}
                            onBlur={(e) => handleManualUpdate(product, 'revenue', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleManualUpdate(product, 'revenue', e.target.value)}
                            className="w-20 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black p-1 text-center outline-none focus:border-cyan-500"
                         />
                      </div>
                    </div>
                  </td>

                  <td className="p-8">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => quickStockUpdate(product, product.countInStock - 1)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black hover:bg-red-500 hover:text-white">-</button>
                      <div className="text-center min-w-[50px]">
                        <div className="text-xl font-black text-slate-900">{product.countInStock}</div>
                        <div className="text-[8px] font-black uppercase text-slate-300">Lager</div>
                      </div>
                      <button onClick={() => quickStockUpdate(product, product.countInStock + 1)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black hover:bg-emerald-500 hover:text-white">+</button>
                    </div>
                  </td>

                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => navigate(`/admin/product/${product._id}/edit`)} className="bg-white border border-slate-100 text-slate-900 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:text-white shadow-sm">✏️</button>
                      <button onClick={() => deleteHandler(product._id)} className="bg-white border border-slate-100 text-slate-900 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white shadow-sm">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}