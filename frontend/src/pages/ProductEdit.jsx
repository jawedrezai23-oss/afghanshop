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

  // --- PFAND OPTION (FIX 0.25) ---
  const [isDeposit, setIsDeposit] = useState(false);
  const [depositValue, setDepositValue] = useState(0.25);

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
  const [isOnePlusOne, setIsOnePlusOne] = useState(false);
  const [deliveryType, setDeliveryType] = useState('all'); 

  // --- STAFFELPREISE (FEUER STECKER) ---
  const [tierPrices, setTierPrices] = useState([]); 

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
      setIsClothing(false); 
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
          setIsOnePlusOne(data.isOnePlusOne || false);
          setDeliveryType(data.deliveryType || 'all');
          setIsDeposit(data.isDeposit === true);
          setDepositValue(0.25); // Immer Fix 0.25
          setIsClothing(data.isClothing || false);
          setVariants(data.variants || []);
          setTierPrices(data.tierPrices || []);
        } catch (err) { console.error("Fehler beim Laden:", err); }
      };
      fetchProduct();
    }
  }, [id]);

  // VARIANTEN FUNKTIONEN
  const addVariant = () => setVariants([...variants, { size: '', color: '', countInStock: 0 }]);
  const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));
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

  const removeFromBundle = (prodId) => setBundleItems(bundleItems.filter(x => x.product !== prodId));
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
    } catch (error) {
      alert("Bild-Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

  const submitHandler = async (e) => {
    if (e) e.preventDefault();
    setLoadingSave(true);
    const finalCategory = newCategory.trim() !== "" ? newCategory : category;
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
        isOnePlusOne, 
        deliveryType, 
        isDeposit: Boolean(isDeposit),
        depositValue: isDeposit ? 0.25 : 0,
        isFresh: finalCategory === "Frische Lebensmittel" || deliveryType === 'local',
        isClothing,
        variants: isClothing ? variants : [],
        tierPrices // Staffelpreise mitsenden
      };

      if (id) { await api.put(`/products/${id}`, productData); } 
      else { await api.post('/products', productData); }
      navigate('/admin/products');
    } catch (err) {
      alert(err.response?.data?.message || 'Fehler beim Speichern');
    } finally { setLoadingSave(false); }
  };

  const showDepositOption = category === 'Getränke' || newCategory.toLowerCase().includes('getränk');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans bg-slate-50 min-h-screen">
      {/* Header Bereich */}
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
            <div className="flex items-center gap-3 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <span className={`text-[10px] font-black uppercase ${isBundle ? 'text-cyan-500' : 'text-slate-400'}`}>🎁 Bundle</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isBundle} onChange={(e) => setIsBundle(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-cyan-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
            </div>
        </div>
      </div>

      <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
        <div className="lg:col-span-8 space-y-8">
          
          {/* BUNDLE SEKTION */}
          {isBundle && (
            <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl space-y-8 border-b-8 border-cyan-500 relative overflow-hidden text-left">
                <div className="flex justify-between items-end relative z-10 text-left">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">🎁</div>
                        <h3 className="text-white text-2xl font-black uppercase tracking-tighter text-left">Bundle Inhalt</h3>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 px-6 py-3 rounded-2xl text-right">
                        <p className="text-3xl font-black text-white">{calculateBundleTotal().toFixed(2)} €</p>
                    </div>
                </div>
                <input type="text" placeholder="Produkt suchen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 p-6 rounded-3xl text-white outline-none" />
                {searchResults.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden z-50">
                        {searchResults.map(p => (
                            <div key={p._id} onClick={() => addToBundle(p)} className="p-5 hover:bg-cyan-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0">
                                <span className="font-black text-slate-800 uppercase">{p.name}</span>
                                <span className="bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">+</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bundleItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50">
                            <span className="text-white font-black text-xs uppercase truncate pr-4">{item.name}</span>
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => updateBundleQty(item.product, item.qty - 1)} className="text-white">-</button>
                                <span className="text-white">{item.qty}</span>
                                <button type="button" onClick={() => updateBundleQty(item.product, item.qty + 1)} className="text-white">+</button>
                                <button type="button" onClick={() => removeFromBundle(item.product)} className="text-rose-500">✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* KLEIDUNGS VARIANTEN */}
          {isClothing && (
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-indigo-100 shadow-xl space-y-6">
              <h3 className="text-indigo-900 text-xl font-black uppercase">Größen & Farben</h3>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                    <input type="text" value={variant.size} placeholder="Größe" onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="p-3 rounded-xl border-none font-bold" />
                    <input type="text" value={variant.color} placeholder="Farbe" onChange={(e) => handleVariantChange(index, 'color', e.target.value)} className="p-3 rounded-xl border-none font-bold" />
                    <input type="number" value={variant.countInStock} onChange={(e) => handleVariantChange(index, 'countInStock', e.target.value)} className="p-3 rounded-xl border-none font-black" />
                    <button type="button" onClick={() => removeVariant(index)} className="bg-white text-rose-500 py-3 rounded-xl font-black uppercase">Entfernen</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addVariant} className="w-full border-2 border-indigo-200 border-dashed p-5 rounded-[2rem] text-indigo-500 font-black">+ Variante</button>
            </div>
          )}

          {/* HAUPT DATEN BLOCK */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Produktname</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-bold text-left" required />
              </div>
              <div className="space-y-4">
                <select value={category} onChange={(e) => { setCategory(e.target.value); setNewCategory(''); }} className="w-full bg-slate-50 p-5 rounded-2xl font-bold">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input type="text" placeholder="Eigene Kategorie..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-white border-2 border-cyan-100 p-4 rounded-2xl font-black" />
              </div>
            </div>

            <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beschreibung" className="w-full bg-slate-50 p-5 rounded-2xl outline-none font-medium text-left"></textarea>

            {/* EINHEIT & GEWICHT */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 rounded-3xl">
                <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase text-slate-400">Einheit</label>
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-4 rounded-xl border-none font-bold">
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
                <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase text-slate-400">Größe / Gewicht</label>
                    <input type="number" value={unitSize} onChange={(e) => setUnitSize(e.target.value)} className="w-full p-4 rounded-xl border-none font-bold" placeholder="500" />
                </div>
            </div>

            {/* LMIV FÜR LEBENSMITTEL */}
            {!isClothing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-cyan-50/30 rounded-[2.5rem] border border-cyan-100/50">
                    <textarea rows="3" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Zutaten" className="w-full bg-white p-4 rounded-2xl text-sm text-left"></textarea>
                    <textarea rows="3" value={nutrition} onChange={(e) => setNutrition(e.target.value)} placeholder="Nährwerte" className="w-full bg-white p-4 rounded-2xl text-sm text-left"></textarea>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Preis (€)</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-cyan-50 p-6 rounded-3xl font-black text-4xl text-cyan-600" required />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bestand</label>
                <input type="number" value={isClothing ? variants.reduce((acc, v) => acc + Number(v.countInStock || 0), 0) : countInStock} onChange={(e) => setCountInStock(e.target.value)} className={`w-full p-6 rounded-3xl font-black text-2xl ${isClothing ? 'bg-slate-200' : 'bg-slate-50'}`} readOnly={isClothing} required />
              </div>
            </div>

            {/* MARKETING SEKTION */}
            <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 space-y-6 text-left">
                <div className="flex items-center justify-between">
                    <h4 className="text-amber-800 font-black text-xs uppercase">Marketing Aktionen</h4>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isPromotion} onChange={(e) => setIsPromotion(e.target.checked)} />
                            <span className="text-[10px] font-black uppercase italic">Promotion</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isOnePlusOne} onChange={(e) => setIsOnePlusOne(e.target.checked)} />
                            <span className="text-[10px] font-black uppercase italic">1+1 Gratis</span>
                        </label>
                    </div>
                </div>
                {isPromotion && (
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" step="0.01" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="Alter Preis" className="bg-white p-3 rounded-xl font-bold line-through" />
                        <input type="text" value={promotionLabel} onChange={(e) => setPromotionLabel(e.target.value)} placeholder="SALE Label" className="bg-white p-3 rounded-xl font-bold text-amber-600" />
                    </div>
                )}
            </div>

            {/* NEU: STAFFELPREISE (FEUER STECKER) */}
            <div className="p-8 bg-orange-50 rounded-[2.5rem] border border-orange-100 space-y-4 text-left">
                <div className="flex justify-between items-center">
                    <p className="text-orange-700 font-black text-xs uppercase italic">🔥 Mengenrabatte (Staffelpreise)</p>
                    <button 
                        type="button" 
                        onClick={() => setTierPrices([...tierPrices, { qty: 2, price: 0 }])}
                        className="bg-orange-500 text-white text-[10px] px-4 py-2 rounded-full font-black hover:bg-orange-600 transition-colors"
                    >
                        + STAFFEL HINZUFÜGEN
                    </button>
                </div>
                
                <div className="space-y-3">
                    {tierPrices.map((tier, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Ab</span>
                            <input 
                                type="number" 
                                value={tier.qty} 
                                onChange={(e) => {
                                    const newTiers = [...tierPrices];
                                    newTiers[index].qty = Number(e.target.value);
                                    setTierPrices(newTiers);
                                }}
                                className="w-16 bg-slate-50 p-2 rounded-lg font-black text-center outline-none" 
                            />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Stk. je</span>
                            <div className="relative flex-1">
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={tier.price} 
                                    onChange={(e) => {
                                        const newTiers = [...tierPrices];
                                        newTiers[index].price = Number(e.target.value);
                                        setTierPrices(newTiers);
                                    }}
                                    className="w-full bg-orange-50 p-2 rounded-lg font-black text-orange-600 outline-none" 
                                    placeholder="Preis"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-xs">€</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setTierPrices(tierPrices.filter((_, i) => i !== index))}
                                className="text-rose-500 font-black px-2"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* PFAND OPTION (FIXED 0.25) */}
            {showDepositOption && (
                <div className={`p-8 rounded-[2.5rem] border transition-all flex items-center justify-between text-left ${isDeposit ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="flex items-center gap-4 text-left">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${isDeposit ? 'bg-blue-500' : 'bg-white'}`}>♻️</div>
                        <div>
                            <p className={`font-black text-xs uppercase ${isDeposit ? 'text-white' : 'text-blue-900'}`}>Pfand hinzufügen</p>
                            <p className={`text-[10px] font-bold ${isDeposit ? 'text-blue-200' : 'text-blue-400'}`}>Standard-Satz: 0,25 €</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {isDeposit && <span className="text-white font-black text-xl">0,25 €</span>}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isDeposit} 
                                onChange={(e) => setIsDeposit(e.target.checked)} 
                                className="sr-only peer" 
                            />
                            <div className={`w-14 h-7 rounded-full peer transition-all after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7 ${isDeposit ? 'bg-blue-400' : 'bg-slate-200'}`}></div>
                        </label>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* SIDEBAR FÜR BILDER & SPEICHERN */}
        <div className="lg:col-span-4 space-y-8 text-left">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6">Produkt Bilder</h3>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 group">
                  <img src={img.startsWith('http') ? img : `https://afghanshop-backend.onrender.com${img}`} className="w-full h-full object-contain" alt="Vorschau" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-rose-500/80 text-white font-black opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">LÖSCHEN</button>
                </div>
              ))}
              <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400">
                <span className="text-2xl">📸</span>
                <input type="file" multiple onChange={uploadFileHandler} className="hidden" />
              </label>
            </div>
          </div>

          <div className={`p-10 rounded-[3.5rem] text-white shadow-2xl sticky top-10 text-left ${isClothing ? 'bg-indigo-600' : 'bg-slate-900'}`}>
            <h4 className="text-2xl font-black uppercase truncate mb-2">{name || 'Produkt'}</h4>
            <div className="mb-10">
                <p className="text-4xl font-black">{Number(price).toFixed(2)}€</p>
                {isDeposit && <p className="text-xs font-bold text-cyan-400">inkl. Pfand: +0,25€</p>}
            </div>
            <button type="submit" disabled={loadingSave} className="w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest bg-white text-slate-900 hover:bg-cyan-400 hover:text-white transition-all shadow-xl">
              {loadingSave ? 'Speichert...' : 'Produkt Speichern'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminProductEdit;