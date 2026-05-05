import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Calculator, RotateCcw, ShoppingCart, Wand2, Beef, Wheat, Droplets, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { INGREDIENTS } from '../data/ingredients';

const RangeSlider = ({ label, value, min = 0, max, onChange, unit = '', color = '#00aff0' }: { label: string, value: number, min?: number, max: number, onChange: (v: number) => void, unit?: string, color?: string }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-mono tracking-[0.4em] text-black/40 font-black uppercase leading-none">{label}</span>
      <span className="text-2xl font-mono text-black leading-none font-black">{value}<span className="text-[10px] ml-1" style={{ color }}>{unit}</span></span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-black/5 rounded-lg appearance-none cursor-pointer"
      style={{ accentColor: color }}
    />
  </div>
);

const MacroGenerator = () => {
  const { addToCart } = useCart();
  const [targets, setTargets] = useState({ p: 25, c: 50, f: 15 });
  const [generatedMeal, setGeneratedMeal] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const calculatedCals = useMemo(() => {
    return (targets.p * 4) + (targets.c * 4) + (targets.f * 9);
  }, [targets]);

  const generate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let pPool = INGREDIENTS.protein.filter(i => i.name !== 'Skip');
      let cPool = INGREDIENTS.carb.filter(i => i.name !== 'Skip');
      
      if (targets.c < 15) {
        cPool = INGREDIENTS.carb.filter(i => i.name === 'Cauliflower Rice' || i.name === 'Skip');
      }
      if (targets.p < 15) {
        pPool = INGREDIENTS.protein.filter(i => i.name === 'Egg Whites' || i.name === 'Skip');
      }

      let bestMeal = null;
      let minScore = Infinity;

      // Try multiple combinations to find the best macro/calorie fit
      for (let attempt = 0; attempt < 100; attempt++) {
        const pOpt = pPool[Math.floor(Math.random() * pPool.length)];
        const cOpt = cPool[Math.floor(Math.random() * cPool.length)];
        
        // Allow skipping veggies/sauce for low calorie targets
        const vPool = INGREDIENTS.veggies;
        const sPool = INGREDIENTS.sauce;
        const vOpt = vPool[Math.floor(Math.random() * vPool.length)];
        const sOpt = sPool[Math.floor(Math.random() * sPool.length)];

        const fixedP = (vOpt.name === 'Skip' ? 0 : vOpt.p) + (sOpt.name === 'No Sauce' ? 0 : sOpt.p * 0.25);
        const fixedC = (vOpt.name === 'Skip' ? 0 : vOpt.c) + (sOpt.name === 'No Sauce' ? 0 : sOpt.c * 0.25);
        const fixedF = (vOpt.name === 'Skip' ? 0 : vOpt.f) + (sOpt.name === 'No Sauce' ? 0 : sOpt.f * 0.25);
        const fixedCal = (vOpt.name === 'Skip' ? 0 : vOpt.cal) + (sOpt.name === 'No Sauce' ? 0 : sOpt.cal * 0.25);

        const remP = Math.max(0, targets.p - fixedP);
        const remC = Math.max(0, targets.c - fixedC);

        const Pp = pOpt.p; const Pc = cOpt.p;
        const Cp = pOpt.c; const Cc = cOpt.c;

        let Wp = 0, Wc = 0;
        const det = (Pp * Cc) - (Pc * Cp);

        if (Math.abs(det) < 0.1) {
          Wp = remP / (Pp || 1);
          Wc = remC / (Cc || 1);
        } else {
          Wp = (remP * Cc - remC * Pc) / det;
          Wc = (remC * Pp - remP * Cp) / det;
        }

        // Weight constraints
        let finalWp = pOpt.name === 'Skip' ? 0 : Math.max(targets.p > 0 ? 50 : 0, Math.min(400, Math.round(Wp * 100 / 5) * 5));
        let finalWc = cOpt.name === 'Skip' ? 0 : Math.max(targets.c > 0 ? 50 : 0, Math.min(400, Math.round(Wc * 100 / 5) * 5));

        // If target is very low, force zero for heavy components
        if (targets.p < 5) finalWp = 0;
        if (targets.c < 5) finalWc = 0;
        if (calculatedCals < 100 && (vOpt.cal + sOpt.cal * 0.25 > calculatedCals)) {
          // If forced components exceed target, this attempt is bad, but we'll let the minCalDiff handle it
        }

        const currentMacros = {
          p: (pOpt.p * finalWp / 100) + (cOpt.p * finalWc / 100) + fixedP,
          c: (pOpt.c * finalWp / 100) + (cOpt.c * finalWc / 100) + fixedC,
          f: (pOpt.f * finalWp / 100) + (cOpt.f * finalWc / 100) + fixedF,
          cal: (pOpt.cal * finalWp / 100) + (cOpt.cal * finalWc / 100) + fixedCal,
        };

        const calDiff = Math.abs(currentMacros.cal - calculatedCals);
        const pDiff = Math.abs(currentMacros.p - targets.p);
        const cDiff = Math.abs(currentMacros.c - targets.c);
        
        // Balanced score: weight calorie accuracy and protein/carb accuracy
        const score = calDiff + (pDiff * 4) + (cDiff * 4);
        
        if (score < minScore) {
          minScore = score;
          const finalMealPrice = (pOpt.pricing ? (pOpt.pricing[finalWp] || 0) : 0) + 
                                (cOpt.pricing ? (cOpt.pricing[finalWc] || 0) : 0) + 
                                (vOpt.name === 'Skip' ? 0 : (vOpt.tier === 'premium' ? 0.90 : 0.60)) + 
                                (sOpt.name === 'No Sauce' ? 0 : (sOpt.tier === 'premium' ? 1.10 : 0.65)) + 0.90;

          const pName = pOpt.name === 'Skip' || finalWp === 0 ? '' : pOpt.name;
          const cName = cOpt.name === 'Skip' || finalWc === 0 ? '' : cOpt.name;
          const vName = vOpt.name === 'Skip' ? '' : vOpt.name;
          const mealName = [pName, cName, vName].filter(Boolean).join(' + ') || 'Pure Macros Engineering';

          bestMeal = {
            name: mealName,
            details: {
              protein: [{ name: pOpt.name, weight: finalWp, cal: Math.round(pOpt.cal * finalWp / 100) }],
              carb: [{ name: cOpt.name, weight: finalWc, cal: Math.round(cOpt.cal * finalWc / 100) }],
              veggies: [{ name: vOpt.name, weight: vOpt.name === 'Skip' ? 0 : 100, cal: Math.round(vOpt.cal || 0) }],
              sauce: [{ name: sOpt.name, weight: sOpt.name === 'No Sauce' ? 0 : 25, cal: Math.round((sOpt.cal || 0) * 0.25) }],
            },
            macros: currentMacros,
            price: finalMealPrice
          };

          if (score <= 10) break; // Excellent fit
        }
      }

      setGeneratedMeal(bestMeal);
      setIsGenerating(false);
    }, 800);
  };

  const handleCustomize = () => {
    if (!generatedMeal) return;
    const searchParams = new URLSearchParams();
    searchParams.set('name', generatedMeal.name);
    searchParams.set('desc', 'AI Engineered Protocol');
    searchParams.set('protein', JSON.stringify(generatedMeal.details.protein));
    searchParams.set('carb', JSON.stringify(generatedMeal.details.carb));
    searchParams.set('veggies', JSON.stringify(generatedMeal.details.veggies));
    searchParams.set('sauce', JSON.stringify(generatedMeal.details.sauce));
    window.location.href = `/lab?${searchParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden bg-gray-50 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }} className="max-w-3xl">
            <span className="text-[10px] font-mono tracking-[0.4em] text-accent-light uppercase mb-4 block">BYTE / GENERATE</span>
            <h1 className="text-4xl md:text-8xl font-heading font-light tracking-tight mb-6 md:mb-8 text-black">
              Generate <span className="text-accent-light italic font-medium">Meal.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed">
              Set your macro targets. Get a precise meal engineered for you. <br />
              Define targets. Engineering takes over.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-10">
                <div className="p-8 bg-gray-50 rounded-[32px] border border-black/5 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00aff0]/40" />
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#00aff0] font-bold block">Energy Output</span>
                    <div className="text-[10px] font-mono text-black space-y-0.5 leading-tight uppercase tracking-wider font-bold">
                      <p>P: 4kcal/g | C: 4kcal/g | F: 9kcal/g</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-mono font-black text-black">{calculatedCals}</span>
                    <span className="text-lg font-mono text-[#00aff0] ml-2">KCAL</span>
                  </div>
                </div>
                
                <div className="space-y-10 px-2">
                  <RangeSlider label="Protein" value={targets.p} min={20} max={80} onChange={v => setTargets({...targets, p: v})} unit="g" color="#00aff0" />
                  <RangeSlider label="Carbohydrates" value={targets.c} max={75} onChange={v => setTargets({...targets, c: v})} unit="g" color="#f97316" />
                  <RangeSlider label="Lipids / Fats" value={targets.f} max={30} onChange={v => setTargets({...targets, f: v})} unit="g" color="#10b981" />
                </div>
              </div>

              <button 
                onClick={generate}
                disabled={isGenerating}
                className="w-full py-6 bg-black text-white rounded-[20px] text-[10px] font-mono font-black tracking-[0.4em] uppercase hover:bg-[#00aff0] hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-black/5"
              >
                {isGenerating ? <RotateCcw className="animate-spin" size={16} /> : <Calculator size={16} />}
                {isGenerating ? 'ENGINEERING...' : 'START GENERATION'}
              </button>
            </div>

            <div className="lg:col-span-7 relative min-h-[500px] flex items-center justify-center bg-gray-50 rounded-[40px] p-6 md:p-10 border border-black/5 overflow-hidden">
              <AnimatePresence mode="wait">
                {!generatedMeal ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-20 h-20 rounded-[28px] border-2 border-dashed border-black/10 flex items-center justify-center mx-auto mb-6">
                      <Wand2 size={32} className="text-black/40" />
                    </div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.5em] text-black font-black">Awaiting System Input</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full h-full flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-8 md:mb-10">
                      <div>
                        <h4 className="text-2xl md:text-3xl font-heading font-black tracking-tighter text-black uppercase italic leading-none">{generatedMeal.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono tracking-widest text-black/20 uppercase block mb-1">Production Cost</span>
                        <span className="text-2xl md:text-3xl font-mono font-black text-black">€{generatedMeal.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
                      {[
                        { label: 'Energy', val: Math.round(generatedMeal.macros.cal), unit: 'kcal', color: 'text-black' },
                        { label: 'Protein', val: Math.round(generatedMeal.macros.p), unit: 'g', color: 'text-[#00aff0]' },
                        { label: 'Carbs', val: Math.round(generatedMeal.macros.c), unit: 'g', color: 'text-orange-500' },
                        { label: 'Fats', val: Math.round(generatedMeal.macros.f), unit: 'g', color: 'text-emerald-500' },
                      ].map(stat => (
                        <div key={stat.label} className="p-4 md:p-5 bg-white rounded-[20px] border border-black/5 shadow-sm">
                          <span className="block text-[8px] font-mono tracking-widest text-black/20 uppercase font-bold mb-1.5">{stat.label}</span>
                          <span className={`text-lg md:text-xl font-mono font-black ${stat.color}`}>{stat.val}<span className="text-[10px] opacity-40 ml-1 font-normal">{stat.unit}</span></span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 mb-12 flex-grow">
                      <span className="text-[9px] font-mono tracking-[0.5em] uppercase text-black/20 font-black block mb-4">Includes a tupperware microwave safe</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { icon: <Beef size={14}/>, label: 'Protein Source', name: generatedMeal.details.protein[0].name, weight: generatedMeal.details.protein[0].weight, cal: (generatedMeal.details.protein[0] as any).cal },
                          { icon: <Wheat size={14}/>, label: 'Carbs', name: generatedMeal.details.carb[0].name, weight: generatedMeal.details.carb[0].weight, cal: (generatedMeal.details.carb[0] as any).cal },
                          { icon: <Droplets size={14}/>, label: 'Sauce', name: generatedMeal.details.sauce[0].name, weight: generatedMeal.details.sauce[0].weight, cal: (generatedMeal.details.sauce[0] as any).cal },
                          { icon: <Zap size={14}/>, label: 'Veggies', name: generatedMeal.details.veggies[0].name, weight: generatedMeal.details.veggies[0].weight, cal: (generatedMeal.details.veggies[0] as any).cal },
                        ].filter(item => item.name !== 'Skip' && item.name !== 'No Sauce').map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-[20px] border border-black/5 shadow-sm">
                            <div className="p-2.5 bg-black text-white rounded-xl shrink-0">
                              {item.icon}
                            </div>
                            <div className="flex-grow min-w-0">
                              <span className="block text-[7px] font-mono text-black/60 uppercase tracking-widest leading-none mb-1.5">{item.label}</span>
                              <div className="flex justify-between items-start gap-3">
                                <p className="text-[11px] font-mono font-black text-black uppercase leading-tight">{item.name}</p>
                                <div className="text-right">
                                  <span className="text-[#00aff0] text-[10px] font-mono font-bold whitespace-nowrap block leading-none">{item.weight}{typeof item.weight === 'number' ? 'G' : ''}</span>
                                  <span className="text-black/20 text-[7px] font-mono font-bold whitespace-nowrap block mt-1">{item.cal} KCAL</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={handleCustomize}
                        className="flex-1 py-4 rounded-[16px] border border-black/10 text-[9px] font-mono font-bold tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <X size={12} className="rotate-45" /> Refine in Lab
                      </button>
                      <button 
                        onClick={() => {
                          addToCart({
                            id: `ai-${Date.now()}`,
                            name: generatedMeal.name,
                            price: generatedMeal.price,
                            quantity: 1,
                            type: 'lab',
                            details: generatedMeal.details
                          });
                        }}
                        className="flex-1 py-4 rounded-[16px] bg-black text-white text-[9px] font-mono font-black tracking-[0.3em] uppercase hover:bg-[#00aff0] hover:text-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                      >
                        <ShoppingCart size={12} /> Add to Basket
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MacroGenerator;
