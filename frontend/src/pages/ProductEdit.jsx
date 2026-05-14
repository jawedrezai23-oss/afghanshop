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
  
  // --- PFAND OPTION (Fixiert auf 0.25€) ---
  const [isDeposit, setIsDeposit] = useState(false);
  const [depositValue] = useState(0.25); // Fixer Wert

  // --- STAFFELPREISE (TIERED PRICING) ---
  const [tieredPrices, setTieredPrices] = useState([]);

  // --- EINHEIT & GEWICHT ---
  const [unit, setUnit] = useState('Stk');
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
  const units = ["Stk", "kg", "100g", "500g", "g", "L", "Dose", "Packung", "Sack", "Glas"];

  // Logik für automatische Badges
  useEffect(() => {
    const currentCat = newCategory.trim() !== "" ? newCategory : category;
    const foodKeywords = ["lebensmittel", "getränk", "frucht", "süss", "frisch", "essen", "food", "drink"];
    const isFood = foodKeywords.some(keyword => currentCat.toLowerCase().includes(keyword));

    if (isFood) {
      setWarranty('100% Original-Ware');
      setReturnPolicy('Kein Umtausch');
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
          setUnit(data.unit || 'Stk');
          setUnitSize(data.unitSize || '');
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
          setTieredPrices(data.tieredPrices || []);
        } catch (err) { console.error("Fehler beim Laden:", err); }
      };
      fetchProduct();
    }
  }, [id]);

  // Funktionen für Staffelpreise
  const addTier = () => setTieredPrices([...tieredPrices, { quantity: 1, price: 0 }]);
  const removeTier = (index) => setTieredPrices(tieredPrices.filter((_, i) => i !== index));
  const updateTier = (index, field, value) => {
    const newTiers = [...tieredPrices];
    newTiers[index][field] = Number(value);
    setTieredPrices(newTiers);
  };

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
        name, price: Number(price), image: images[0] || '', images,
        category: finalCategory, brand, countInStock: Number(countInStock),
        description, unit, unitSize, isBundle, bundleItems,
        warranty, returnPolicy, shippingInfo, isPromotion, promotionLabel,
        oldPrice: Number(oldPrice), deliveryType, isDeposit: Boolean(isDeposit),
        depositValue: isDeposit ? 0.25 : 0, tieredPrices
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
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin/products')} className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all shadow-sm border border-slate-200">
            <span className="text-xl">←</span>
          </button>
          <div>
            <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em] mb-1 italic">Produkt Studio</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {id ? 'Inventar' : 'Neuaufnahme'} <span className="text-cyan-500">Edit</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
           <span className={`text-[10px] font-black uppercase ${isBundle ? 'text-cyan-500' : 'text-slate-400'}`}>Paket Modus</span>
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
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <span className="text-9xl">🎁</span>
              </div>
              
              <div className="flex justify-between items-end relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20">🎁</div>
                  <div>
                    <h3 className="text-white text-2xl font-black uppercase tracking-tighter">Bundle Konfigurator</h3>
                    <p className="text-cyan-400 text-[10px] font-bold uppercase italic tracking-widest">Stelle das Set aus Einzelartikeln zusammen</p>
                  </div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 px-6 py-3 rounded-2xl text-right backdrop-blur-md">
                  <p className="text-[9px] text-cyan-300 font-black uppercase mb-1">Marktwert der Artikel</p>
                  <p className="text-3xl font-black text-white">{calculateBundleTotal().toFixed(2)} €</p>
                </div>
              </div>

              <div className="relative z-10">
                <input 
                  type="text" 
                  placeholder="Produkt suchen & zum Paket hinzufügen..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 p-6 rounded-3xl text-white outline-none focus:border-cyan-400 transition-all placeholder:text-slate-500 font-bold text-lg"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white rounded-3xl shadow-2xl mt-4 overflow-hidden z-50 border border-slate-200">
                    {searchResults.map(p => (
                      <div key={p._id} onClick={() => addToBundle(p)} className="p-5 hover:bg-cyan-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0 group">
                        <span className="font-black text-slate-800 uppercase group-hover:text-cyan-600 transition-colors">{p.name}</span>
                        <div className="flex items-center gap-3">
                           <span className="text-slate-400 text-xs font-bold">{p.price.toFixed(2)}€</span>
                           <span className="bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">+</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {bundleItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all">
                    <div className="flex flex-col">
                      <span className="text-white font-black text-xs uppercase tracking-wider mb-1">{item.name}</span>
                      <span className="text-cyan-500 text-[9px] font-bold uppercase">Inkludiert</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-slate-900 rounded-2xl p-1 border border-slate-700">
                        <button type="button" onClick={() => updateBundleQty(item.product, item.qty - 1)} className="w-10 h-10 flex items-center justify-center text-white font-black hover:text-cyan-400 text-xl">-</button>
                        <input type="number" value={item.qty} readOnly className="w-8 bg-transparent text-center text-white font-black text-sm outline-none" />
                        <button type="button" onClick={() => updateBundleQty(item.product, item.qty + 1)} className="w-10 h-10 flex items-center justify-center text-white font-black hover:text-cyan-400 text-xl">+</button>
                      </div>
                      <button type="button" onClick={() => removeFromBundle(item.product)} className="bg-rose-500/10 text-rose-500 w-10 h-10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center">✕</button>
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
                <input type="text" placeholder="NEUE KATEGORIE..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-white border-2 border-cyan-100 p-4 rounded-2xl focus:border-cyan-500 outline-none font-black text-[10px] uppercase text-cyan-600 tracking-widest" />
              </div>
            </div>

            {/* PREISE & STAFFELPREISE BEREICH */}
            <div className="bg-cyan-50/30 p-8 rounded-[2.5rem] border border-cyan-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Verkaufspreis (€)</label>
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={`w-full border-2 border-transparent p-6 rounded-3xl focus:border-cyan-500 transition-all outline-none font-black text-4xl ${isPromotion ? 'bg-rose-50 text-rose-600' : 'bg-white text-cyan-600 shadow-sm'}`} required />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black uppercase text-cyan-600 italic tracking-widest">🔥 Staffelpreise</label>
                    <button type="button" onClick={addTier} className="bg-cyan-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-cyan-600 transition-all">+ NEUE STUFE</button>
                  </div>
                  <div className="space-y-3">
                    {tieredPrices.map((tier, index) => (
                      <div key={index} className="flex gap-2 items-center animate-fadeIn">
                        <input type="number" placeholder="Ab Stk" value={tier.quantity} onChange={(e) => updateTier(index, 'quantity', e.target.value)} className="w-1/3 p-3 rounded-xl border border-cyan-100 font-bold text-sm outline-none focus:border-cyan-500" />
                        <input type="number" step="0.01" placeholder="Preis je" value={tier.price} onChange={(e) => updateTier(index, 'price', e.target.value)} className="w-1/3 p-3 rounded-xl border border-cyan-100 font-bold text-sm outline-none focus:border-cyan-500 text-cyan-600" />
                        <button type="button" onClick={() => removeTier(index)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[11px] font-black text-rose-600 uppercase tracking-widest italic">📢 Marketing & Preis-Aktion</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isPromotion} onChange={(e) => setIsPromotion(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-rose-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
              {isPromotion && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <input type="text" value={promotionLabel} onChange={(e) => setPromotionLabel(e.target.value)} className="w-full bg-white border-2 border-rose-200 p-4 rounded-2xl font-black text-rose-600 outline-none" placeholder="z.B. ANGEBOT" />
                  <input type="number" step="0.01" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full bg-white border-2 border-rose-200 p-4 rounded-2xl font-black text-slate-400 line-through outline-none" placeholder="Alter Preis" />
                </div>
              )}
            </div>

            {showDepositOption && (
              <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-orange-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">🥤 Pfand-Einstellung</h3>
                    <p className="text-[8px] font-bold text-orange-400 uppercase mt-1">Fixer Pfandwert: 0,25 € pro Einheit</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isDeposit} onChange={(e) => setIsDeposit(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-orange-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Lagerbestand</label>
                <input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-3xl outline-none font-black text-slate-900 text-2xl" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Einheit</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl outline-none font-black text-slate-800">
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-cyan-600 ml-1 italic tracking-widest">Inhalt (Inhalt)</label>
                  <input type="text" value={unitSize} onChange={(e) => setUnitSize(e.target.value)} className="w-full bg-white border-2 border-cyan-100 p-4 rounded-2xl outline-none font-bold text-slate-800" placeholder="z.B. 500g" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 ml-2 italic">Medien</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 group">
                  <img src={img.startsWith('http') ? img : `http://localhost:5001${img}`} alt="Produkt" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-rose-500 text-white w-7 h-7 rounded-xl text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">✕</button>
                </div>
              ))}
              <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 transition-all group">
                <span className="text-3xl group-hover:scale-110 transition-transform">📸</span>
                <input type="file" multiple onChange={uploadFileHandler} className="hidden" />
              </label>
            </div>
          </div>

          <div className={`p-10 rounded-[3.5rem] text-white shadow-2xl border-b-8 sticky top-10 transition-all duration-500 ${isPromotion ? 'bg-rose-600 border-rose-900' : 'bg-slate-900 border-cyan-500'}`}>
            <p className="text-[9px] font-black text-cyan-400 uppercase mb-5 tracking-[0.3em] italic">Vorschau Live</p>
            {isBundle && <span className="bg-cyan-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase mb-3 inline-block shadow-lg shadow-cyan-500/30">🎁 BUNDLE AKTIV</span>}
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 truncate">{name || 'Produktname'}</h4>
            
            <div className="flex flex-col gap-1 mb-8">
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-black text-white">{Number(price).toFixed(2)}€</p>
                {isPromotion && oldPrice > 0 && <p className="text-lg font-bold text-white/40 line-through">{Number(oldPrice).toFixed(2)}€</p>}
              </div>
              <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">{isBundle ? `${bundleItems.length} ARTIKEL IM SET` : `EINHEIT: ${unitSize || unit}`}</p>
              
              {/* STAFFELPREISE IN DER VORSCHAU */}
              {tieredPrices.length > 0 && (
                <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
                  <p className="text-[8px] font-black text-cyan-300 uppercase tracking-widest mb-2 italic">Mengenrabatte:</p>
                  {tieredPrices.map((t, i) => (
                    <div key={i} className="flex justify-between text-[10px] font-bold">
                      <span>Ab {t.quantity} Stk.</span>
                      <span className="text-cyan-400">{Number(t.price).toFixed(2)}€ / Stk</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="button" onClick={submitHandler} disabled={loadingSave || uploading} className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 shadow-xl">
              {loadingSave ? 'WIRD GESPEICHERT...' : 'PRODUKT SPEICHERN'}
            </button>
            
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center text-center">
                <span className="text-xl mb-1">🚚</span>
                <p className="text-[7px] font-black uppercase tracking-widest text-white/40">Versand</p>
                <p className="text-[8px] font-bold leading-tight">{shippingInfo}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-xl mb-1">✨</span>
                <p className="text-[7px] font-black uppercase tracking-widest text-white/40">Qualität</p>
                <p className="text-[8px] font-bold leading-tight">{warranty}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-xl mb-1">🚫</span>
                <p className="text-[7px] font-black uppercase tracking-widest text-white/40">Rückgabe</p>
                <p className="text-[8px] font-bold leading-tight">{returnPolicy}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductEdit;