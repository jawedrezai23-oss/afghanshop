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
  
  // --- NEU: KLEIDUNGS LOGIK ---
  const [isClothing, setIsClothing] = useState(false);
  const [variants, setVariants] = useState([]); 

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

  const categories = ["Lebensmittel", "Trockenfrüchte", "Getränke", "Süssigkeiten", "Frische Lebensmittel", "Kleidung"];
  const units = ["g", "kg", "ml", "L", "Stk", "Packung", "Glas"];

  // AUTO-LOGIK
  useEffect(() => {
    const currentCat = newCategory.trim() !== "" ? newCategory : category;
    const foodKeywords = ["lebensmittel", "getränk", "frucht", "süss", "frisch", "essen", "food", "drink", "trockenfrüchte"];
    const isFood = foodKeywords.some(keyword => currentCat.toLowerCase().includes(keyword));

    if (currentCat === "Frische Lebensmittel" || (unit === 'kg' && Number(unitSize) >= 5)) {
      setDeliveryType('local');
    }

    if (currentCat.toLowerCase() === "kleidung") {
        setIsClothing(true);
        setWarranty('Gesetzliche Gewährleistung');
        setReturnPolicy('14 Tage Rückgaberecht');
    } else if (isFood) {
      setIsClothing(false); // Kleidung aus, wenn Lebensmittel gewählt
      setWarranty('100% Original-Ware');
      setReturnPolicy('Kein Umtausch (Lebensmittel)');
    }
  }, [category, newCategory, unit, unitSize]);

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
          setUnitSize(data.unitSize || data.weight || ''); 
          setIsBundle(data.isBundle || false);
          setBundleItems(Array.isArray(data.bundleItems) ? data.bundleItems : []); 
          setWarranty(data.warranty || '');
          setReturnPolicy(data.returnPolicy || '');
          setShippingInfo(data.shippingInfo || 'Standard Versand');
          setIsPromotion(data.isPromotion || false);
          setPromotionLabel(data.promotionLabel || '');
          setOldPrice(data.oldPrice || 0);
          setDeliveryType(data.deliveryType || 'all');
          setIsDeposit(data.isDeposit === true);
          setDepositValue(data.depositValue || 0);
          setIsClothing(data.isClothing || false);
          setVariants(data.variants || []);
        } catch (err) { console.error("Fehler beim Laden:", err); }
      };
      fetchProduct();
    }
  }, [id]);

  // VARIANTEN FUNKTIONEN
  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', countInStock: 0 }]);
  };
  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = field === 'countInStock' ? Number(value) : value;
    setVariants(newVariants);
  };

  const calculateBundleTotal = () => {
    return bundleItems.reduce((sum, item) => {
      const prod = allProducts.find(p => p._id === item.product);
      return sum + (prod ? prod.price * item.qty : 0);
    }, 0);
  };

  // Suche für Bundles
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
    
    // Automatische Berechnung des Bestands bei Kleidung
    const totalStock = isClothing 
        ? variants.reduce((acc, v) => acc + Number(v.countInStock || 0), 0) 
        : Number(countInStock);

    try {
      const productData = {
        name, 
        price: Number(price), 
        image: images[0] || '', 
        images,
        category: finalCategory, 
        brand, 
        countInStock: totalStock,
        description, 
        ingredients: isClothing ? '' : ingredients, 
        nutrition: isClothing ? '' : nutrition, 
        unit: isClothing ? 'Stk' : unit,               
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
        depositValue: Number(depositValue),
        isFresh: finalCategory === "Frische Lebensmittel" || deliveryType === 'local',
        isClothing,
        variants: isClothing ? variants : []
      };

      if (id) { 
        await api.put(`/products/${id}`, productData); 
      } else { 
        await api.post('/products', productData); 
      }
      navigate('/admin/products');
    } catch (err) {
      alert(err.response?.data?.message || 'Fehler beim Speichern');
    } finally { setLoadingSave(false); }
  };

  const showDepositOption = category === 'Getränke' || newCategory.toLowerCase().includes('getränk');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => navigate('/admin/products')} className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all shadow-sm border border-slate-200 group">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          </button>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em] mb-1 italic">Produkt Management</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {id ? 'Produkt' : 'Neue'} <span className="text-cyan-500">Edition</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <span className={`text-[10px] font-black uppercase ${isClothing ? 'text-indigo-500' : 'text-slate-400'}`}>👗 Kleidung</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isClothing} onChange={(e) => setIsClothing(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-indigo-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
            </div>
        </div>
      </div>

      <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
        <div className="lg:col-span-8 space-y-8">
          
          {/* BUNDLE SEKTION */}
          {isBundle && (
            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl space-y-8 border-b-8 border-cyan-500 relative overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-end relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">🎁</div>
                        <div>
                            <h3 className="text-white text-2xl font-black uppercase tracking-tighter leading-none">Bundle Inhalt</h3>
                            <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mt-1">Kombiniere mehrere Artikel</p>
                        </div>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 px-6 py-3 rounded-2xl text-right">
                        <p className="text-[9px] text-cyan-300 font-black uppercase mb-1">Bundle Wert</p>
                        <p className="text-3xl font-black text-white">{calculateBundleTotal().toFixed(2)} €</p>
                    </div>
                </div>
                <input type="text" placeholder="Produkt zum Set hinzufügen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 p-6 rounded-3xl text-white outline-none focus:border-cyan-400 font-bold text-lg" />
                
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

          {/* KLEIDUNGS VARIANTEN */}
          {isClothing && (
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-indigo-100 shadow-xl space-y-6 animate-in slide-in-from-top duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">👔</div>
                <div>
                  <h3 className="text-indigo-900 text-xl font-black uppercase tracking-tighter leading-none">Größen & Farben</h3>
                  <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest italic mt-1">Bestandsverwaltung pro Variante</p>
                </div>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 group relative">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-indigo-400 ml-2">Größe</label>
                      <input type="text" value={variant.size} placeholder="z.B. XL" onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="w-full bg-white p-3 rounded-xl border-none font-bold text-slate-800 shadow-sm focus:ring-2 ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-indigo-400 ml-2">Farbe</label>
                      <input type="text" value={variant.color} placeholder="Blau" onChange={(e) => handleVariantChange(index, 'color', e.target.value)} className="w-full bg-white p-3 rounded-xl border-none font-bold text-slate-800 shadow-sm focus:ring-2 ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-indigo-400 ml-2">Lager</label>
                      <input type="number" value={variant.countInStock} onChange={(e) => handleVariantChange(index, 'countInStock', e.target.value)} className="w-full bg-white p-3 rounded-xl border-none font-black text-indigo-600 shadow-sm focus:ring-2 ring-indigo-500 outline-none" />
                    </div>
                    <div className="flex items-end">
                      <button type="button" onClick={() => removeVariant(index)} className="w-full bg-white text-rose-500 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all shadow-sm">Entfernen</button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addVariant} className="w-full border-2 border-indigo-200 border-dashed p-5 rounded-[2rem] text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-500 transition-all">
                + Neue Variante hinzufügen
              </button>
            </div>
          )}

          {/* HAUPT DATEN */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Name des Produkts</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-2xl focus:border-cyan-500 focus:bg-white transition-all outline-none font-bold text-slate-800" required />
              </div>
              <div className="space-y-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kategorie</label>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setNewCategory(''); }} className="w-full bg-white border-2 border-transparent p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold text-slate-800">
                    <option value="">Wählen...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <input type="text" placeholder="Eigene Kategorie..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-white border-2 border-cyan-100 p-4 rounded-2xl focus:border-cyan-500 outline-none font-black text-[10px] uppercase text-cyan-600 tracking-widest placeholder:text-cyan-200" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Beschreibung</label>
              <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-2xl focus:border-cyan-500 focus:bg-white transition-all outline-none font-medium text-slate-700"></textarea>
            </div>

            {!isClothing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-cyan-50/30 rounded-[2.5rem] border border-cyan-100/50">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-cyan-600 ml-1 tracking-widest italic">Zutaten</label>
                        <textarea rows="3" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="z.B. Mandeln..." className="w-full bg-white p-4 rounded-2xl text-sm font-medium text-slate-700 shadow-sm border-none"></textarea>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-cyan-600 ml-1 tracking-widest italic">Nährwerte</label>
                        <textarea rows="3" value={nutrition} onChange={(e) => setNutrition(e.target.value)} placeholder="Pro 100g..." className="w-full bg-white p-4 rounded-2xl text-sm font-medium text-slate-700 shadow-sm border-none"></textarea>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Preis (€)</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-cyan-50 p-6 rounded-3xl outline-none font-black text-4xl text-cyan-600 shadow-inner border-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Gesamtbestand</label>
                <input 
                    type="number" 
                    value={isClothing ? variants.reduce((acc, v) => acc + Number(v.countInStock || 0), 0) : countInStock} 
                    onChange={(e) => setCountInStock(e.target.value)} 
                    className={`w-full p-6 rounded-3xl outline-none font-black text-slate-900 text-2xl shadow-inner border-none ${isClothing ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-slate-50'}`} 
                    readOnly={isClothing} 
                    required 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 ml-2 italic">Bilder</h3>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 group">
                  <img src={img.startsWith('http') ? img : `https://afghanshop-backend.onrender.com${img}`} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="Vorschau" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-rose-500/80 text-white font-black text-[10px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">LÖSCHEN</button>
                </div>
              ))}
              <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
                <input type="file" multiple onChange={uploadFileHandler} className="hidden" />
              </label>
            </div>
          </div>

          <div className={`p-10 rounded-[3.5rem] text-white shadow-2xl border-b-8 sticky top-10 transition-all duration-500 ${isClothing ? 'bg-indigo-600 border-indigo-900' : 'bg-slate-900 border-cyan-500'}`}>
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 truncate leading-none">{name || 'Produkt'}</h4>
            <p className="text-4xl font-black mb-10">{Number(price).toFixed(2)}€</p>
            
            <button 
                type="submit" 
                disabled={loadingSave}
                className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl transition-all active:scale-95 ${loadingSave ? 'bg-slate-700 animate-pulse' : 'bg-white text-slate-900 hover:bg-cyan-400 hover:text-white'}`}
            >
              {loadingSave ? 'Speichert...' : 'Produkt Speichern'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminProductEdit;