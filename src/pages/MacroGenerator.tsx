import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Calculator, RotateCcw, ShoppingCart, Wand2, Beef, Wheat, Droplets, X, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { INGREDIENTS } from '../data/ingredients';

const RangeSlider = ({ label, value, max, onChange, unit = '' }: { label: string, value: number, max: number, onChange: (v: number) => void, unit?: string }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-mono tracking-widest text-black font-bold uppercase">{label}</span>
      <span className="text-sm font-mono text-black">{value}{unit}</span>
    </div>
    <input
      type="range"
      min="0"
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
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
    <div className="min-h-screen pt-32 pb-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-3 mb-6"
          >
            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
              <Zap size={28} fill="currentColor" />
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter text-black">
              Meal<span className="text-accent text-[#00aff0]">Generator</span>
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed"
          >
            Define your targets. Our algorithm will engineer a random high-performance protocol based on your exact macro requirements.
          </motion.p>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[48px] border border-black/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-12">
              <div className="grid grid-cols-1 gap-10">
                <div className="p-8 bg-gray-50 rounded-3xl border border-black/5 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-accent font-bold block mb-1">Total Payload</span>
                    <div className="text-[10px] font-mono text-black/40 space-y-0.5 leading-tight uppercase tracking-wider">
                      <p>1g protein = 4 kcal</p>
                      <p>1g carb = 4 kcal</p>
                      <p>1g fat = 9 kcal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-mono font-black text-black">{calculatedCals} <span className="text-xl opacity-20">kcal</span></span>
                  </div>
                </div>
                
                <div className="space-y-10">
                  <RangeSlider label="Protein" value={targets.p} max={200} onChange={v => setTargets({...targets, p: v})} unit="g" />
                  <RangeSlider label="Carbs" value={targets.c} max={300} onChange={v => setTargets({...targets, c: v})} unit="g" />
                  <RangeSlider label="Fats" value={targets.f} max={100} onChange={v => setTargets({...targets, f: v})} unit="g" />
                </div>
              </div>

              <button 
                onClick={generate}
                disabled={isGenerating}
                className="w-full py-6 bg-black text-white rounded-3xl text-xs font-mono font-bold tracking-[0.3em] uppercase hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isGenerating ? <RotateCcw className="animate-spin" size={18} /> : <Calculator size={18} />}
                {isGenerating ? 'Engineering...' : 'Generate New Protocol'}
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
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-black/10 flex items-center justify-center mx-auto mb-6">
                      <Wand2 size={32} className="text-black/10" />
                    </div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/20 font-bold">Awaiting Input Parameters</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full h-full flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-accent font-bold block mb-4">Protocol Result</span>
                        <h4 className="text-4xl font-heading font-black tracking-tighter text-black">{generatedMeal.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono tracking-widest text-black/40 uppercase block mb-1">Est. Price</span>
                        <span className="text-3xl font-mono font-bold text-black">€{generatedMeal.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                      {[
                        { label: 'Energy', val: Math.round(generatedMeal.macros.cal), unit: 'kcal', color: 'text-black' },
                        { label: 'Protein', val: Math.round(generatedMeal.macros.p), unit: 'g', color: 'text-accent' },
                        { label: 'Carbs', val: Math.round(generatedMeal.macros.c), unit: 'g', color: 'text-orange-500' },
                        { label: 'Fats', val: Math.round(generatedMeal.macros.f), unit: 'g', color: 'text-emerald-500' },
                      ].map(stat => (
                        <div key={stat.label} className="p-4 bg-white rounded-2xl border border-black/5">
                          <span className="block text-[8px] font-mono tracking-widest text-black/40 uppercase font-bold mb-1">{stat.label}</span>
                          <span className={`text-xl font-mono font-bold ${stat.color}`}>{stat.val}<span className="text-[10px] opacity-40 ml-0.5">{stat.unit}</span></span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 mb-12 flex-grow">
                      <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-black/40 font-bold block mb-4">Engineered Selection</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: <Beef size={14}/>, label: 'Protein', name: generatedMeal.details.protein[0].name, weight: generatedMeal.details.protein[0].weight },
                          { icon: <Wheat size={14}/>, label: 'Carb', name: generatedMeal.details.carb[0].name, weight: generatedMeal.details.carb[0].weight },
                          { icon: <Droplets size={14}/>, label: 'Sauce', name: generatedMeal.details.sauce[0].name, weight: generatedMeal.details.sauce[0].weight },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl border border-black/5">
                            <div className="p-2 bg-black text-white rounded-lg">{item.icon}</div>
                            <div>
                              <span className="block text-[8px] font-mono text-black/40 uppercase tracking-widest leading-none mb-1">{item.label}</span>
                              <p className="text-[10px] font-mono font-bold text-black uppercase">{item.name} <span className="opacity-30">{item.weight}g</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={handleCustomize}
                        className="flex-1 py-5 rounded-2xl border border-black/10 text-[10px] font-mono font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
                      >
                        <X size={14} className="rotate-45" /> Customize in Lab
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
                        className="flex-1 py-5 rounded-2xl bg-[#00aff0] text-black text-[10px] font-mono font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
                      >
                        <ShoppingCart size={14} /> Add to Basket
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
