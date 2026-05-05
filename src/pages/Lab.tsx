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
        <div className="absolute top-0 mb-2" style={{ left: `calc(${percentage}% - 12px)` }}>
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
    selections: { protein: ['Skip'], carb: ['Skip'], veggies: ['Skip'], sauce: ['No Sauce'] } as Record<string, string[]>,
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
        const items = config[cat];
        if (items && items.length > 0) {
          newSelections[cat] = items.map((i: any) => i.name);
          newConfirmed[cat] = items.map((i: any) => i.name);
          items.forEach((i: any) => { newWeights[cat][i.name] = i.weight; });
        } else {
          newSelections[cat] = [cat === 'sauce' ? 'No Sauce' : 'Skip'];
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
    if (name === 'Skip' || name === 'No Sauce') return 0;
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
    const isSkip = name === 'Skip' || name === 'No Sauce';
    const newSelections = { ...selections };
    if (isSkip) newSelections[cat] = [name];
    else {
      const withoutSkip = selections[cat].filter(n => n !== 'Skip' && n !== 'No Sauce');
      newSelections[cat] = withoutSkip.includes(name) ? (withoutSkip.filter(n => n !== name).length === 0 ? (cat === 'sauce' ? ['No Sauce'] : ['Skip']) : withoutSkip.filter(n => n !== name)) : [...withoutSkip, name];
    }
    updateSlot({ selections: newSelections });
    if (!isSkip) {
      if (!weights[cat][name]) {
        const opt = options[cat as keyof typeof options].find((o: any) => o.name === name) as any;
        const isPC = opt?.unit === 'PC';
        const defaultWeight = opt?.min || (isPC ? 1 : (cat === 'protein' || cat === 'carb' ? 100 : 50));
        updateSlot({ weights: { ...weights, [cat]: { ...weights[cat], [name]: defaultWeight } } });
      }
    }
  };

  const updateWeight = (cat: string, name: string, weight: number) => updateSlot({ weights: { ...weights, [cat]: { ...weights[cat], [name]: weight } } });
  const confirmItem = (cat: string, name: string) => updateSlot({ confirmedItems: { ...confirmedItems, [cat]: [...confirmedItems[cat], name] }, activeEditingItem: null });
  const removeSelection = (cat: string, name: string) => {
    const ns = selections[cat].filter(n => n !== name);
    updateSlot({ selections: { ...selections, [cat]: ns.length === 0 ? (cat === 'sauce' ? ['No Sauce'] : ['Skip']) : ns }, confirmedItems: { ...confirmedItems, [cat]: confirmedItems[cat].filter(n => n !== name) }, activeEditingItem: null });
  };

  const totals = useMemo(() => {
    let p = 0, f = 0, c = 0, cal = 0, subtotal = 0;
    ['protein', 'carb', 'veggies', 'sauce'].forEach(cat => {
      selections[cat].forEach(sel => {
        const weight = weights[cat]?.[sel] || 0;
        const opt = (options[cat as keyof typeof options] as any[]).find((o: any) => o.name === sel);
        if (opt && sel !== 'Skip' && sel !== 'No Sauce') {
          const factor = opt.unit === 'PC' ? weight : weight / 100;
          p += opt.p * factor; f += opt.f * factor; c += opt.c * factor; cal += opt.cal * factor;
          subtotal += calculateItemPrice(cat, sel, weight);
        }
      });
    });
    return { p, f, c, cal, subtotal, packaging: subtotal > 0 ? 0.90 : 0, total: subtotal > 0 ? subtotal + 0.90 : 0 };
  }, [selections, weights]);

  const formatCurrency = (v: number) => currency === 'USD' ? `$${(v * 1.17).toFixed(2)}` : currency === 'IDR' ? `Rp ${(Math.round(v * 20000)).toLocaleString()}` : `€${v.toFixed(2)}`;
  const isBelowMin = totals.subtotal > 0 && totals.total < 2.25;

  const dynamicMealName = useMemo(() => {
    if (currentSlot.name) return currentSlot.name;
    const p = selections.protein;
    if (p.length === 0 || p.includes('Skip')) return 'Custom Engineering Build';
    return `${p.join(' & ')} Performance Bowl`;
  }, [selections.protein, currentSlot.name]);

  return (
    <div className="section-padding pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono tracking-[0.4em] text-accent uppercase font-bold">Byte / Lab</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-medium tracking-tight text-black">{dynamicMealName}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-around gap-2 bg-gray-50/50 p-4 rounded-[32px] border border-black/5">
              {[
                { id: 'protein', label: 'Protein', icon: <Beef size={18} />, color: 'text-accent', bg: 'bg-accent/5' },
                { id: 'carb', label: 'Carbs', icon: <Wheat size={18} />, color: 'text-orange-500', bg: 'bg-orange-500/5' },
                { id: 'veggies', label: 'Veggies', icon: <Leaf size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                { id: 'sauce', label: 'Sauce', icon: <Droplets size={18} />, color: 'text-purple-500', bg: 'bg-purple-500/5' },
              ].map((cat) => (
                <div key={cat.id} className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full ${cat.bg} ${cat.color} border border-black/[0.02]`}>{cat.icon}</div>
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${cat.color}`}>{cat.label}</span>
                    <span className="text-[9px] font-mono text-black/40 uppercase font-medium tracking-tight">{(options[cat.id as keyof typeof options] as any[]).length} Choices</span>
                  </div>
                </div>
              ))}
            </div>

            {['protein', 'carb', 'veggies', 'sauce'].map((cat) => {
              const catOptions = options[cat as keyof typeof options] as any[];
              const groupedOptions = cat === 'protein' 
                ? catOptions.reduce((acc: any, opt: any) => {
                    const sub = opt.subCategory || 'OTHER';
                    if (!acc[sub]) acc[sub] = [];
                    acc[sub].push(opt);
                    return acc;
                  }, {})
                : { [cat.toUpperCase()]: catOptions };

              return (
                <div key={cat} className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-black/5 pb-2 cursor-pointer w-fit" onClick={() => setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}>
                    <div className="p-1.5 rounded-md bg-black text-white">
                      {cat === 'protein' ? <Beef size={12} /> : cat === 'carb' ? <Wheat size={12} /> : cat === 'veggies' ? <Leaf size={12} /> : <Droplets size={12} />}
                    </div>
                    <h2 className="text-sm font-heading font-bold tracking-tight text-black uppercase">{cat}</h2>
                    <ChevronDown size={14} className={`transition-transform ${collapsedCats[cat] ? '-rotate-90' : ''}`} />
                  </div>

                  {!collapsedCats[cat] && (
                    <div className="space-y-10">
                      {Object.entries(groupedOptions).map(([subCat, subOptions]: [string, any]) => (
                        <div key={subCat} className="space-y-4">
                          {cat === 'protein' && subCat !== 'NONE' && subCat !== 'OTHER' && (
                            <h3 className="text-[10px] font-mono font-bold tracking-[0.3em] text-black uppercase pl-1">{subCat}</h3>
                          )}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                            {subOptions.map((opt: any) => {
                              const isSelected = selections[cat].includes(opt.name);
                              const isConfirmed = confirmedItems[cat].includes(opt.name);
                              const isEditing = activeEditingItem === opt.name;

                      return (
                        <div key={opt.name} className={`relative rounded-[24px] border transition-all duration-300 ${isSelected ? 'bg-white border-black/20 shadow-sm' : 'bg-gray-50/80 border-black/5 hover:border-black/10'}`}>
                          <div className="p-5 flex justify-between items-start">
                            <button 
                              onClick={() => {
                                if (!isSelected) toggleSelection(cat, opt.name);
                                updateSlot({ activeEditingItem: isEditing ? null : opt.name });
                              }}
                              className="flex-grow text-left"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm font-heading font-medium ${isSelected ? 'text-black' : 'text-black/40'}`}>{opt.name}</h4>
                                {isConfirmed && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                              </div>
                              <div className="flex items-center gap-2 opacity-80">
                                <span className="text-[8px] font-mono uppercase tracking-widest text-black/50 font-bold">{opt.cal} KCAL</span>
                                {opt.p > 0 && <span className="text-[8px] font-mono uppercase tracking-widest text-accent font-bold">{opt.p}P</span>}
                                <span className="text-[8px] font-mono uppercase tracking-widest text-black/30 font-medium">per {opt.unit || '100g'}</span>
                              </div>
                            </button>
                            <div className="flex items-center gap-2">
                              {isSelected && opt.name !== 'Skip' && opt.name !== 'No Sauce' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeSelection(cat, opt.name); }} 
                                  className="p-1.5 rounded-full hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              )}
                              <button 
                                onClick={() => toggleSelection(cat, opt.name)} 
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
                            {isEditing && isSelected && opt.name !== 'Skip' && opt.name !== 'No Sauce' && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-black/5 overflow-hidden">
                                <div className="p-5 space-y-5">
                                  {opt.max !== 1 && (
                                    <>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-40">Quantity</span>
                                        <div className="flex items-center gap-3">
                                          <button onClick={() => {
                                            const minVal = opt.min || (opt.unit === 'PC' ? 1 : (cat === 'protein' || cat === 'carb' ? 100 : 50));
                                            const step = opt.step || (opt.unit === 'PC' ? 1 : 50);
                                            updateWeight(cat, opt.name, Math.max(minVal, (weights[cat][opt.name] || 0) - step));
                                          }}><Minus size={14} /></button>
                                          <span className="text-base font-mono font-bold">
                                            {weights[cat][opt.name] || 0}
                                            <span className="text-[10px] ml-0.5 opacity-40">{opt.unit || 'G'}</span>
                                            {opt.weightPerPc && (
                                              <span className="text-[9px] ml-1.5 opacity-30">({(weights[cat][opt.name] || 0) * opt.weightPerPc}G)</span>
                                            )}
                                          </span>
                                          <button onClick={() => {
                                            const maxVal = opt.max || (opt.unit === 'PC' ? 5 : 400);
                                            const step = opt.step || (opt.unit === 'PC' ? 1 : 50);
                                            updateWeight(cat, opt.name, Math.min(maxVal, (weights[cat][opt.name] || 0) + step));
                                          }}><Plus size={14} /></button>
                                        </div>
                                      </div>
                                      <RangeSlider 
                                        value={weights[cat][opt.name] || 0} 
                                        min={opt.min || (opt.unit === 'PC' ? 1 : (cat === 'protein' || cat === 'carb' ? 100 : 50))} 
                                        max={opt.max || (opt.unit === 'PC' ? 5 : 400)} 
                                        step={opt.step || (opt.unit === 'PC' ? 1 : 50)} 
                                        unit={opt.unit || 'G'}
                                        onChange={(v: number) => updateWeight(cat, opt.name, v)} 
                                      />
                                    </>
                                  )}
                                  {opt.max === 1 && opt.weightPerPc && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-40">Portion</span>
                                      <span className="text-[10px] font-mono font-bold">{opt.weightPerPc}G Serving</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center pt-3 border-t border-black/5">
                                    <span className="text-base font-mono font-bold">{formatCurrency(calculateItemPrice(cat, opt.name, weights[cat][opt.name]))}</span>
                                    <div className="flex gap-2">
                                      <button onClick={() => updateSlot({ activeEditingItem: null })} className="px-4 py-1.5 rounded-lg text-[8px] font-mono font-bold uppercase border border-black/10 hover:bg-gray-100">Minimize</button>
                                      <button onClick={() => confirmItem(cat, opt.name)} className={`px-4 py-1.5 rounded-lg text-[8px] font-mono font-bold uppercase ${isConfirmed ? 'bg-black text-white' : 'bg-accent/10 text-accent'}`}>{isConfirmed ? 'Confirmed' : 'Confirm'}</button>
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
              ))}
            </div>
          )}
        </div>
      );
    })}
          </div>

          <div className="lg:col-span-4 relative">
            <div className="flex bg-gray-100/50 rounded-full p-1 border border-black/5 mb-4 w-full justify-center">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  onClick={() => setActiveSlot(i)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold transition-all ${activeSlot === i ? 'bg-black text-white shadow-md' : 'text-black/40 hover:text-black'}`}
                >
                  MEAL {i + 1}
                </button>
              ))}
            </div>
            <div className="lg:sticky lg:top-24 bg-white rounded-[32px] border border-black/10 p-8 shadow-lg flex flex-col max-h-[80vh]">
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
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-black/5">
                <div className="space-y-0.5"><span className="block text-[8px] font-mono text-black font-bold uppercase tracking-widest opacity-40">Kcal.</span><span className="text-xl font-mono text-black leading-none">{Math.round(totals.cal)}</span></div>
                <div className="space-y-0.5"><span className="block text-[8px] font-mono text-accent font-bold uppercase tracking-widest">Protein</span><span className="text-xl font-mono text-accent leading-none">{Math.round(totals.p)}G</span></div>
                <div className="space-y-0.5"><span className="block text-[8px] font-mono text-orange-500 font-bold uppercase tracking-widest">Carbs</span><span className="text-xl font-mono text-orange-500 leading-none">{Math.round(totals.c)}G</span></div>
                <div className="space-y-0.5"><span className="block text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Fats</span><span className="text-xl font-mono text-emerald-500 leading-none">{Math.round(totals.f)}G</span></div>
              </div>
              <div className="space-y-2 py-4 overflow-y-auto flex-grow custom-scrollbar">
                {['protein', 'carb', 'veggies', 'sauce'].flatMap(cat => 
                  selections[cat]
                    .filter(sel => sel !== 'Skip' && sel !== 'No Sauce')
                    .map(sel => (
                      <div key={`${cat}-${sel}`} className="flex justify-between items-center text-[10px] font-mono py-1.5 border-b border-black/5 last:border-0 group">
                        <div className="flex items-center gap-1.5">
                          <span className="text-black font-bold uppercase">{sel}</span>
                          <span className="text-[9px] opacity-30">
                            {weights[cat][sel]}
                            {(options[cat as keyof typeof options] as any[]).find(o => o.name === sel)?.unit || 'G'}
                            {(() => {
                              const o = (options[cat as keyof typeof options] as any[]).find(o => o.name === sel);
                              return o?.weightPerPc ? ` (${weights[cat][sel] * o.weightPerPc}G)` : '';
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-black font-bold">{formatCurrency(calculateItemPrice(cat, sel, weights[cat][sel]))}</span>
                          <button 
                            onClick={() => removeSelection(cat, sel)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
              <div className="pt-6 border-t border-black/10 mt-auto">
                {totals.subtotal > 0 && (
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-mono text-black/40 font-bold uppercase tracking-wider">Service & Packaging</span>
                    <span className="text-[10px] font-mono font-bold text-black/60">{formatCurrency(0.90)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end mb-6"><div><span className="text-[8px] font-mono text-black/40 font-bold uppercase block">Total</span><span className="text-3xl font-mono text-black font-bold">{formatCurrency(totals.total)}</span></div></div>
                <button 
                  onClick={() => { 
                    const fullConfig = {
                      protein: selections.protein.filter(n => n !== 'Skip').map(name => ({ name, weight: weights.protein[name] || 100 })),
                      carb: selections.carb.filter(n => n !== 'Skip').map(name => ({ name, weight: weights.carb[name] || 100 })),
                      veggies: selections.veggies.filter(n => n !== 'Skip').map(name => ({ name, weight: weights.veggies[name] || 50 })),
                      sauce: selections.sauce.filter(n => n !== 'No Sauce').map(name => ({ name, weight: weights.sauce[name] || 50 })),
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
                  className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-mono font-bold tracking-[0.2em] uppercase shadow-xl disabled:opacity-20 transition-all hover:bg-accent active:scale-95"
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
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ByteLab currency={currency} />
      </div>
    </div>
  );
};

export default Lab;
