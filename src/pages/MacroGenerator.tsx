import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Calculator, RotateCcw, ShoppingCart, Wand2, Beef, Wheat, Droplets, X, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { INGREDIENTS } from '../data/ingredients';

const RangeSlider = ({ label, value, max, onChange, unit = '', color = '#00aff0' }: { label: string, value: number, max: number, onChange: (v: number) => void, unit?: string, color?: string }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-mono tracking-[0.4em] text-black/40 font-black uppercase leading-none">{label}</span>
      <span className="text-2xl font-mono text-black leading-none font-black">{value}<span className="text-[10px] ml-1" style={{ color }}>{unit}</span></span>
    </div>
    <input
      type="range"
      min="0"
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
  const [targets, setTargets] = useState({ p: 50, c: 60, f: 15 });
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
        cPool = INGREDIENTS.carb.filter(i => i.name === 'Cauli Rice' || i.name === 'Skip');
      }
      if (targets.p < 15) {
        pPool = INGREDIENTS.protein.filter(i => i.name === 'Egg Whites' || i.name === 'Skip');
      }

      const pOpt = pPool[Math.floor(Math.random() * pPool.length)];
      const cOpt = cPool[Math.floor(Math.random() * cPool.length)];
      const vOpt = INGREDIENTS.veggies.filter(i => i.name !== 'Skip')[Math.floor(Math.random() * (INGREDIENTS.veggies.length - 1))];
      const sOpt = INGREDIENTS.sauce.filter(i => i.name !== 'No Sauce')[Math.floor(Math.random() * (INGREDIENTS.sauce.length - 1))];

      const fixedP = (vOpt.p * 1) + (sOpt.p * 0.25);
      const fixedC = (vOpt.c * 1) + (sOpt.c * 0.25);
      const fixedF = (vOpt.f * 1) + (sOpt.f * 0.25);
      const fixedCal = (vOpt.cal * 1) + (sOpt.cal * 0.25);

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

      let finalWp = pOpt.name === 'Skip' ? 0 : Math.max(100, Math.min(400, Math.round(Wp * 100 / 50) * 50));
      let finalWc = cOpt.name === 'Skip' ? 0 : Math.max(100, Math.min(400, Math.round(Wc * 100 / 50) * 50));

      if (targets.c < 10 && Cc > 10) finalWc = 0;
      if (cOpt.name === 'Skip') finalWc = 0;
      if (pOpt.name === 'Skip') finalWp = 0;

      const macros = {
        p: (pOpt.p * finalWp / 100) + (cOpt.p * finalWc / 100) + fixedP,
        c: (pOpt.c * finalWp / 100) + (cOpt.c * finalWc / 100) + fixedC,
        f: (pOpt.f * finalWp / 100) + (cOpt.f * finalWc / 100) + fixedF,
        cal: (pOpt.cal * finalWp / 100) + (cOpt.cal * finalWc / 100) + fixedCal,
      };

      const finalMealPrice = (pOpt.pricing ? (pOpt.pricing[finalWp] || 0) : 0) + 
                            (cOpt.pricing ? (cOpt.pricing[finalWc] || 0) : 0) + 
                            (vOpt.tier === 'premium' ? 0.90 : 0.60) + 
                            (sOpt.tier === 'premium' ? 1.10 : 0.65) + 0.90;

      setGeneratedMeal({
        name: `AI Protocol: ${pOpt.name === 'Skip' ? 'Lean' : pOpt.name.split(' ')[0]} ${cOpt.name === 'Skip' ? 'Zero' : cOpt.name.split(' ')[0]}`,
        details: {
          protein: [{ name: pOpt.name, weight: finalWp }],
          carb: [{ name: cOpt.name, weight: finalWc }],
          veggies: [{ name: vOpt.name, weight: 100 }],
          sauce: [{ name: sOpt.name, weight: 25 }],
        },
        macros,
        price: finalMealPrice
      });
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
    <div className="min-h-screen pt-24 pb-16 bg-white relative overflow-hidden text-black font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00aff0]/5 rounded-full blur-[150px] -z-10 pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00aff0]/3 rounded-full blur-[120px] -z-10 pointer-events-none opacity-30" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3 px-3 py-1.5 bg-[#00aff0]/10 rounded-full border border-[#00aff0]/20 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00aff0] animate-pulse" />
              <span className="text-[9px] font-mono font-black tracking-[0.4em] text-[#00aff0] uppercase">Engine Status: Ready</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter text-black leading-none">
              GENERATE<span className="text-[#00aff0]">MEAL.</span>
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto text-base font-light leading-relaxed mt-2">
              AI-driven synthesis of high-performance meal protocols. <br />
              <span className="text-[#00aff0]/60 font-mono text-xs tracking-widest uppercase text-center">Define targets. Engineering takes over.</span>
            </p>
          </motion.div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[40px] border border-black/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
          {/* Internal Glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#00aff0]/5 rounded-full blur-[80px] group-hover:bg-[#00aff0]/10 transition-all duration-700" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-10">
                <div className="p-8 bg-gray-50 rounded-[32px] border border-black/5 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00aff0]/40" />
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#00aff0] font-bold block">Energy Output</span>
                    <div className="text-[8px] font-mono text-black/20 space-y-0.5 leading-tight uppercase tracking-wider">
                      <p>P: 4kcal/g | C: 4kcal/g | F: 9kcal/g</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-mono font-black text-black">{calculatedCals}</span>
                    <span className="text-lg font-mono text-[#00aff0] ml-2">KCAL</span>
                  </div>
                </div>
                
                <div className="space-y-10 px-2">
                  <RangeSlider label="Protein" value={targets.p} max={80} onChange={v => setTargets({...targets, p: v})} unit="g" color="#00aff0" />
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

            <div className="lg:col-span-7 relative min-h-[500px] flex items-center justify-center bg-gray-50 rounded-[40px] p-10 border border-black/5 overflow-hidden">
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
                      <Wand2 size={32} className="text-black/5" />
                    </div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-black/10 font-black">Awaiting System Input</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full h-full flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00aff0]" />
                          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#00aff0] font-bold block">Protocol Derived</span>
                        </div>
                        <h4 className="text-3xl font-heading font-black tracking-tighter text-black uppercase italic leading-none">{generatedMeal.name.replace('AI Protocol:', '')}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono tracking-widest text-black/20 uppercase block mb-1">Production Cost</span>
                        <span className="text-3xl font-mono font-black text-black">€{generatedMeal.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                      {[
                        { label: 'Energy', val: Math.round(generatedMeal.macros.cal), unit: 'kcal', color: 'text-black' },
                        { label: 'Protein', val: Math.round(generatedMeal.macros.p), unit: 'g', color: 'text-[#00aff0]' },
                        { label: 'Carbs', val: Math.round(generatedMeal.macros.c), unit: 'g', color: 'text-orange-500' },
                        { label: 'Fats', val: Math.round(generatedMeal.macros.f), unit: 'g', color: 'text-emerald-500' },
                      ].map(stat => (
                        <div key={stat.label} className="p-5 bg-white rounded-[20px] border border-black/5 shadow-sm">
                          <span className="block text-[8px] font-mono tracking-widest text-black/20 uppercase font-bold mb-1.5">{stat.label}</span>
                          <span className={`text-xl font-mono font-black ${stat.color}`}>{stat.val}<span className="text-[10px] opacity-40 ml-1 font-normal">{stat.unit}</span></span>
                        </div>
                      ))}
                    </div>                    <div className="space-y-4 mb-12 flex-grow">
                      <span className="text-[9px] font-mono tracking-[0.5em] uppercase text-black/20 font-black block mb-4">Synthesis Profile</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { icon: <Beef size={14}/>, label: 'Protein Source', name: generatedMeal.details.protein[0].name, weight: generatedMeal.details.protein[0].weight },
                          { icon: <Wheat size={14}/>, label: 'Carb Payload', name: generatedMeal.details.carb[0].name, weight: generatedMeal.details.carb[0].weight },
                          { icon: <Droplets size={14}/>, label: 'Enzyme / Sauce', name: generatedMeal.details.sauce[0].name, weight: generatedMeal.details.sauce[0].weight },
                          { icon: <Zap size={14}/>, label: 'Micros / Veg', name: generatedMeal.details.veggies[0].name, weight: generatedMeal.details.veggies[0].weight },
                        ].filter(item => item.name !== 'Skip' && item.name !== 'No Sauce').map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-[20px] border border-black/5 shadow-sm">
                            <div className="p-2.5 bg-black text-white rounded-xl">
                              {item.icon}
                            </div>
                            <div>
                              <span className="block text-[7px] font-mono text-black/60 uppercase tracking-widest leading-none mb-1.5">{item.label}</span>
                              <p className="text-[11px] font-mono font-black text-black uppercase line-clamp-1">{item.name} <span className="text-[#00aff0] ml-1.5">{item.weight}{typeof item.weight === 'number' ? 'G' : ''}</span></p>
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
    </div>
  );
};

export default MacroGenerator;
