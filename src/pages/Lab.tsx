import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';


const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
};

const RangeSlider = ({ label, value, min, max, onChange, unit = 'G' }: any) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono tracking-widest text-black/40 uppercase font-bold">Fine Tune / {label}</span>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            value={value}
            onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
            className="w-16 bg-transparent border-b border-black/10 text-right font-mono text-sm focus:border-accent-light outline-none transition-colors"
          />
          <span className="text-xs font-mono text-black font-bold">{unit}</span>
        </div>
      </div>
      <div className="relative h-12 flex flex-col justify-end">
        <div 
          className="absolute top-0 mb-2 transition-all duration-75"
          style={{ left: `calc(${percentage}% - 12px)` }}
        >
          <span className="text-[10px] font-mono font-bold text-accent-light bg-accent/5 px-2 py-1 rounded border border-accent/10 whitespace-nowrap">
            {value}{unit}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1 bg-black/5 rounded-full appearance-none cursor-pointer accent-accent-light relative z-10"
        />
      </div>
    </div>
  );
};

const ByteLab = ({ currency: initialCurrency }: { currency: string }) => {
  const { addToCart } = useCart();
  const [currency, setCurrency] = useState(initialCurrency);
  const [selections, setSelections] = useState<Record<string, string[]>>({
    protein: ['Skip'],
    carb: ['Skip'],
    veggies: ['Skip'],
    sauce: ['No Sauce'],
  });

  const [weights, setWeights] = useState<Record<string, Record<string, number>>>({
    protein: {},
    carb: {},
    veggies: {},
    sauce: {}
  });

  useEffect(() => {
    setCurrency(initialCurrency);
  }, [initialCurrency]);

  const toggleSelection = (cat: string, name: string) => {
    setSelections(prev => {
      const current = prev[cat];
      if (name === 'Skip' || name === 'No Sauce') {
        return { ...prev, [cat]: [name] };
      }
      
      const newSelections = current.includes(name) 
        ? current.filter(n => n !== name) 
        : [...current.filter(n => n !== 'Skip' && n !== 'No Sauce'), name];
        
      // If nothing is left, default back to Skip/No Sauce
      if (newSelections.length === 0) {
         return { ...prev, [cat]: cat === 'sauce' ? ['No Sauce'] : ['Skip'] };
      }
        
      return { ...prev, [cat]: newSelections };
    });

    if (name !== 'Skip' && name !== 'No Sauce') {
      setWeights(prev => {
        if (!prev[cat][name]) {
          const defaultWeight = cat === 'protein' ? 200 : cat === 'carb' ? 150 : cat === 'veggies' ? 100 : 50;
          return {
            ...prev,
            [cat]: { ...prev[cat], [name]: defaultWeight }
          };
        }
        return prev;
      });
    }
  };

  const options = {
    protein: [
      { name: 'Chicken', p: 25, f: 3, c: 0, cal: 130, pricing: { 100: 1.0, 150: 1.5, 200: 2.0, 250: 2.5, 300: 3.0 } },
      { name: 'Beef', p: 22, f: 12, c: 0, cal: 190, pricing: { 100: 1.6, 150: 2.4, 200: 3.2, 250: 4.0, 300: 4.8 } },
      { name: 'Shrimp', p: 20, f: 1, c: 0, cal: 95, pricing: { 100: 1.8, 150: 2.7, 200: 3.6, 250: 4.5, 300: 5.4 } },
      { name: 'Tuna', p: 26, f: 1, c: 0, cal: 116, pricing: { 100: 2.0, 150: 3.0, 200: 4.0, 250: 5.0, 300: 6.0 } },
      { name: 'Egg Whites', p: 11, f: 0, c: 1, cal: 52, pricing: { 100: 0.7, 150: 1.0, 200: 1.3, 250: 1.6, 300: 1.9 } },
      { name: 'Fried Tofu', p: 15, f: 8, c: 10, cal: 180, pricing: { 100: 0.8, 150: 1.0, 200: 1.3, 250: 1.6, 300: 1.9 } },
      { name: 'Skip', p: 0, f: 0, c: 0, cal: 0, pricing: {} },
    ],
    carb: [
      { name: 'White Rice', p: 3, f: 0, c: 28, cal: 130, pricing: { 100: 0.35, 150: 0.5, 200: 0.65, 250: 0.8, 300: 0.95 } },
      { name: 'Sweet Potato', p: 2, f: 0, c: 20, cal: 90, pricing: { 100: 0.45, 150: 0.65, 200: 0.85, 250: 1.0, 300: 1.2 } },
      { name: 'Potato', p: 2, f: 0, c: 17, cal: 77, pricing: { 100: 0.4, 150: 0.55, 200: 0.7, 250: 0.85, 300: 1.0 } },
      { name: 'Sweet Corn', p: 3, f: 1, c: 19, cal: 86, pricing: { 100: 0.8, 150: 1.1, 200: 1.4, 250: 1.7, 300: 2.0 } },
      { name: 'English Muffin', p: 6, f: 1, c: 45, cal: 220, pricing: { 1: 0.75, 2: 1.3 }, unit: 'PC' },
      { name: 'Cauli Rice', p: 2, f: 0, c: 4, cal: 25, pricing: { 100: 0.55, 150: 0.75, 200: 0.95, 250: 1.15, 300: 1.35 } },
      { name: 'Pasta', p: 6, f: 1, c: 25, cal: 140, pricing: { 100: 0.55, 150: 0.8, 200: 1.0, 250: 1.25, 300: 1.5 } },
      { name: 'Skip', p: 0, f: 0, c: 0, cal: 0, pricing: {} },
    ],
    veggies: [
      { name: 'Broccoli', p: 3, f: 0, c: 7, cal: 34, tier: 'standard' },
      { name: 'Spinach', p: 3, f: 0, c: 4, cal: 23, tier: 'standard' },
      { name: 'Asparagus', p: 2, f: 0, c: 4, cal: 20, tier: 'premium' },
      { name: 'Mushrooms', p: 3, f: 0, c: 3, cal: 22, tier: 'standard' },
      { name: 'Zucchini', p: 1, f: 0, c: 3, cal: 17, tier: 'standard' },
      { name: 'Skip', p: 0, f: 0, c: 0, cal: 0, tier: 'none' },
    ],
    sauce: [
      { name: 'Greek Yoghurt Lemon', p: 2, f: 3, c: 2, cal: 45, tier: 'standard' },
      { name: 'Greek Yoghurt Spicy', p: 2, f: 4, c: 4, cal: 60, tier: 'standard' },
      { name: 'Greek Yoghurt Garlic', p: 2, f: 3, c: 2, cal: 45, tier: 'standard' },
      { name: 'Greek Yoghurt Herb', p: 2, f: 3, c: 2, cal: 45, tier: 'standard' },
      { name: 'Greek Yoghurt Truffle', p: 2, f: 8, c: 3, cal: 90, tier: 'premium' },
      { name: 'Tomato Sauce', p: 1, f: 0, c: 5, cal: 25, tier: 'tomato' },
      { name: 'Olive Oil + Herbs', p: 0, f: 14, c: 0, cal: 120, tier: 'flat' },
      { name: 'No Sauce', p: 0, f: 0, c: 0, cal: 0, tier: 'none' },
    ]
  };

  const calculateItemPrice = (cat: string, name: string, weight: number) => {
    if (name === 'Skip' || name === 'No Sauce') return 0;
    const opt = options[cat as keyof typeof options].find((o: any) => o.name === name) as any;
    if (!opt) return 0;

    if (opt.pricing) {
      const tiers = Object.keys(opt.pricing).map(Number).sort((a, b) => a - b);
      if (opt.pricing[weight]) return opt.pricing[weight];
      
      if (weight <= tiers[0]) return (opt.pricing[tiers[0]] / tiers[0]) * weight;
      if (weight >= tiers[tiers.length - 1]) return (opt.pricing[tiers[tiers.length - 1]] / tiers[tiers.length - 1]) * weight;
      
      const lower = [...tiers].reverse().find(t => t < weight) || tiers[0];
      const upper = tiers.find(t => t > weight) || tiers[tiers.length - 1];
      const lowerPrice = opt.pricing[lower];
      const upperPrice = opt.pricing[upper];
      return lowerPrice + (upperPrice - lowerPrice) * ((weight - lower) / (upper - lower));
    }

    if (cat === 'veggies') {
      const rate = opt.tier === 'premium' ? 0.75 / 100 : 0.50 / 100;
      return weight * rate;
    }

    if (cat === 'sauce') {
      if (opt.tier === 'flat') return 0.40;
      let price = 0;
      const basePricing = opt.tier === 'tomato' 
        ? { 25: 0.35, 50: 0.55, 75: 0.75, 100: 0.95 }
        : { 25: 0.50, 50: 0.80, 75: 1.10, 100: 1.40 };
      
      const tiers = Object.keys(basePricing).map(Number).sort((a, b) => a - b);
      const castPricing = basePricing as Record<number, number>;
      if (castPricing[weight]) price = castPricing[weight];
      else {
        const lower = [...tiers].reverse().find(t => t < weight) || tiers[0];
        const upper = tiers.find(t => t > weight) || tiers[tiers.length - 1];
        const lowerPrice = castPricing[lower];
        const upperPrice = castPricing[upper];
        price = lowerPrice + (upperPrice - lowerPrice) * ((weight - lower) / (upper - lower));
      }
      
      if (opt.tier === 'premium') price += 0.20;
      return price;
    }

    return 0;
  };

  const formatCurrency = (value: number) => {
    if (currency === 'USD') return `$${(value * 1.17).toFixed(2)}`;
    if (currency === 'IDR') return `Rp ${(Math.round(value * 20000)).toLocaleString()}`;
    return `€${value.toFixed(2)}`;
  };

  const totals = useMemo(() => {
    let p = 0, f = 0, c = 0, cal = 0, subtotal = 0;
    
    ['protein', 'carb', 'veggies', 'sauce'].forEach(cat => {
      selections[cat].forEach(selected => {
        const weight = weights[cat]?.[selected] || 0;
        const opt = options[cat as keyof typeof options].find((o: any) => o.name === selected) as any;
        
        if (opt && selected !== 'Skip' && selected !== 'No Sauce') {
          const factor = opt.unit === 'PC' ? weight : weight / 100;
          p += opt.p * factor;
          f += opt.f * factor;
          c += opt.c * factor;
          cal += opt.cal * factor;
          subtotal += calculateItemPrice(cat, selected, weight);
        }
      });
    });

    const prepFee = subtotal > 0 ? 0.90 : 0;
    const packaging = subtotal > 0 ? 0.35 : 0;
    const total = subtotal > 0 ? subtotal + prepFee + packaging : 0;

    return { p, f, c, cal, subtotal, prepFee, packaging, total };
  }, [selections, weights]);

  const minOrderValue = 4.50;
  const isBelowMin = totals.subtotal > 0 && totals.total < minOrderValue;

  const dynamicMealName = useMemo(() => {
    const p = selections.protein;
    if (p.length === 0 || p.includes('Skip')) return 'Custom Engineering Build';
    return `${p.join(' & ')} Performance Bowl`;
  }, [selections.protein]);

  const handleEngineerOrder = () => {
    const details: any = {};
    ['protein', 'carb', 'veggies', 'sauce'].forEach(cat => {
      details[cat] = selections[cat as keyof typeof selections]
        .filter(name => name !== 'Skip' && name !== 'No Sauce')
        .map(name => {
          const unit = (options[cat as keyof typeof options].find((o: any) => o.name === name) as any)?.unit || 'G';
          return { name, weight: weights[cat]?.[name] || 0, unit };
        });
    });

    addToCart({
      id: `lab-${Date.now()}`,
      name: dynamicMealName,
      price: totals.total,
      quantity: 1,
      type: 'lab',
      details
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
      <div className="lg:col-span-7 space-y-20">
        {['protein', 'carb', 'veggies', 'sauce'].map((cat) => {
          const categoryOptions = options[cat as keyof typeof options] as any[];
          const selectedItems = selections[cat];
          const isSkip = selectedItems.includes('Skip') || selectedItems.includes('No Sauce');

          return (
            <div key={cat} className="space-y-10">
              <div className="flex justify-between items-end border-b border-black/10 pb-4">
                <span className="text-sm font-mono tracking-[0.3em] text-black font-bold uppercase">{cat} Selection</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {categoryOptions.map(item => {
                  const isGhost = item.name === 'Skip' || item.name === 'No Sauce';
                  return (
                    <button
                      key={item.name}
                      onClick={() => toggleSelection(cat, item.name)}
                      className={`px-6 py-3 rounded-2xl border text-[10px] font-mono tracking-widest transition-all duration-300 ${
                        selectedItems.includes(item.name)
                          ? 'bg-accent-light text-white border-accent-light scale-105 shadow-lg shadow-accent/20' 
                          : isGhost 
                            ? 'bg-transparent border-black/10 text-gray-400 hover:border-black/20'
                            : 'bg-white border-black/20 text-black font-bold hover:border-black/40'
                      }`}
                    >
                      {item.name.toUpperCase()}
                    </button>
                  );
                })}
              </div>

              {!isSkip && selectedItems.length > 0 && (
                <div className="space-y-6 pt-4">
                  {selectedItems.map(selectedName => {
                    const unit = (options[cat as keyof typeof options].find((o: any) => o.name === selectedName) as any)?.unit || 'G';
                    return (
                      <div key={selectedName} className="bg-black/[0.03] p-6 rounded-[24px] space-y-8 animate-in fade-in slide-in-from-top-2 duration-500 border border-black/5">
                        <RangeSlider 
                          label={selectedName} 
                          value={weights[cat]?.[selectedName] || 0} 
                          min={cat === 'protein' ? 100 : 1} 
                          max={cat === 'protein' ? 400 : cat === 'carb' && selectedName === 'English Muffin' ? 2 : 500} 
                          unit={unit}
                          onChange={(val: number) => setWeights(prev => ({
                            ...prev,
                            [cat]: { ...prev[cat], [selectedName]: val }
                          }))}
                        />

                        <div className="grid grid-cols-5 gap-3">
                          {(cat === 'sauce' ? [25, 50, 75, 100] : cat === 'carb' && selectedName === 'English Muffin' ? [1, 2] : [100, 150, 200, 250, 300]).map(q => {
                            if (cat === 'protein' && (q < 100 || q > 400)) return null;
                            return (
                              <button
                                key={q}
                                onClick={() => setWeights(prev => ({
                                  ...prev,
                                  [cat]: { ...prev[cat], [selectedName]: q }
                                }))}
                                className={`py-4 rounded-xl border text-[11px] font-mono transition-all ${
                                  weights[cat]?.[selectedName] === q
                                    ? 'bg-black text-white border-black scale-105 shadow-lg shadow-black/10'
                                    : 'bg-white border-black/5 text-gray-500 hover:border-black/20'
                                }`}
                              >
                                {q}{unit}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-40 bg-white border border-black/10 p-8 rounded-[32px] flex flex-col gap-6 shadow-2xl shadow-black/5">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-2xl font-heading font-medium text-black mb-1">BYTE LAB / CUSTOM</h4>
              <p className="text-[10px] text-black font-mono font-bold uppercase tracking-widest opacity-40">{dynamicMealName}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex gap-4 text-sm font-mono font-bold">
                {['EUR', 'USD', 'IDR'].map(curr => (
                  <button 
                    key={curr} 
                    onClick={() => setCurrency(curr)}
                    className={`transition-colors ${currency === curr ? 'text-accent' : 'text-black/20 hover:text-black/40'}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 py-8 border-y border-black/5">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-black font-bold uppercase tracking-widest opacity-40">Energy</span>
              <span className="text-2xl font-mono text-black leading-none">{Math.round(totals.cal)} <span className="text-xs opacity-30">KCAL</span></span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-accent-light font-bold uppercase tracking-widest">Protein</span>
              <span className="text-2xl font-mono text-accent-light leading-none">{Math.round(totals.p)}<span className="text-xs opacity-40">G</span></span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-black font-bold uppercase tracking-widest opacity-40">Carbs</span>
              <span className="text-2xl font-mono text-black leading-none">{Math.round(totals.c)}<span className="text-xs opacity-30">G</span></span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-mono text-black font-bold uppercase tracking-widest opacity-40">Fats</span>
              <span className="text-2xl font-mono text-black leading-none">{Math.round(totals.f)}<span className="text-xs opacity-30">G</span></span>
            </div>
          </div>

          <div className="space-y-3 py-2">
            <span className="block text-[10px] font-mono text-black font-bold uppercase tracking-widest mb-4 opacity-40">Itemized Build</span>
            {['protein', 'carb', 'veggies', 'sauce'].map(cat => {
              return selections[cat].map(selected => {
                if (selected === 'Skip' || selected === 'No Sauce') return null;
                const weight = weights[cat]?.[selected] || 0;
                const price = calculateItemPrice(cat, selected, weight);
                const unit = (options[cat as keyof typeof options].find((o: any) => o.name === selected) as any)?.unit || 'G';
                
                return (
                  <div key={`${cat}-${selected}`} className="flex justify-between items-center text-xs font-mono group">
                    <div className="flex items-center gap-2">
                      <span className="text-black font-bold uppercase">{selected}</span>
                      <span className="text-[10px] opacity-30">{weight}{unit}</span>
                    </div>
                    <span className="text-black font-bold">{formatCurrency(price)}</span>
                  </div>
                );
              });
            })}
            
            {totals.subtotal > 0 && (
              <>
                <div className="flex justify-between items-center text-xs font-mono pt-4 border-t border-black/5">
                  <span className="text-black/40 uppercase">Subtotal</span>
                  <span className="text-black font-bold">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-black/40 uppercase">BYTE Prep Fee</span>
                  <span className="text-black font-bold">{formatCurrency(totals.prepFee)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-black/40 uppercase">Eco Packaging</span>
                  <span className="text-black font-bold">{formatCurrency(totals.packaging)}</span>
                </div>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-black/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono tracking-[0.2em] text-black font-bold uppercase">Final Total</span>
              <span className="text-3xl font-mono text-black font-bold">{formatCurrency(totals.total)}</span>
            </div>
            
            {isBelowMin && (
              <div className="bg-red-50 text-red-500 text-sm font-mono font-bold tracking-widest uppercase p-3 rounded-xl text-center border border-red-100 animate-pulse">
                Minimum custom build value is {formatCurrency(minOrderValue)}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-black/5">
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to reset your custom build?")) {
                  setSelections({ protein: ['Skip'], carb: ['Skip'], veggies: ['Skip'], sauce: ['No Sauce'] });
                  setWeights({ protein: {}, carb: {}, veggies: {}, sauce: {} });
                }
              }}
              className="w-full py-4 rounded-2xl border border-black/10 text-[10px] font-mono font-bold tracking-[0.3em] text-black hover:bg-black hover:text-white transition-all uppercase"
            >
              Reset Meal
            </button>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleEngineerOrder}
                disabled={selections.protein.includes('Skip') || isBelowMin}
                className="py-5 rounded-[24px] bg-black text-white text-sm font-bold tracking-[0.2em] uppercase transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Add to Basket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Lab = () => {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'EUR');

  useEffect(() => {
    const handleCurrencyChange = () => setCurrency(localStorage.getItem('currency') || 'EUR');
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeUpVariant}
          className="mb-20 text-center"
        >
          <span className="text-[10px] font-mono tracking-[0.4em] text-accent-light uppercase mb-6 block">BYTE / LAB / CUSTOM</span>
          <h1 className="text-5xl md:text-7xl font-heading font-light tracking-tight mb-8 text-black">Engineer your meal.</h1>
          <p className="text-xl text-black font-light max-w-2xl mx-auto leading-relaxed mb-4">
            Choose your fuel. Build your macros.
          </p>
          <p className="text-sm text-black font-mono tracking-widest uppercase opacity-60">
            Precision-built nutrition, tailored to your goals.
          </p>
        </motion.div>

        <ByteLab currency={currency} />
      </div>
    </div>
  );
};

export default Lab;
