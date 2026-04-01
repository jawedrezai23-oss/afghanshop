import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Standard States
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('Lebensmittel');
  const [newCategory, setNewCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('AfghanShop');
  
  // --- LEBENSMITTEL DATEN (LMIV) ---
  const [ingredients, setIngredients] = useState('');
  const [nutrition, setNutrition] = useState('');

  // --- PFAND OPTION ---
  const [isDeposit, setIsDeposit] = useState(false);
  const [depositValue, setDepositValue] = useState(0);

  // --- EINHEIT & GEWICHT ---
  const [unit, setUnit] = useState('g'); 
  const [unitSize, setUnitSize] = useState(''); 

  // --- PAKET / BUNDLE OPTION ---
  const [isBundle, setIsBundle] = useState(false);
  const [bundleItems, setBundleItems] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // --- MARKETING & LOGISTIK ---
  const [isPromotion, setIsPromotion] = useState(false);
  const [promotionLabel, setPromotionLabel] = useState('');
  const [oldPrice, setOldPrice] = useState(0);
  const [deliveryType, setDeliveryType] = useState('all');

  // Trust Badges
  const [warranty, setWarranty] = useState('100% Original-Ware');
  const [returnPolicy, setReturnPolicy] = useState('Kein Umtausch (Lebensmittel)');
  const [shippingInfo, setShippingInfo] = useState('Standard Versand');
  
  const [uploading, setUploading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const categories = ["Lebensmittel", "Trockenfrüchte", "Getränke", "Süssigkeiten", "Frische Lebensmittel"];
  const units = ["g", "kg", "ml", "L", "Stk", "Packung", "Glas"];

  useEffect(() => {
    const currentCat = newCategory.trim() !== "" ? newCategory : category;
    const foodKeywords = ["lebensmittel", "getränk", "frucht", "süss", "frisch", "essen", "food", "drink", "trockenfrüchte"];
    const isFood = foodKeywords.some(keyword => currentCat.toLowerCase().includes(keyword));

    if (isFood) {
      setWarranty('100% Original-Ware');
      setReturnPolicy('Kein Umtausch (Lebensmittel)');
    } else {
      setWarranty('2 Jahre Garantie');
      setReturnPolicy('30 Tage Rückgabe');
    }
  }, [category, newCategory]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setAllProducts(data);
      } catch (err) { console.error(err); }
    };
    fetchAllProducts();

    if (id) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setName(data.name || '');
          setPrice(data.price || 0);
          setImages(Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []));
          setCategory(data.category || 'Lebensmittel');
          setCountInStock(data.countInStock || 0);
          setDescription(data.description || '');
          setBrand(data.brand || 'AfghanShop');
          setIngredients(data.ingredients || '');
          setNutrition(data.nutrition || '');
          setUnit(data.unit || 'g');
          
          // FIX: Sicherstellen, dass das Gewicht beim Laden IMMER eine Zahl ist
          const loadedWeight = data.unitSize || data.weight || '';
          setUnitSize(loadedWeight !== '' ? Number(loadedWeight) : ''); 

          setIsBundle(data.isBundle || false);
          setBundleItems(Array.isArray(data.bundleItems) ? data.bundleItems : []); 
          if(data.warranty) setWarranty(data.warranty);
          if(data.returnPolicy) setReturnPolicy(data.returnPolicy);
          setShippingInfo(data.shippingInfo || 'Standard Versand');
          setIsPromotion(data.isPromotion || false);
          setPromotionLabel(data.promotionLabel || '');
          setOldPrice(data.oldPrice || 0);
          setDeliveryType(data.deliveryType || 'all');
          setIsDeposit(data.isDeposit === true);
          setDepositValue(data.depositValue || 0);
        } catch (err) { console.error("Fehler beim Laden:", err); }
      };
      fetchProduct();
    }
  }, [id]);

  const calculateBundleTotal = () => {
    return bundleItems.reduce((sum, item) => {
      const prod = allProducts.find(p => p._id === item.product);
      return sum + (prod ? prod.price * item.qty : 0);
    }, 0);
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p._id !== id
      );
      setSearchResults(filtered.slice(0, 5));
    }
  }, [searchTerm, allProducts, id]);

  const addToBundle = (prod) => {
    const exist = bundleItems.find(x => x.product === prod._id);
    if (exist) {
      setBundleItems(bundleItems.map(x => x.product === prod._id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setBundleItems([...bundleItems, { product: prod._id, name: prod.name, qty: 1 }]);
    }
    setSearchTerm('');
  };

  const removeFromBundle = (prodId) => {
    setBundleItems(bundleItems.filter(x => x.product !== prodId));
  };

  const updateBundleQty = (prodId, newQty) => {
    if (newQty < 1) return;
    setBundleItems(bundleItems.map(x => x.product === prodId ? { ...x, qty: Number(newQty) } : x));
  };

  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const uploadedImages = [...images];
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/upload', formData, config);
        uploadedImages.push(data);
      }
      setImages(uploadedImages);
      setUploading(false);
    } catch (error) {
      alert("Bild-Upload fehlgeschlagen");
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const submitHandler = async (e) => {
    if (e) e.preventDefault();
    setLoadingSave(true);
    const finalCategory = newCategory.trim() !== "" ? newCategory : category;
    
    try {
      const productData = {
        name, 
        price: Number(price), 
        image: images[0] || '', 
        images,
        category: finalCategory, 
        brand, 
        countInStock: Number(countInStock),
        description, 
        ingredients, 
        nutrition, 
        unit,               
        weight: Number(unitSize), 
        unitSize: Number(unitSize), 
        isBundle, 
        bundleItems,
        warranty, 
        returnPolicy, 
        shippingInfo, 
        isPromotion, 
        promotionLabel,
        oldPrice: Number(oldPrice), 
        deliveryType, 
        isDeposit: Boolean(isDeposit),
        depositValue: Number(depositValue)
      };

      if (id) { await api.put(`/products/${id}`, productData); } 
      else { await api.post('/products', productData); }
      navigate('/admin/products');
    } catch (err) {
      alert(err.response?.data?.message || 'Fehler beim Speichern');
    } finally { setLoadingSave(false); }
  };

  const showDepositOption = category === 'Getränke' || newCategory.toLowerCase().includes('getränk') || newCategory.toLowerCase().includes('drink');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans bg-slate-50 min-h-screen selection:bg-cyan-100">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => navigate('/admin/products')} className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all shadow-sm border border-slate-200 group">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          </button>
          <div>
            <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em] mb-1 italic">Produkt Management</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {id ? 'Produkt' : 'Neue'} <span className="text-cyan-500">Edition</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
           <span className={`text-[10px] font-black uppercase ${isBundle ? 'text-cyan-500' : 'text-slate-400'}`}>Set / Bundle</span>
           <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isBundle} onChange={(e) => setIsBundle(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-cyan-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
           </label>
        </div>
      </div>

      <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          
          {isBundle && (
            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl space-y-8 border-b-8 border-cyan-500 animate-fadeIn relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><span className="text-9xl">🎁</span></div>
                <div className="flex justify-between items-end relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">🎁</div>
                        <div>
                            <h3 className="text-white text-2xl font-black uppercase tracking-tighter">Bundle Inhalt</h3>
                            <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest">Kombiniere mehrere Artikel</p>
                        </div>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 px-6 py-3 rounded-2xl text-right">
                        <p className="text-[9px] text-cyan-300 font-black uppercase mb-1">Bundle Wert</p>
                        <p className="text-3xl font-black text-white">{calculateBundleTotal().toFixed(2)} €</p>
                    </div>
                </div>
                <input type="text" placeholder="Produkt zum Set hinzufügen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 p-6 rounded-3xl text-white outline-none focus:border-cyan-400 font-bold text-lg placeholder:text-slate-500" />
                {searchResults.length > 0 && (
                    <div className="absolute left-10 right-10 bg-white rounded-3xl shadow-2xl mt-[-20px] overflow-hidden z-50 border border-slate-200">
                        {searchResults.map(p => (
                            <div key={p._id} onClick={() => addToBundle(p)} className="p-5 hover:bg-cyan-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0 group">
                                <span className="font-black text-slate-800 uppercase group-hover:text-cyan-600 transition-colors">{p.name}</span>
                                <span className="bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">+</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {bundleItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 group">
                            <span className="text-white font-black text-xs uppercase truncate pr-4">{item.name}</span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 bg-slate-900 rounded-2xl p-1 border border-slate-700">
                                    <button type="button" onClick={() => updateBundleQty(item.product, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-white font-black hover:text-cyan-400 transition-colors">-</button>
                                    <span className="text-white font-black text-sm w-4 text-center">{item.qty}</span>
                                    <button type="button" onClick={() => updateBundleQty(item.product, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-white font-black hover:text-cyan-400 transition-colors">+</button>
                                </div>
                                <button type="button" onClick={() => removeFromBundle(item.product)} className="text-rose-500 font-black px-2 hover:scale-125 transition-transform">✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Produktbezeichnung</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-2xl focus:border-cyan-500 focus:bg-white transition-all outline-none font-bold text-slate-800" required />
              </div>
              <div className="space-y-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kategorie</label>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setNewCategory(''); }} className="w-full bg-white border-2 border-transparent p-4 rounded-2xl focus:border-cyan-500 transition-all outline-none font-bold text-slate-800">
                    <option value="">Wählen...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <input type="text" placeholder="Eigene Kategorie..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-white border-2 border-cyan-100 p-4 rounded-2xl focus:border-cyan-500 outline-none font-black text-[10px] uppercase text-cyan-600 tracking-widest placeholder:text-cyan-200" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Produkt-Story / Beschreibung</label>
              <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-2xl focus:border-cyan-500 focus:bg-white transition-all outline-none font-medium text-slate-700"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-cyan-50/30 rounded-[2.5rem] border border-cyan-100/50">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-cyan-600 ml-1 tracking-widest italic">Zutatenliste</label>
                <textarea rows="3" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="z.B. Rosinen, Sonnenblumenöl..." className="w-full bg-white border-2 border-transparent p-4 rounded-2xl focus:border-cyan-500 outline-none text-sm font-medium text-slate-700 shadow-sm"></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-cyan-600 ml-1 tracking-widest italic">Nährwertangaben</label>
                <textarea rows="3" value={nutrition} onChange={(e) => setNutrition(e.target.value)} placeholder="Energie: 120kcal&#10;Fett: 2g..." className="w-full bg-white border-2 border-transparent p-4 rounded-2xl focus:border-cyan-500 outline-none text-sm font-medium text-slate-700 shadow-sm"></textarea>
              </div>
            </div>

            <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-rose-600 uppercase tracking-widest italic">🔥 Aktions-Steuerung</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isPromotion} onChange={(e) => setIsPromotion(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-rose-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                </label>
              </div>
              {isPromotion && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <input type="text" value={promotionLabel} onChange={(e) => setPromotionLabel(e.target.value)} className="w-full bg-white border-2 border-rose-200 p-4 rounded-2xl font-black text-rose-600 outline-none focus:border-rose-500" placeholder="Aktions-Label" />
                  <input type="number" step="0.01" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full bg-white border-2 border-rose-200 p-4 rounded-2xl font-black text-slate-400 line-through outline-none focus:border-rose-500" placeholder="Streichpreis" />
                </div>
              )}
            </div>

            {showDepositOption && (
              <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">🥤 Pfand-Management</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isDeposit} onChange={(e) => setIsDeposit(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-orange-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                {isDeposit && (
                  <input type="number" step="0.01" value={depositValue} onChange={(e) => setDepositValue(e.target.value)} className="w-full bg-white border-2 border-orange-200 p-4 rounded-2xl font-black text-orange-600 outline-none" placeholder="0.25" />
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Verkaufspreis (€)</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={`w-full border-2 border-transparent p-6 rounded-3xl focus:border-cyan-500 transition-all outline-none font-black text-4xl shadow-inner ${isPromotion ? 'bg-rose-50 text-rose-600' : 'bg-cyan-50 text-cyan-600'}`} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bestand</label>
                <input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-3xl outline-none font-black text-slate-900 text-2xl shadow-inner" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Basiseinheit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-white border-2 border-transparent p-4 rounded-2xl outline-none font-black text-slate-800 focus:border-cyan-500 shadow-sm transition-all">
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-cyan-600 ml-1 italic tracking-widest">Netto-Inhalt (Nur Zahl!)</label>
                <input 
                  type="number" 
                  value={unitSize} 
                  // FIX: Beim Tippen sofort in Zahl umwandeln
                  onChange={(e) => setUnitSize(e.target.value === '' ? '' : Number(e.target.value))} 
                  className="w-full bg-white border-2 border-cyan-100 p-4 rounded-2xl outline-none font-black text-lg text-slate-800 focus:border-cyan-500 shadow-sm transition-all" 
                  placeholder="z.B. 500" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 ml-2 italic underline decoration-cyan-200 underline-offset-4">Bilder</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 group shadow-sm">
                  <img src={img.startsWith('http') ? img : `http://localhost:5001${img}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Produkt" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-rose-500/80 text-white font-black text-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">ENTFERNEN</button>
                </div>
              ))}
              <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 transition-all group shadow-inner">
                <span className="text-3xl group-hover:scale-110 transition-transform">📸</span>
                <input type="file" multiple onChange={uploadFileHandler} className="hidden" />
              </label>
            </div>
          </div>

          <div className={`p-10 rounded-[3.5rem] text-white shadow-2xl border-b-8 sticky top-10 transition-all duration-500 ${isPromotion ? 'bg-rose-600 border-rose-900 shadow-rose-200' : 'bg-slate-900 border-cyan-500 shadow-slate-200'}`}>
            <p className="text-[9px] font-black text-cyan-400 uppercase mb-5 tracking-[0.3em] italic">Vorschau</p>
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 truncate leading-none">{name || 'Produktname'}</h4>
            <div className="flex flex-col gap-1 mb-10">
              <p className="text-5xl font-black text-white">{Number(price).toFixed(2)}€</p>
              <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest opacity-80">
                {/* FIX: In der Vorschau ebenfalls Number nutzen */}
                {unitSize !== '' ? `${unitSize}${unit} Netto` : 'Keine Mengenangabe'}
              </p>
            </div>
            
            <button 
                type="button" 
                onClick={submitHandler} 
                disabled={loadingSave || uploading} 
                className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-cyan-400 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingSave ? 'SPEICHERT...' : 'VERÖFFENTLICHEN'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductEdit;