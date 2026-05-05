import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { X, Beef, Wheat, Leaf, Droplets, ChevronDown } from 'lucide-react';


const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
};

const RangeSlider = ({ label, value, min, max, onChange, unit = 'G', isDark = false }: any) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4 pt-2">
      <div className="relative h-12 flex flex-col justify-end">
        <div 
          className="absolute top-0 mb-2 transition-all duration-75"
          style={{ left: `calc(${percentage}% - 12px)` }}
        >
          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border whitespace-nowrap ${
            isDark ? 'text-accent bg-accent/10 border-accent/20' : 'text-accent-light bg-accent/5 border-accent/10'
          }`}>
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
          className={`w-full h-1 rounded-full appearance-none cursor-pointer accent-accent relative z-10 ${
            isDark ? 'bg-white/10' : 'bg-black/5'
          }`}
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



  const [editingItems, setEditingItems] = useState<Record<string, string[]>>({
    protein: [],
    carb: [],
    veggies: [],
    sauce: []
  });

  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({
    protein: false,
    carb: false,
    veggies: false,
    sauce: false
  });

  useEffect(() => {
    setCurrency(initialCurrency);
  }, [initialCurrency]);

  const toggleCollapse = (cat: string) => {
    setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleSelection = (cat: string, name: string) => {
    const isSkip = name === 'Skip' || name === 'No Sauce';
    
    setSelections(prev => {
      const current = prev[cat];
      if (isSkip) {
        return { ...prev, [cat]: [name] };
      }
      
      const withoutSkip = current.filter(n => n !== 'Skip' && n !== 'No Sauce');
      if (withoutSkip.includes(name)) {
        const remaining = withoutSkip.filter(n => n !== name);
        return { ...prev, [cat]: remaining.length === 0 ? (cat === 'sauce' ? ['No Sauce'] : ['Skip']) : remaining };
      }
        
      return { ...prev, [cat]: [...withoutSkip, name] };
    });

    if (!isSkip) {
      setWeights(prev => {
        const currentCat = prev[cat];
        if (currentCat[name]) {
          const { [name]: _, ...rest } = currentCat;
          return { ...prev, [cat]: rest };
        }
        const defaultWeight = (options[cat as keyof typeof options].find((o: any) => o.name === name) as any)?.unit === 'PC' ? 1 : 100;
        return { ...prev, [cat]: { ...currentCat, [name]: defaultWeight } };
      });

      setEditingItems(prev => {
        const currentCat = prev[cat];
        // Always ensure it's REMOVED from editing state if we are toggling it (especially if it was already selected)
        // If it wasn't selected, we don't want to add it to editingItems here either, 
        // because the card's onClick will handle the 'expand' if clicked on the box.
        return { ...prev, [cat]: currentCat.filter(n => n !== name) };
      });
    }
  };

  const removeSelection = (cat: string, name: string) => {
    setSelections(prev => {
      const current = prev[cat].filter(n => n !== name);
      if (current.length === 0) {
        return { ...prev, [cat]: cat === 'sauce' ? ['No Sauce'] : ['Skip'] };
      }
      return { ...prev, [cat]: current };
    });
    setEditingItems(prev => ({
      ...prev,
      [cat]: prev[cat].filter(n => n !== name)
    }));
  };

  const minimizeItem = (cat: string, name: string) => {
    setEditingItems(prev => ({
      ...prev,
      [cat]: prev[cat].filter(n => n !== name)
    }));
  };

  const expandItem = (cat: string, name: string) => {
    // Initialize weight if not exists so it stays stored even before confirmation
    if (!weights[cat][name]) {
      const defaultWeight = (options[cat as keyof typeof options].find((o: any) => o.name === name) as any)?.unit === 'PC' ? 1 : 100;
      setWeights(prev => ({
        ...prev,
        [cat]: { ...prev[cat], [name]: defaultWeight }
      }));
    }

    setEditingItems({
      protein: cat === 'protein' ? [name] : [],
      carb: cat === 'carb' ? [name] : [],
      veggies: cat === 'veggies' ? [name] : [],
      sauce: cat === 'sauce' ? [name] : [],
    });
  };

  const options = {
    protein: [
      { name: 'Chicken Breast', p: 25, f: 3, c: 0, cal: 130, pricing: { 100: 1.0, 150: 1.5, 200: 2.0, 250: 2.5, 300: 3.0 } },
      { name: 'Chicken Thigh', p: 21, f: 9, c: 0, cal: 170, pricing: { 100: 1.1, 150: 1.65, 200: 2.2, 250: 2.75, 300: 3.3 } },
      { name: 'Ground Beef', p: 22, f: 12, c: 0, cal: 190, pricing: { 100: 1.6, 150: 2.4, 200: 3.2, 250: 4.0, 300: 4.8 } },
      { name: 'Peeled Shrimps', p: 20, f: 1, c: 0, cal: 95, pricing: { 100: 1.8, 150: 2.7, 200: 3.6, 250: 4.5, 300: 5.4 } },
      { name: 'Tuna Saku', p: 26, f: 1, c: 0, cal: 116, pricing: { 100: 2.0, 150: 3.0, 200: 4.0, 250: 5.0, 300: 6.0 } },
      { name: 'Canned Tuna', p: 24, f: 1, c: 0, cal: 110, pricing: { 100: 1.2, 150: 1.8, 200: 2.4, 250: 3.0, 300: 3.6 } },
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
        <div className="flex items-center justify-between gap-4 mb-12 bg-gray-50 p-2 rounded-[32px] border border-black/5">
          {[
            { id: 'protein', label: 'Protein', icon: <Beef size={18} /> },
            { id: 'carb', label: 'Carbs', icon: <Wheat size={18} /> },
            { id: 'veggies', label: 'Veggies', icon: <Leaf size={18} /> },
            { id: 'sauce', label: 'Sauce', icon: <Droplets size={18} /> },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const el = document.getElementById(`cat-${cat.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-[24px] transition-all hover:bg-white hover:shadow-sm text-black/40 hover:text-black group"
            >
              <div className="p-3 rounded-full bg-black/5 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                {cat.icon}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{cat.label}</span>
            </button>
          ))}
        </div>

        {['protein', 'carb', 'veggies', 'sauce'].map((cat) => {
          const categoryOptions = options[cat as keyof typeof options] as any[];
          const selectedItems = selections[cat];

          return (
            <div key={cat} id={`cat-${cat}`} className="space-y-8 mb-20 scroll-mt-40">
              <div 
                className="flex items-center gap-4 border-b border-black/5 pb-4 cursor-pointer group w-fit"
                onClick={() => toggleCollapse(cat)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-black text-white">
                    {cat === 'protein' ? <Beef size={16} /> : cat === 'carb' ? <Wheat size={16} /> : cat === 'veggies' ? <Leaf size={16} /> : <Droplets size={16} />}
                  </div>
                  <span className="text-xs font-mono tracking-[0.3em] text-black font-bold uppercase">{cat} Engineering</span>
                </div>
                <div className={`transition-transform duration-300 ${collapsedCats[cat] ? '' : 'rotate-180'}`}>
                  <ChevronDown size={18} className="text-black" />
                </div>
              </div>
              
              {!collapsedCats[cat] && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  {categoryOptions.map(item => {
                    const isSelected = selectedItems.includes(item.name);
                    const isEditing = editingItems[cat].includes(item.name);
                    const isGhost = item.name === 'Skip' || item.name === 'No Sauce';
                    
                    return (
                      <div
                        key={item.name}
                        className={`relative rounded-[28px] border transition-all duration-500 overflow-hidden ${
                          isSelected 
                            ? 'bg-white border-accent shadow-xl' 
                            : 'bg-white border-black/10 hover:border-black/20'
                        } ${isEditing ? 'col-span-1 md:col-span-3 h-auto' : 'col-span-1 h-[84px]'}`}
                      >
                        <div 
                          className="h-full p-4 md:p-5 cursor-pointer flex justify-between items-center text-black"
                          onClick={() => {
                            if (!isSelected) {
                              if (!isGhost) {
                                expandItem(cat, item.name);
                              } else {
                                toggleSelection(cat, item.name);
                              }
                            } else if (!isEditing && !isGhost) {
                              expandItem(cat, item.name);
                            } else if (isEditing) {
                              minimizeItem(cat, item.name);
                            }
                          }}
                        >
                          <div className="space-y-1">
                            <span className="text-[11px] md:text-[13px] font-mono font-bold uppercase tracking-[0.15em]">{item.name}</span>
                            {!isGhost && <p className="text-[9px] opacity-40 text-black font-mono font-bold">{item.cal} Kcal / 100g</p>}
                          </div>
                          <div className="flex items-center gap-4">
                            {isSelected && !isGhost && (
                              <span className="text-xs font-mono font-bold text-accent">{weights[cat]?.[item.name]}g</span>
                            )}
                            {isSelected ? (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelection(cat, item.name);
                                  if (isEditing) minimizeItem(cat, item.name);
                                }}
                                className="w-6 h-6 rounded-full border-2 bg-accent border-accent flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                              >
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </button>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-black/10" />
                            )}
                          </div>
                        </div>

                        {isEditing && !isGhost && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="px-8 pb-6 space-y-4 border-t border-black/5 pt-4"
                          >
                            <RangeSlider 
                              label={item.name} 
                              value={weights[cat]?.[item.name] || 0} 
                              min={cat === 'protein' ? 100 : 1} 
                              max={cat === 'protein' ? 400 : cat === 'carb' && item.name === 'English Muffin' ? 2 : 500} 
                              unit={item.unit || 'G'}
                              onChange={(val: number) => setWeights(prev => ({
                                ...prev,
                                [cat]: { ...prev[cat], [item.name]: val }
                              }))}
                              isDark={false}
                            />

                            <div className="grid grid-cols-4 md:grid-cols-9 gap-2">
                              {/* Add 0g option */}
                              {!isGhost && (
                                <button
                                  onClick={() => {
                                    toggleSelection(cat, item.name);
                                    minimizeItem(cat, item.name);
                                  }}
                                  className="py-3 rounded-xl border text-[10px] font-mono transition-all bg-red-50 border-red-100 text-red-500 hover:bg-red-100"
                                >
                                  0G (REMOVE)
                                </button>
                              )}
                              {(cat === 'sauce' ? [25, 50, 75, 100] : item.unit === 'PC' ? [1, 2] : [100, 150, 200, 250, 300, 350, 400]).map(q => {
                                if (cat === 'protein' && q < 100) return null;
                                if (cat === 'protein' && q > 400) return null;
                                const isActive = weights[cat]?.[item.name] === q;
                                return (
                                  <button
                                    key={q}
                                    onClick={() => setWeights(prev => ({
                                      ...prev,
                                      [cat]: { ...prev[cat], [item.name]: q }
                                    }))}
                                    className={`py-3 rounded-xl border text-[10px] font-mono transition-all ${
                                      isActive
                                        ? 'bg-accent text-white border-accent'
                                        : 'bg-black/5 border-black/5 text-black/40 hover:border-black/10 hover:text-black'
                                    }`}
                                  >
                                    {q}{item.unit || 'G'}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex justify-center gap-4">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelection(cat, item.name);
                                  minimizeItem(cat, item.name);
                                }}
                                className="px-8 py-4 border border-black/10 text-black/40 text-[10px] font-mono font-bold tracking-[0.3em] uppercase rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                              >
                                Remove Ingredient
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isSelected) toggleSelection(cat, item.name);
                                  minimizeItem(cat, item.name);
                                }}
                                className="px-12 py-4 bg-accent text-white text-[10px] font-mono font-bold tracking-[0.3em] uppercase rounded-full hover:bg-accent-light transition-all shadow-xl shadow-accent/20"
                              >
                                Confirm Selection
                              </button>
                            </div>
                          </motion.div>
                        )}
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
                  <div key={`${cat}-${selected}`} className="flex justify-between items-center text-xs font-mono group py-1.5 border-b border-black/5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-black font-bold uppercase">{selected}</span>
                      <span className="text-[10px] opacity-30">{weight}{unit}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-black font-bold">{formatCurrency(price)}</span>
                      <button 
                        onClick={() => removeSelection(cat, selected)}
                        className="text-red-500 hover:scale-110 transition-all p-1"
                        title={`Remove ${selected}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
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

                  setEditingItems({ protein: [], carb: [], veggies: [], sauce: [] });
                }
              }}
              className="w-full py-4 rounded-2xl border border-black/10 text-[10px] font-mono font-bold tracking-[0.3em] text-black hover:bg-black hover:text-white transition-all uppercase"
            >
              Reset Meal
            </button>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => {
                  handleEngineerOrder();
                  setSelections({ protein: ['Skip'], carb: ['Skip'], veggies: ['Skip'], sauce: ['No Sauce'] });
                  setWeights({ protein: {}, carb: {}, veggies: {}, sauce: {} });

                  setEditingItems({ protein: [], carb: [], veggies: [], sauce: [] });
                }}
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
