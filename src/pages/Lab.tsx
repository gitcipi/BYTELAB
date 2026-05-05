import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { X, Beef, Wheat, Leaf, Droplets, ChevronDown, Plus, Minus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Toast } from '../components/Toast';
import { INGREDIENTS } from '../data/ingredients';



const RangeSlider = ({ value, min, max, step = 1, onChange, unit = 'G', isDark = false }: any) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-4 pt-2">
      <div className="relative h-12 flex flex-col justify-end">
        <div className="absolute top-0 mb-2" style={{ left: `${percentage}%`, transform: `translateX(-${percentage}%)` }}>
          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border whitespace-nowrap ${isDark ? 'text-accent bg-accent/10 border-accent/20' : 'text-accent bg-accent/5 border-accent/10'}`}>
            {value}{unit}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full h-1 rounded-full appearance-none cursor-pointer accent-accent relative z-10 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}
        />
      </div>
    </div>
  );
};

const ByteLab = ({ currency: initialCurrency }: { currency: string }) => {
  const { addToCart } = useCart();
  const location = useLocation();
  const [currency, setCurrency] = useState(initialCurrency);
  const [activeSlot, setActiveSlot] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const createEmptySlot = () => ({
    name: '',
    desc: '',
    selections: { protein: ['No Protein'], carb: ['No Carbs'], veggies: ['No Veggies'], sauce: ['No Sauce'] } as Record<string, string[]>,
    weights: { protein: {}, carb: {}, veggies: {}, sauce: {} } as Record<string, Record<string, number>>,
    confirmedItems: { protein: [], carb: [], veggies: [], sauce: [] } as Record<string, string[]>,
    activeEditingItem: null as string | null
  });

  const [slots, setSlots] = useState([
    createEmptySlot(),
    createEmptySlot(),
    createEmptySlot()
  ]);

  const currentSlot = slots[activeSlot];
  const { selections, weights, confirmedItems, activeEditingItem } = currentSlot;

  const updateSlot = (updates: any) => {
    setSlots(prev => prev.map((s, i) => {
      if (i !== activeSlot) return s;
      const newSlot = { ...s };
      if (updates.selections) newSlot.selections = { ...s.selections, ...updates.selections };
      if (updates.weights) newSlot.weights = { ...s.weights, ...updates.weights };
      if (updates.confirmedItems) newSlot.confirmedItems = { ...s.confirmedItems, ...updates.confirmedItems };
      if (updates.activeEditingItem !== undefined) newSlot.activeEditingItem = updates.activeEditingItem;
      if (updates.name !== undefined) newSlot.name = updates.name;
      if (updates.desc !== undefined) newSlot.desc = updates.desc;
      return newSlot;
    }));
  };

  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({
    protein: false, carb: false, veggies: false, sauce: false
  });
  const [showSelectedOnly, setShowSelectedOnly] = useState(true);
  const [forcedCat, setForcedCat] = useState<string | null>(null);
  const [weightUnit, setWeightUnit] = useState<'G' | 'OZ'>('G');

  const guiltMessages: Record<string, string> = {
    'No Protein': 'Where are the gains? 🤨',
    'No Carbs': 'Afraid of energy? ⚡️',
    'No Veggies': 'Eat your greens. 🥦',
    'No Sauce': 'Going in dry? Brave soul. 🏜️'
  };

  useEffect(() => {
    setCurrency(initialCurrency);
  }, [initialCurrency]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hasParams = searchParams.has('protein') || searchParams.has('carb');
    const config = hasParams ? {
      protein: JSON.parse(searchParams.get('protein') || '[]'),
      carb: JSON.parse(searchParams.get('carb') || '[]'),
      veggies: JSON.parse(searchParams.get('veggies') || '[]'),
      sauce: JSON.parse(searchParams.get('sauce') || '[]'),
      name: searchParams.get('name'),
      desc: searchParams.get('desc')
    } : location.state?.config;

    if (config) {
      const newSelections: Record<string, string[]> = {};
      const newWeights: Record<string, Record<string, number>> = { protein: {}, carb: {}, veggies: {}, sauce: {} };
      const newConfirmed: Record<string, string[]> = {};

      ['protein', 'carb', 'veggies', 'sauce'].forEach(cat => {
        const catConfig = config[cat] || [];
        if (catConfig.length > 0) {
          newSelections[cat] = catConfig.map((i: any) => i.name);
          catConfig.forEach((i: any) => { newWeights[cat][i.name] = i.weight; });
          newConfirmed[cat] = catConfig.map((i: any) => i.name);
        } else {
          newSelections[cat] = cat === 'sauce' ? ['No Sauce'] : [`No ${cat.charAt(0).toUpperCase() + cat.slice(1).replace('carb', 'Carb')}${cat === 'veggies' ? '' : 's'}`];
          if (newSelections[cat][0] === 'No Proteins') newSelections[cat] = ['No Protein'];
          newConfirmed[cat] = [];
        }
      });

      updateSlot({
        name: location.state?.name || config.name || '',
        desc: location.state?.desc || config.desc || '',
        selections: newSelections,
        weights: newWeights,
        confirmedItems: newConfirmed,
        activeEditingItem: null
      });

      if (hasParams) window.history.replaceState({}, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.search, location.state]);

  const options = { protein: INGREDIENTS.protein, carb: INGREDIENTS.carb, veggies: INGREDIENTS.veggies, sauce: INGREDIENTS.sauce };

  const calculateItemPrice = (cat: string, name: string, weight: number) => {
    if (name.startsWith('No ') || !weight || weight <= 0) return 0;
    const opt = (options[cat as keyof typeof options] as any[]).find((o: any) => o.name === name);
    if (!opt) return 0;
    if (opt.pricing) {
      const tiers = Object.keys(opt.pricing).map(Number).sort((a, b) => a - b);
      if (opt.pricing[weight]) return opt.pricing[weight];
      if (tiers.length === 1) return (opt.pricing[tiers[0]] / tiers[0]) * weight;
      if (weight <= tiers[0]) return (opt.pricing[tiers[0]] / tiers[0]) * weight;
      if (weight >= tiers[tiers.length - 1]) return (opt.pricing[tiers[tiers.length - 1]] / tiers[tiers.length - 1]) * weight;
      
      const lower = [...tiers].reverse().find(t => t < weight) || tiers[0];
      const upper = tiers.find(t => t > weight) || tiers[tiers.length - 1];
      const lp = opt.pricing[lower];
      const up = opt.pricing[upper];
      
      if (upper === lower) return lp;
      return lp + (up - lp) * ((weight - lower) / (upper - lower));
    }
    if (cat === 'veggies') return weight * (opt.tier === 'premium' ? 0.90 / 100 : 0.60 / 100);
    if (cat === 'sauce') {
      if (opt.tier === 'flat') return 0.55;
      const bp = opt.tier === 'tomato' ? { 25: 0.45, 50: 0.75, 75: 1.05, 100: 1.35 } : { 25: 0.55, 50: 0.95, 75: 1.35, 100: 1.70 };
      const tiers = Object.keys(bp).map(Number).sort((a, b) => a - b);
      let price = (bp as any)[weight] || 0;
      if (!price) {
        if (weight <= tiers[0]) price = (bp as any)[tiers[0]];
        else if (weight >= tiers[tiers.length - 1]) price = (bp as any)[tiers[tiers.length - 1]];
        else {
          const lower = [...tiers].reverse().find(t => t < weight) || tiers[0];
          const upper = tiers.find(t => t > weight) || tiers[tiers.length - 1];
          const lp = (bp as any)[lower];
          const up = (bp as any)[upper];
          price = upper === lower ? lp : lp + (up - lp) * ((weight - lower) / (upper - lower));
        }
      }
      return opt.tier === 'premium' ? price + 0.50 : price;
    }
    return 0;
  };

  const toggleSelection = (cat: string, name: string) => {
    const isSkip = name.startsWith('No ');
    const newSelections = { ...selections };
    if (isSkip) newSelections[cat] = [name];
    else {
      const withoutSkip = selections[cat].filter(n => !n.startsWith('No '));
      const defaultSkip = cat === 'protein' ? 'No Protein' : cat === 'carb' ? 'No Carbs' : cat === 'veggies' ? 'No Veggies' : 'No Sauce';
      newSelections[cat] = withoutSkip.includes(name) 
        ? (withoutSkip.filter(n => n !== name).length === 0 ? [defaultSkip] : withoutSkip.filter(n => n !== name)) 
        : [...withoutSkip, name];
    }
    const newConfirmed = { ...confirmedItems };
    if (isSkip) newConfirmed[cat] = [];
    else {
      if (newSelections[cat].includes(name)) {
        // Just selected via circle button, treat as confirmed immediately
        newConfirmed[cat] = [...confirmedItems[cat].filter(n => n !== name), name];
      } else {
        // De-selected, remove from confirmed
        newConfirmed[cat] = confirmedItems[cat].filter(n => n !== name);
      }
    }

    updateSlot({ selections: newSelections, confirmedItems: newConfirmed });
    if (!isSkip) {
      if (forcedCat === cat) setForcedCat(null);
      if (!weights[cat][name]) {
        const opt = options[cat as keyof typeof options].find((o: any) => o.name === name) as any;
        const isPC = opt?.unit === 'PC';
        const defaultWeight = opt?.min || (isPC ? 1 : (cat === 'protein' || cat === 'carb' ? 100 : 50));
        updateSlot({ weights: { ...weights, [cat]: { ...weights[cat], [name]: defaultWeight } } });
      }
    }
  };

  const updateWeight = (cat: string, name: string, weight: number) => updateSlot({ weights: { ...weights, [cat]: { ...weights[cat], [name]: weight } } });
  const confirmItem = (cat: string, name: string) => {
    const opt = (options[cat as keyof typeof options] as any[]).find((o: any) => o.name === name);
    const updates: any = {
      confirmedItems: { ...confirmedItems, [cat]: [...confirmedItems[cat].filter(n => n !== name), name] },
      activeEditingItem: null,
    };
    // If not yet selected, add it with its default weight
    if (!selections[cat].includes(name)) {
      const isPC = opt?.unit === 'PC';
      const defaultWeight = opt?.min || (isPC ? 1 : (cat === 'protein' || cat === 'carb' ? 100 : 50));
      const withoutSkip = selections[cat].filter(n => !n.startsWith('No '));
      updates.selections = { ...selections, [cat]: [...withoutSkip, name] };
      if (forcedCat === cat) setForcedCat(null);
      updates.weights = { ...weights, [cat]: { ...weights[cat], [name]: defaultWeight } };
    }
    updateSlot(updates);
  };
  const removeSelection = (cat: string, name: string) => {
    const ns = selections[cat].filter(n => n !== name);
    const updates: any = {
      selections: { 
        ...selections, 
        [cat]: ns.length === 0 
          ? [cat === 'protein' ? 'No Protein' : cat === 'carb' ? 'No Carbs' : cat === 'veggies' ? 'No Veggies' : 'No Sauce'] 
          : ns 
      },
      confirmedItems: { ...confirmedItems, [cat]: confirmedItems[cat].filter(n => n !== name) },
    };
    // Only close the editing panel if the removed item was the one being edited
    if (activeEditingItem === name) updates.activeEditingItem = null;
    updateSlot(updates);
  };

  const totals = useMemo(() => {
    let p = 0, f = 0, c = 0, cal = 0, subtotal = 0;
    ['protein', 'carb', 'veggies', 'sauce'].forEach(cat => {
      selections[cat].forEach(sel => {
        const weight = weights[cat]?.[sel] || 0;
        const opt = (options[cat as keyof typeof options] as any[]).find((o: any) => o.name === sel);
        if (opt && !sel.startsWith('No ')) {
          const factor = opt.unit === 'PC' ? weight : weight / 100;
          p += opt.p * factor; f += opt.f * factor; c += opt.c * factor; cal += opt.cal * factor;
          subtotal += calculateItemPrice(cat, sel, weight);
        }
      });
    });
    const packagingFee = currency === 'IDR' ? 0.70 : 0.90;
    return { p, f, c, cal, subtotal, packaging: subtotal > 0 ? packagingFee : 0, total: subtotal > 0 ? subtotal + packagingFee : 0 };
  }, [selections, weights, currency]);

  const formatCurrency = (v: number) => {
    const val = isNaN(v) ? 0 : v;
    return currency === 'USD' ? `$${(val * 1.17).toFixed(2)}` : currency === 'IDR' ? `Rp ${(Math.round(val * 20000)).toLocaleString()}` : `€${val.toFixed(2)}`;
  };
  const isBelowMin = totals.subtotal > 0 && totals.total < 2.25;

  const formatWeight = (g: number, unit?: string) => {
    if (unit === 'PC') return `${g} PC`;
    if (weightUnit === 'OZ') return `${(g * 0.035274).toFixed(1)} OZ`;
    return `${g}G`;
  };

  const dynamicMealName = useMemo(() => {
    if (currentSlot.name) return currentSlot.name;
    const p = selections.protein;
    if (p.length === 0 || p.includes('No Protein')) return 'Custom Engineering Build';
    return `${p.join(' & ')} Performance`;
  }, [selections.protein, currentSlot.name]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-8 md:pt-48 md:pb-12 relative overflow-hidden bg-gray-50 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } } }} className="max-w-3xl">
            <span className="text-[10px] font-mono tracking-[0.4em] text-accent-light uppercase mb-4 block">BYTE / LAB</span>
            <h1 className="text-5xl md:text-8xl font-heading font-light tracking-tight mb-6 md:mb-8 text-black">
              The <span className="text-accent-light italic font-medium">Lab.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
              Build your exact meal, gram by gram. <br />
              Your ingredients. Your macros. Your protocol.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-2 pb-10 md:pt-4 md:pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-around gap-2 bg-gray-50/50 p-4 rounded-[32px] border border-black/5">
              {[
                { id: 'protein', label: 'Protein', icon: <Beef size={18} />, color: 'text-accent', bg: 'bg-accent/5' },
                { id: 'carb', label: 'Carbs', icon: <Wheat size={18} />, color: 'text-orange-500', bg: 'bg-orange-500/5' },
                { id: 'veggies', label: 'Veggies', icon: <Leaf size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                { id: 'sauce', label: 'Sauce', icon: <Droplets size={18} />, color: 'text-purple-500', bg: 'bg-purple-500/5' },
              ].map((cat) => (
                <div key={cat.id} className="flex flex-col items-center gap-2">
                  <div className={`p-4 rounded-full ${cat.bg} ${cat.color} border border-black/[0.02]`}>{cat.icon}</div>
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-mono font-bold uppercase tracking-widest ${cat.color}`}>{cat.label}</span>
                    <span className="text-[10px] font-mono text-black/40 uppercase font-medium tracking-tight">{(INGREDIENTS[cat.id as keyof typeof INGREDIENTS] as any[]).length} Choices</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pb-2">
              <div 
                onClick={() => {
                  const nextValue = !showSelectedOnly;
                  setShowSelectedOnly(nextValue);
                  if (!nextValue) setForcedCat(null);
                }}
                className="flex items-center gap-3 cursor-pointer group select-none"
              >
                <div className={`w-10 h-5 rounded-full transition-colors relative ${showSelectedOnly ? 'bg-black' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 left-[2px] transition-transform duration-300 ${showSelectedOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className={`text-xs font-mono font-bold tracking-widest uppercase transition-colors ${showSelectedOnly ? 'text-black' : 'text-black/60 group-hover:text-black/80'}`}>Show Selected</span>
              </div>

              <div className="flex items-center bg-gray-100 rounded-full p-1 border border-black/5">
                {['G', 'OZ'].map(u => (
                  <button 
                    key={u} 
                    onClick={() => setWeightUnit(u as any)} 
                    className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all duration-300 ${
                      weightUnit === u ? 'bg-black text-white shadow-md' : 'text-black/40 hover:text-black/60'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {['protein', 'carb', 'veggies', 'sauce'].map((cat) => {
              let catOptions = INGREDIENTS[cat as keyof typeof INGREDIENTS] as any[];
              if (showSelectedOnly) {
                catOptions = catOptions.filter(opt => {
                  const hasSelections = selections[cat].some(n => !n.startsWith('No '));
                  const isForced = forcedCat === cat;
                  return hasSelections || isForced;
                });
              }

              const isEmpty = catOptions.length === 0 && showSelectedOnly;

              const groupedOptions = (cat === 'protein' || cat === 'carb') && !isEmpty
                ? catOptions.reduce((acc: any, opt: any) => {
                    const sub = opt.subCategory || 'OTHER';
                    if (!acc[sub]) acc[sub] = [];
                    acc[sub].push(opt);
                    return acc;
                  }, {})
                : !isEmpty ? { [cat.toUpperCase()]: catOptions } : {};

              return (
                <div key={cat} id={`cat-${cat}`} className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-black/5 pb-2 cursor-pointer w-fit" onClick={() => setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}>
                    <div className="p-2 rounded-md bg-black text-white">
                      {cat === 'protein' ? <Beef size={14} /> : cat === 'carb' ? <Wheat size={14} /> : cat === 'veggies' ? <Leaf size={14} /> : <Droplets size={14} />}
                    </div>
                    <h2 className="text-base font-heading font-bold tracking-tight text-black uppercase">{cat}</h2>
                    <ChevronDown size={16} className={`transition-transform ${collapsedCats[cat] ? '-rotate-90' : ''}`} />
                  </div>

                  {!collapsedCats[cat] && (
                    <div className="space-y-10">
                      {isEmpty ? (
                        <button
                          onClick={() => setForcedCat(cat)}
                          className="flex items-center gap-3 px-5 py-3 rounded-xl border border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 hover:border-accent transition-all group"
                        >
                          <Plus size={14} className="text-accent group-hover:rotate-90 transition-transform duration-300" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent">Add {cat} choice</span>
                        </button>
                      ) : (
                        Object.entries(groupedOptions).map(([subCat, subOptions]: [string, any]) => (
                          <div key={subCat} className="space-y-4">
                            {(cat === 'protein' || cat === 'carb') && subCat !== 'NONE' && subCat !== 'OTHER' && (
                              <h3 className="text-[10px] font-mono font-bold tracking-[0.3em] text-black uppercase pl-1">{subCat}</h3>
                            )}
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-start">
                              {subOptions.map((opt: any) => {
                              const isSelected = selections[cat].includes(opt.name);
                              const isConfirmed = confirmedItems[cat].includes(opt.name);
                              const isEditing = activeEditingItem === opt.name;

                      return (
                        <div key={opt.name} className={`relative rounded-[24px] border transition-all duration-300 ${isSelected ? 'bg-white border-black/20 shadow-sm' : 'bg-gray-50/80 border-black/5 hover:border-black/10'}`}>
                          <div className="p-6 flex justify-between items-start">
                            <button 
                              onClick={() => {
                                if (opt.name.startsWith('No ')) {
                                  toggleSelection(cat, opt.name);
                                  return;
                                }
                                if (!isEditing && !weights[cat][opt.name]) {
                                  const defaultWeight = opt.min || (opt.unit === 'PC' ? 1 : (cat === 'protein' || cat === 'carb' ? 100 : 50));
                                  updateSlot({ 
                                    activeEditingItem: opt.name,
                                    weights: { ...weights, [cat]: { ...weights[cat], [opt.name]: defaultWeight } }
                                  });
                                } else {
                                  updateSlot({ activeEditingItem: isEditing ? null : opt.name });
                                }
                              }}
                              className="flex-grow text-left"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <h4 className={`text-base font-heading font-medium ${isSelected ? 'text-black' : 'text-black/40'}`}>{opt.name}</h4>
                              </div>
                              <div className="flex items-center gap-3 opacity-80 whitespace-nowrap">
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-black font-bold whitespace-nowrap">
                                    {opt.cal === 0 && guiltMessages[opt.name] ? (
                                      <span className="text-accent italic font-medium tracking-normal normal-case">{guiltMessages[opt.name]}</span>
                                    ) : (
                                      `${weightUnit === 'OZ' && !['PC', 'ML', 'TBSP', 'SPLASH'].includes(opt.unit || '') ? Math.round(opt.cal * 1.134) : opt.cal} KCAL`
                                    )}
                                  </span>
                                {opt.p > 0 && (
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold whitespace-nowrap">
                                    {weightUnit === 'OZ' && !['PC', 'ML', 'TBSP', 'SPLASH'].includes(opt.unit || '') ? Math.round(opt.p * 1.134) : opt.p}P
                                  </span>
                                )}
                                {opt.cal > 0 && <span className="text-[10px] font-mono uppercase tracking-widest text-black font-bold whitespace-nowrap">per {opt.unit || (weightUnit === 'OZ' ? '4 oz' : '100g')}</span>}
                              </div>
                            </button>
                            <div className="flex items-center gap-2">
                              {isSelected && !opt.name.startsWith('No ') && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeSelection(cat, opt.name); }} 
                                  className="p-1.5 rounded-full hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleSelection(cat, opt.name); }} 
                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-black border-black text-white shadow-sm' : 'border-black/10 text-black/20 hover:text-black/40 hover:border-black/20'}`}
                              >
                                {isSelected ? (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <X size={14} className="rotate-45" /> 
                                  </motion.div>
                                ) : (
                                  <Plus size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                          <AnimatePresence>
                            {isEditing && !opt.name.startsWith('No ') && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-black/5 overflow-hidden">
                                <div className="p-5 space-y-5">
                                  {(!opt.min || opt.min !== opt.max) && (
                                    <>
                                      <div className="flex justify-center items-center gap-8 py-2">
                                        <button 
                                          onClick={() => {
                                            const minVal = opt.min || (opt.unit === 'PC' ? 1 : (cat === 'protein' || cat === 'carb' ? 100 : 50));
                                            const step = opt.step || (opt.unit === 'PC' ? 1 : 50);
                                            updateWeight(cat, opt.name, Math.max(minVal, (weights[cat][opt.name] || 0) - step));
                                          }}
                                          className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                                        >
                                          <Minus size={16} />
                                        </button>
                                        
                                        <div className="flex flex-col items-center">
                                          <div className="text-2xl font-mono font-black tracking-tighter">
                                            {weightUnit === 'OZ' && !['PC', 'ML', 'TBSP', 'SPLASH'].includes(opt.unit || '') ? (weights[cat][opt.name] * 0.035274).toFixed(1) : weights[cat][opt.name] || 0}
                                            <span className="text-xs ml-0.5 opacity-60 font-bold">{(!opt.unit || opt.unit === 'G') ? weightUnit : opt.unit}</span>
                                          </div>
                                          <div className="text-[10px] font-mono font-bold text-accent tracking-widest uppercase">
                                            {Math.round(opt.cal * ((weights[cat][opt.name] || 0) / (opt.unit === 'PC' ? 1 : 100)))} KCAL
                                          </div>
                                          {opt.weightPerPc && (
                                            <div className="text-[10px] opacity-20 font-mono font-bold mt-1">
                                              ({(weights[cat][opt.name] || 0) * opt.weightPerPc}G)
                                            </div>
                                          )}
                                        </div>

                                        <button 
                                          onClick={() => {
                                            const maxVal = opt.max || (opt.unit === 'PC' ? 5 : 300);
                                            const step = opt.step || (opt.unit === 'PC' ? 1 : 50);
                                            updateWeight(cat, opt.name, Math.min(maxVal, (weights[cat][opt.name] || 0) + step));
                                          }}
                                          className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                                        >
                                          <Plus size={16} />
                                        </button>
                                      </div>
                                      <RangeSlider 
                                        value={weights[cat][opt.name] || 0} 
                                        min={opt.min || (opt.unit === 'PC' ? 1 : (cat === 'protein' || cat === 'carb' ? 100 : 50))} 
                                        max={opt.max || (opt.unit === 'PC' ? 5 : 300)} 
                                        step={opt.step || (opt.unit === 'PC' ? 1 : 50)} 
                                        unit={opt.unit || 'G'}
                                        onChange={(v: number) => updateWeight(cat, opt.name, v)} 
                                      />
                                    </>
                                  )}
                                  {opt.min !== undefined && opt.min === opt.max && (
                                    <div className="flex justify-between items-center py-2">
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">Portion</span>
                                      <span className="text-[11px] font-mono font-bold">1 {opt.unit || 'Serving'}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center pt-3 border-t border-black/5">
                                    <span className="text-sm font-mono font-bold italic opacity-80">{formatCurrency(calculateItemPrice(cat, opt.name, weights[cat][opt.name]))}</span>
                                    <div className="flex gap-2">
                                      {isConfirmed
                                        ? <button onClick={() => removeSelection(cat, opt.name)} className="px-5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase bg-red-50 text-red-500 hover:bg-red-100 transition-colors">Remove</button>
                                        : <button onClick={() => confirmItem(cat, opt.name)} className="px-5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase bg-accent/10 text-accent">Confirm</button>
                                      }
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    })}
        </div>

          <div className="lg:col-span-4 relative">
            <div className="flex bg-gray-100/50 rounded-full p-1 border border-black/5 mb-4 w-full">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  onClick={() => setActiveSlot(i)}
                  className={`flex-1 py-2 rounded-full text-[10px] font-mono font-bold transition-all ${activeSlot === i ? 'bg-black text-white shadow-md' : 'text-black/40 hover:text-black'}`}
                >
                  MEAL {i + 1}
                </button>
              ))}
            </div>
            <div className="lg:sticky lg:top-24 bg-white rounded-[32px] border border-black/10 p-6 md:p-8 shadow-lg flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-heading font-medium text-black">Custom BYTE Meal #{activeSlot + 1}</h3>
                </div>
                <div className="flex gap-3 text-[9px] font-mono font-bold">
                  {['EUR', 'USD', 'IDR'].map(curr => (
                    <button key={curr} onClick={() => setCurrency(curr)} className={`transition-colors ${currency === curr ? 'text-accent' : 'text-black/20 hover:text-black/40'}`}>
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 py-6 border-y border-black/5">
                <div className="space-y-0.5"><span className="block text-[8px] font-mono text-black font-bold uppercase tracking-widest opacity-60">Kcal</span><span className="text-sm md:text-lg font-mono text-black leading-none font-bold">{Math.round(totals.cal)}</span></div>
                <div className="space-y-0.5"><span className="block text-[8px] font-mono text-accent font-bold uppercase tracking-widest">Prot</span><span className="text-sm md:text-lg font-mono text-accent leading-none font-bold">{Math.round(totals.p)}G</span></div>
                <div className="space-y-0.5"><span className="block text-[8px] font-mono text-orange-500 font-bold uppercase tracking-widest">Carb</span><span className="text-sm md:text-lg font-mono text-orange-500 leading-none font-bold">{Math.round(totals.c)}G</span></div>
                <div className="space-y-0.5"><span className="block text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Fat</span><span className="text-sm md:text-lg font-mono text-emerald-500 leading-none font-bold">{Math.round(totals.f)}G</span></div>
              </div>
              <div className="space-y-3 py-4 overflow-y-auto flex-grow custom-scrollbar">
                {['protein', 'carb', 'veggies', 'sauce'].map(cat => {
                  const items = selections[cat].filter(sel => !sel.startsWith('No '));
                  if (items.length === 0) {
                    return (
                      <button
                        key={`add-${cat}`}
                        onClick={() => {
                          document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="w-full py-2 px-4 rounded-xl border border-dashed border-accent/20 bg-accent/5 hover:border-accent/40 hover:bg-accent/10 transition-all group flex items-center justify-between"
                      >
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-accent group-hover:text-accent transition-colors">Add {cat}</span>
                        <Plus size={10} className="text-accent transition-colors" />
                      </button>
                    );
                  }
                  return items.map(sel => {
                    const unit = (options[cat as keyof typeof options] as any[]).find(o => o.name === sel)?.unit || 'G';
                    const o = (options[cat as keyof typeof options] as any[]).find(o => o.name === sel);
                    const weightTotal = o?.weightPerPc ? (weights[cat][sel] * o.weightPerPc) : weights[cat][sel];
                    const kcal = o ? Math.round(o.cal * (weights[cat][sel] / (o.unit === 'PC' ? 1 : 100))) : 0;

                    return (
                      <div key={`${cat}-${sel}`} className="flex justify-between items-start text-[11px] font-mono py-3 border-b border-black/5 last:border-0 group gap-2">
                        <div className="flex-grow min-w-0">
                          <span className="text-black font-bold uppercase leading-tight">{sel}</span>
                        <span className="text-[10px] text-black/50 mt-0.5 whitespace-nowrap">
                          {formatWeight(weights[cat][sel], (options[cat as keyof typeof options] as any[]).find(o => o.name === sel)?.unit)}
                          {(() => {
                            const o = (options[cat as keyof typeof options] as any[]).find(o => o.name === sel);
                            return o?.weightPerPc ? ` (${formatWeight(weights[cat][sel] * o.weightPerPc)})` : '';
                          })()}
                            {kcal} KCAL
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 pt-0.5">
                          <span className="text-black font-bold whitespace-nowrap">{formatCurrency(calculateItemPrice(cat, sel, weights[cat][sel]))}</span>
                          <button 
                            onClick={() => removeSelection(cat, sel)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
              <div className="pt-6 border-t border-black/10 mt-auto">
                {totals.subtotal > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-black/60 font-bold uppercase tracking-wider">Service & Packaging</span>
                      <span className="text-[10px] font-mono font-bold text-black/80">{formatCurrency(totals.packaging)}</span>
                    </div>
                    <span className="block text-[8px] font-mono text-black font-bold uppercase tracking-tight mt-1 leading-none italic opacity-60">Includes a tupperware microwave safe</span>
                  </div>
                )}
                <div className="flex justify-between items-end mb-6"><div><span className="text-[10px] font-mono text-black/60 font-bold uppercase block">Total</span><span className="text-2xl md:text-4xl font-mono text-black font-bold">{formatCurrency(totals.total)}</span></div></div>
                <button 
                  onClick={() => { 
                    const fullConfig = {
                      protein: selections.protein.filter(n => !n.startsWith('No ')).map(name => ({ name, weight: weights.protein[name] || 100 })),
                      carb: selections.carb.filter(n => !n.startsWith('No ')).map(name => ({ name, weight: weights.carb[name] || 100 })),
                      veggies: selections.veggies.filter(n => !n.startsWith('No ')).map(name => ({ name, weight: weights.veggies[name] || 50 })),
                      sauce: selections.sauce.filter(n => !n.startsWith('No ')).map(name => ({ name, weight: weights.sauce[name] || 50 })),
                      name: dynamicMealName
                    };
                    
                    addToCart({ 
                      id: `lab-${Date.now()}`, 
                      name: dynamicMealName, 
                      price: totals.total, 
                      quantity: 1, 
                      type: 'lab', 
                      details: fullConfig 
                    }); 
                    setShowToast(true);
                    
                    // Reset current slot after successful addition
                    updateSlot(createEmptySlot());
                  }} 
                  disabled={totals.subtotal === 0 || isBelowMin} 
                  className="w-full py-5 bg-black text-white rounded-2xl text-xs font-mono font-bold tracking-[0.2em] uppercase shadow-xl disabled:opacity-20 transition-all hover:bg-accent active:scale-95"
                >
                  Add to Basket
                </button>
                <button 
                  onClick={() => updateSlot(createEmptySlot())}
                  className="w-full mt-3 py-3 border border-black/10 rounded-2xl text-[8px] font-mono font-bold tracking-[0.2em] uppercase text-black/40 hover:text-red-500 hover:border-red-500/20 hover:bg-red-50 transition-all active:scale-95"
                >
                  Reset Meal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>{showToast && <Toast message="Added to basket" isVisible={showToast} onClose={() => setShowToast(false)} />}</AnimatePresence>
    </div>
  );
};

const Lab = () => {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'EUR');
  useEffect(() => {
    const cb = () => setCurrency(localStorage.getItem('currency') || 'EUR');
    window.addEventListener('currencyChange', cb);
    return () => window.removeEventListener('currencyChange', cb);
  }, []);
  return (
    <ByteLab currency={currency} />
  );
};

export default Lab;
