import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // --- UPDATE LOGIK ---
  const handleManualUpdate = async (product, field, value) => {
    const numValue = parseFloat(value) || 0;
    if (product[field] === numValue) return;

    let updateData = { ...product, [field]: numValue };

    if (field === 'sold') {
      updateData.revenue = numValue * product.price;
    }

    try {
      await api.put(`/products/${product._id}`, updateData);
      setProducts(prev => prev.map(p => p._id === product._id ? updateData : p));
    } catch (err) {
      alert(`Fehler beim Speichern`);
    }
  };

  // --- NEU: SPEZIELLES UPDATE FÜR KLEIDUNGS-VARIANTEN ---
  const updateVariantStock = async (product, variantIndex, newQty) => {
    if (newQty < 0) return;
    
    const updatedVariants = [...product.variants];
    updatedVariants[variantIndex].countInStock = newQty;
    
    // Gesamtbestand berechnen (Summe aller Varianten)
    const totalStock = updatedVariants.reduce((acc, curr) => acc + curr.countInStock, 0);

    const updateData = { 
      ...product, 
      variants: updatedVariants,
      countInStock: totalStock 
    };

    try {
      await api.put(`/products/${product._id}`, updateData);
      setProducts(prev => prev.map(p => p._id === product._id ? updateData : p));
    } catch (err) {
      alert("Fehler beim Varianten-Update");
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
        name: 'Neuer Artikel ' + Date.now(),
        price: 0,
        image: '/images/sample.jpg',
        category: 'Neu',
        countInStock: 0,
        isClothing: false, // Standardmäßig Lebensmittel/Normal
        description: 'Beschreibung hier...'
      });
      navigate(`/admin/product/${data._id}/edit`);
    } catch (err) {
      alert("Fehler beim Erstellen");
    }
  };

  // Stats Logik
  const outOfStock = products.filter(p => p.countInStock === 0).length;
  const lowStock = products.filter(p => p.countInStock > 0 && p.countInStock <= 5).length;

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans bg-slate-50 min-h-screen">
      {/* Header & Stats wie gehabt */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 text-left">
        <div>
          <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em] mb-2">System Administration</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            Bestand <span className="text-slate-300">& Sales</span>
          </h1>
        </div>
        <button onClick={createProductHandler} className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-xl active:scale-95 border-b-4 border-slate-950">
          + Artikel hinzufügen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         {/* ... Stats Cards hier (identisch zum Vorherigen) ... */}
         <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Artikel</p>
            <h2 className="text-3xl font-black text-slate-900">{products.length}</h2>
         </div>
         <div className={`p-8 rounded-[2.5rem] border-2 text-center ${outOfStock > 0 ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-white'}`}>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Leer</p>
            <h2 className={`text-3xl font-black ${outOfStock > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{outOfStock}</h2>
         </div>
         <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Gesamtumsatz</p>
            <h2 className="text-3xl font-black text-cyan-400">
               {products.reduce((acc, curr) => acc + (curr.revenue || 0), 0).toFixed(2)}€
            </h2>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Produkt & Typ</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Preis</th>
                <th className="p-8 text-[10px] font-black uppercase text-cyan-600 tracking-widest text-center italic bg-cyan-50/30">Analytics</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Bestands-Kontrolle</th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedProducts.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50/80 transition-all">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <img 
                        src={product.image?.startsWith('http') ? product.image : `https://afghanshop-backend.onrender.com${product.image}`} 
                        className="w-16 h-16 object-cover rounded-2xl shadow-md bg-slate-100" 
                        alt={product.name} 
                      />
                      <div>
                        <div className="font-black text-slate-900 text-lg uppercase tracking-tighter">{product.name}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-cyan-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-cyan-50 rounded-md border border-cyan-100 inline-block">{product.category}</span>
                          {product.isClothing && (
                            <span className="text-indigo-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100 inline-block">👕 Textil</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-8 font-black text-slate-900 text-xl text-center">
                    {product.price.toFixed(2)}€
                  </td>

                  {/* ANALYTICS */}
                  <td className="p-8 text-center bg-cyan-50/10">
                    <div className="bg-white border border-slate-200 rounded-3xl p-3 inline-flex flex-col gap-2 min-w-[160px] shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                         <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Verkauft:</span>
                         <input 
                            type="number"
                            value={product.sold || 0}
                            onChange={(e) => setProducts(prev => prev.map(p => p._id === product._id ? {...p, sold: e.target.value} : p))}
                            onBlur={(e) => handleManualUpdate(product, 'sold', e.target.value)}
                            className="w-14 bg-slate-50 border border-slate-100 rounded text-[10px] font-black p-1 text-center outline-none focus:border-cyan-500"
                         />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                         <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Umsatz €:</span>
                         <span className="text-[10px] font-black text-cyan-600">{(product.revenue || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </td>

                  {/* BESTANDSKONTROLLE (DYNAMISCH FÜR KLEIDUNG) */}
                  <td className="p-8">
                    {product.isClothing && product.variants ? (
                      /* Anzeige für Kleidung: Jede Variante ein Button-Set */
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        {product.variants.map((variant, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black text-indigo-600 w-8">{variant.size}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateVariantStock(product, idx, variant.countInStock - 1)} className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-black text-xs hover:bg-rose-500 hover:text-white">-</button>
                              <span className="text-[11px] font-black w-6 text-center">{variant.countInStock}</span>
                              <button onClick={() => updateVariantStock(product, idx, variant.countInStock + 1)} className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-black text-xs hover:bg-emerald-500 hover:text-white">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Standard Anzeige (Lebensmittel) */
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleManualUpdate(product, 'countInStock', product.countInStock - 1)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black hover:bg-rose-500 hover:text-white transition-colors">-</button>
                        <div className="text-center min-w-[50px]">
                          <div className="text-xl font-black text-slate-900">{product.countInStock}</div>
                          <div className="text-[8px] font-black uppercase text-slate-300">Lager</div>
                        </div>
                        <button onClick={() => handleManualUpdate(product, 'countInStock', product.countInStock + 1)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black hover:bg-emerald-500 hover:text-white transition-colors">+</button>
                      </div>
                    )}
                  </td>

                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => navigate(`/admin/product/${product._id}/edit`)} className="bg-white border border-slate-100 text-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-cyan-500 hover:text-white shadow-sm transition-all">✏️</button>
                      <button onClick={() => deleteHandler(product._id)} className="bg-white border border-slate-100 text-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white shadow-sm transition-all">🗑️</button>
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