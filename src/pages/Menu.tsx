import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Info, ChevronLeft, ChevronRight, Zap, Calculator, RotateCcw } from 'lucide-react';
import { ALL_MEALS } from '../data/meals';
import { type Meal } from '../types';
import { useCart } from '../context/CartContext';
import { Toast } from '../components/Toast';
import { INGREDIENTS } from '../data/ingredients';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
};

const PROTEINS = ['Chicken', 'Beef', 'Tuna', 'Shrimp', 'Egg', 'Cottage Cheese', 'Yoghurt', 'Mixed'];
const GOALS = ['High Protein', 'Low Carb', 'Balanced', 'Bulk', 'Grab & Go', 'Breakfast'];

const FilterPill = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-56 px-6 py-4 rounded-2xl border text-[10px] font-mono tracking-widest transition-all duration-300 text-left ${
      active 
        ? 'bg-accent-light dark:bg-white border-accent-light dark:border-white text-white dark:text-black scale-[1.02]' 
        : 'bg-white dark:bg-surface border-black/20 dark:border-border text-black font-bold dark:text-secondary hover:border-black/40 dark:hover:border-white/30'
    }`}
  >
    {label.toUpperCase()}
  </button>
);

const RangeSlider = ({ label, value, max, onChange, unit = '' }: { label: string, value: number, max: number, onChange: (v: number) => void, unit?: string }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-mono tracking-widest text-black font-bold uppercase">{label}</span>
      <span className="text-sm font-mono text-black dark:text-white">{value}{unit}</span>
    </div>
    <input
      type="range"
      min="0"
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-gray-200 dark:bg-surface rounded-lg appearance-none cursor-pointer accent-accent-light dark:accent-accent"
    />
  </div>
);

const MealCard = ({ meal, onClick }: { meal: Meal, onClick: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.4 }}
    onClick={onClick}
    className="group bg-white dark:bg-card border border-black/5 dark:border-border rounded-[32px] overflow-hidden flex flex-col aspect-square transition-all duration-500 cursor-pointer"
  >
    <div className="relative h-1/2 overflow-hidden bg-gray-100 dark:bg-black">
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-card to-transparent z-10 opacity-60"></div>
      {meal.img ? (
        <img
          src={meal.img}
          alt={meal.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gray-50 dark:bg-black/40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 opacity-20">
            <div className="w-12 h-12 rounded-full border border-black dark:border-white flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold tracking-tighter">B /</span>
            </div>
            <span className="text-[8px] font-mono tracking-widest uppercase">No Visual</span>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 z-20">
        <span className="text-[10px] font-mono tracking-widest text-black font-bold uppercase border border-black/10 px-4 py-1.5 rounded-full shadow-lg bg-white/95">
          {meal.label}
        </span>
      </div>
    </div>
    
    <div className="p-6 flex flex-col justify-between flex-grow">
      <div>
        <h3 className="text-lg font-heading font-medium tracking-wide text-black dark:text-white mb-0.5 line-clamp-1">{meal.title}</h3>
        <p className="text-[10px] font-medium text-gray-600 dark:text-secondary mb-2 uppercase tracking-tighter">{meal.subtitle}</p>
      </div>
      
      <div className="grid grid-cols-4 gap-2 border-t border-black/10 dark:border-border pt-4">
        <div className="flex flex-col">
          <span className="text-[8px] font-mono tracking-wider text-black dark:text-white/60 font-bold mb-0.5 uppercase">Kcal.</span>
          <span className="text-[10px] font-mono text-black dark:text-white font-bold">{meal.macros.energy}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-mono tracking-wider text-accent font-bold mb-0.5 uppercase">PROTEIN</span>
          <span className="text-[10px] font-mono text-black dark:text-white font-bold">{meal.macros.protein}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-mono tracking-wider text-orange-500 font-bold mb-0.5 uppercase">Carbs</span>
          <span className="text-[10px] font-mono text-black dark:text-white font-bold">{meal.macros.carbs}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-mono tracking-wider text-emerald-500 font-bold mb-0.5 uppercase">Fats</span>
          <span className="text-[10px] font-mono text-black dark:text-white font-bold">{meal.macros.fats}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const MealModal = ({ meals, currentIndex, onClose, onNavigate, addToCart }: { meals: Meal[], currentIndex: number, onClose: () => void, onNavigate: (index: number) => void, addToCart: (item: any) => void }) => {
  const meal = meals[currentIndex];
  
  if (!meal) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Navigation Arrows */}
      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + meals.length) % meals.length); }}
        className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-[110] w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
      >
        <ChevronLeft size={32} />
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % meals.length); }}
        className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-[110] w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
      >
        <ChevronRight size={32} />
      </button>

      <motion.div 
        key={meal.id}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl bg-white dark:bg-card rounded-[40px] overflow-hidden flex flex-col md:flex-row border border-white/10 shadow-none"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-1/2 h-[300px] md:h-auto relative overflow-hidden bg-gray-100 dark:bg-black">
          {meal.img ? (
            <img src={meal.img} alt={meal.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-50 dark:bg-black/40 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 opacity-20">
                <div className="w-16 h-16 rounded-full border border-black dark:border-white flex items-center justify-center">
                  <span className="text-xl font-mono font-bold tracking-tighter">B /</span>
                </div>
                <span className="text-[10px] font-mono tracking-widest uppercase">Image Pending</span>
              </div>
            </div>
          )}
          <div className="absolute top-8 left-8">
            <span className="text-xs font-mono tracking-[0.4em] text-black font-bold uppercase border border-black/10 px-6 py-2.5 rounded-full shadow-2xl bg-white/95">
              {meal.label}
            </span>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-black dark:text-white mb-2">{meal.title}</h2>
            <p className="text-xl text-accent-light dark:text-accent font-mono tracking-widest uppercase">{meal.subtitle}</p>
          </div>

          <div className="space-y-6 mb-12">
            <p className="text-lg text-gray-600 dark:text-secondary leading-relaxed font-light">
              {meal.desc}
            </p>
            <div className="flex flex-wrap gap-3">
              {meal.goals.map(goal => (
                <span key={goal} className="px-4 py-1.5 rounded-full border border-accent-light/20 dark:border-accent/20 bg-accent-light/5 dark:bg-accent/5 text-[10px] font-mono tracking-widest text-accent-light dark:text-accent uppercase">
                  {goal}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 pt-10 border-t border-black/5 dark:border-border">
            <div className="space-y-1">
              <span className="block text-[10px] font-mono tracking-widest text-black dark:text-white font-bold uppercase">KCAL.</span>
              <span className="text-xl font-mono text-black dark:text-white">{meal.macros.energy}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-mono tracking-widest text-accent font-bold uppercase">PROTEIN</span>
              <span className="text-xl font-mono text-black dark:text-white">{meal.macros.protein}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-mono tracking-widest text-orange-500 font-bold uppercase">CARBS</span>
              <span className="text-xl font-mono text-black dark:text-white">{meal.macros.carbs}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-mono tracking-widest text-emerald-500 font-bold uppercase">FATS</span>
              <span className="text-xl font-mono text-black dark:text-white">{meal.macros.fats}</span>
            </div>
          </div>

          <button 
            onClick={() => {
              addToCart({
                id: meal.id,
                name: meal.title,
                price: 9.00,
                quantity: 1,
                type: 'standard',
                details: meal.labDetails
              });
              onClose();
            }}
            className="mt-12 w-full py-5 rounded-[24px] bg-accent-light dark:bg-accent text-white dark:text-black text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Add to Basket
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const MacroGenerator = () => {
  const { addToCart } = useCart();
  const [targets, setTargets] = useState({ p: 50, c: 60, f: 15 });
  const [generatedMeal, setGeneratedMeal] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Strict Calorie Calculation: (P * 4) + (C * 4) + (F * 9)
  const calculatedCals = useMemo(() => {
    return (targets.p * 4) + (targets.c * 4) + (targets.f * 9);
  }, [targets]);

  const generate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // 1. Intelligent Ingredient Selection based on targets
      let pPool = INGREDIENTS.protein.filter(i => i.name !== 'Skip');
      let cPool = INGREDIENTS.carb.filter(i => i.name !== 'Skip');
      
      // If low carb target, prefer Cauli Rice or Skip
      if (targets.c < 15) {
        cPool = INGREDIENTS.carb.filter(i => i.name === 'Cauli Rice' || i.name === 'Skip');
      }
      // If low protein, allow skip
      if (targets.p < 15) {
        pPool = INGREDIENTS.protein.filter(i => i.name === 'Egg Whites' || i.name === 'Skip');
      }

      const pOpt = pPool[Math.floor(Math.random() * pPool.length)];
      const cOpt = cPool[Math.floor(Math.random() * cPool.length)];
      const vOpt = INGREDIENTS.veggies.filter(i => i.name !== 'Skip')[Math.floor(Math.random() * (INGREDIENTS.veggies.length - 1))];
      const sOpt = INGREDIENTS.sauce.filter(i => i.name !== 'No Sauce')[Math.floor(Math.random() * (INGREDIENTS.sauce.length - 1))];

      // 2. Fixed contributions (Veggies 100g, Sauce 25g)
      const fixedP = (vOpt.p * 1) + (sOpt.p * 0.25);
      const fixedC = (vOpt.c * 1) + (sOpt.c * 0.25);
      const fixedF = (vOpt.f * 1) + (sOpt.f * 0.25);
      const fixedCal = (vOpt.cal * 1) + (sOpt.cal * 0.25);

      const remP = Math.max(0, targets.p - fixedP);
      const remC = Math.max(0, targets.c - fixedC);

      // 3. Linear Solver for weights (Wp and Wc in units of 100g)
      // Wp*Pp + Wc*Pc = remP
      // Wp*Cp + Wc*Cc = remC
      const Pp = pOpt.p; const Pc = cOpt.p;
      const Cp = pOpt.c; const Cc = cOpt.c;

      let Wp = 0, Wc = 0;
      const det = (Pp * Cc) - (Pc * Cp);

      if (Math.abs(det) < 0.1) {
        // Degenerate case: just do simple estimate
        Wp = remP / (Pp || 1);
        Wc = remC / (Cc || 1);
      } else {
        Wp = (remP * Cc - remC * Pc) / det;
        Wc = (remC * Pp - remP * Cp) / det;
      }

      // 4. Normalize and apply constraints
      let finalWp = pOpt.name === 'Skip' ? 0 : Math.max(100, Math.min(400, Math.round(Wp * 100 / 50) * 50));
      let finalWc = cOpt.name === 'Skip' ? 0 : Math.max(100, Math.min(400, Math.round(Wc * 100 / 50) * 50));

      // Special case: if target C is ultra low and Cc is high, force Wc down
      if (targets.c < 10 && Cc > 10) finalWc = 0;
      if (cOpt.name === 'Skip') finalWc = 0;
      if (pOpt.name === 'Skip') finalWp = 0;

      const macros = {
        p: (pOpt.p * finalWp / 100) + (cOpt.p * finalWc / 100) + fixedP,
        c: (pOpt.c * finalWp / 100) + (cOpt.c * finalWc / 100) + fixedC,
        f: (pOpt.f * finalWp / 100) + (cOpt.f * finalWc / 100) + fixedF,
        cal: (pOpt.cal * finalWp / 100) + (cOpt.cal * finalWc / 100) + fixedCal,
      };

      setGeneratedMeal({
        name: `AI Protocol: ${pOpt.name === 'Skip' ? 'Lean' : pOpt.name.split(' ')[0]} ${cOpt.name === 'Skip' ? 'Zero' : cOpt.name.split(' ')[0]}`,
        details: {
          protein: [{ name: pOpt.name, weight: finalWp }],
          carb: [{ name: cOpt.name, weight: finalWc }],
          veggies: [{ name: vOpt.name, weight: 100 }],
          sauce: [{ name: sOpt.name, weight: 25 }],
        },
        macros,
        price: 9.00
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
    <div className="bg-white dark:bg-card p-10 md:p-12 rounded-[48px] border border-black/5 dark:border-border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-accent/10 rounded-2xl text-accent">
                <Zap size={22} fill="currentColor" />
              </div>
              <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-accent font-bold">AI Engineering</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-heading font-medium tracking-tight mb-4 text-black dark:text-white">Macro Generator.</h3>
            <p className="text-lg text-gray-600 dark:text-secondary font-light leading-relaxed">
              Define your targets. Our algorithm will engineer a random high-performance protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="md:col-span-2 p-6 bg-gray-50 dark:bg-black/40 rounded-3xl border border-black/5 flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-accent font-bold block mb-1">Did you know?</span>
                <div className="text-[10px] font-mono text-black/40 dark:text-white/20 space-y-0.5 leading-tight uppercase tracking-wider">
                  <p>1g protein = 4 kcal</p>
                  <p>1g carb = 4 kcal</p>
                  <p>1g fat = 9 kcal</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-mono uppercase tracking-[0.2em] opacity-40 mb-1">Total Calories</span>
                <span className="text-4xl font-mono font-bold text-black dark:text-white">{calculatedCals} <span className="text-lg opacity-40">kcal</span></span>
              </div>
            </div>
            
            <RangeSlider label="Protein" value={targets.p} max={200} onChange={v => setTargets({...targets, p: v})} unit="g" />
            <RangeSlider label="Carbs" value={targets.c} max={300} onChange={v => setTargets({...targets, c: v})} unit="g" />
            <RangeSlider label="Fats" value={targets.f} max={100} onChange={v => setTargets({...targets, f: v})} unit="g" />
          </div>

          <button 
            onClick={generate}
            disabled={isGenerating}
            className="w-full py-6 bg-black dark:bg-accent text-white dark:text-black rounded-3xl text-xs font-mono font-bold tracking-[0.3em] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl shadow-black/10"
          >
            {isGenerating ? <RotateCcw className="animate-spin" size={18} /> : <Calculator size={18} />}
            {isGenerating ? 'Engineering...' : 'Generate New Protocol'}
          </button>
        </div>

        <div className="lg:col-span-7 relative min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-black/20 rounded-[40px] p-8 border border-black/5">
          <AnimatePresence mode="wait">
            {!generatedMeal ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 border-2 border-dashed border-black/10 dark:border-white/10 rounded-full mx-auto flex items-center justify-center text-black/10 dark:text-white/10">
                  <Calculator size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-mono tracking-[0.3em] uppercase text-black/40">Ready to build</p>
                  <p className="text-sm text-gray-400 font-light italic">Configure targets to start engineering</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="meal"
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg bg-white dark:bg-card border border-black/10 dark:border-border p-10 md:p-12 rounded-[40px] shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-2xl font-heading font-medium text-black dark:text-white">{generatedMeal.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] font-mono tracking-widest uppercase text-accent font-bold">Optimized Sequence</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-mono font-bold text-black dark:text-white">€{generatedMeal.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 py-8 border-y border-black/5">
                    {[
                      { label: 'Kcal.', val: generatedMeal.macros.cal, unit: '', color: 'text-black dark:text-white' },
                      { label: 'PROTEIN', val: generatedMeal.macros.p, unit: 'g', color: 'text-accent' },
                      { label: 'Carbs', val: generatedMeal.macros.c, unit: 'g', color: 'text-orange-500' },
                      { label: 'Fats', val: generatedMeal.macros.f, unit: 'g', color: 'text-emerald-500' },
                    ].map(m => (
                      <div key={m.label} className="space-y-1.5 text-center">
                        <span className={`block text-[8px] font-mono uppercase tracking-widest font-bold ${m.color === 'text-black dark:text-white' ? 'opacity-40' : ''} ${m.color}`}>{m.label}</span>
                        <span className={`text-lg font-mono font-bold ${m.color}`}>{Math.round(m.val)}{m.unit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2">
                    {Object.entries(generatedMeal.details).map(([cat, items]: [string, any]) => {
                      const isSkip = items[0].name === 'Skip' || items[0].name === 'No Sauce';
                      return (
                        <div key={cat} className="space-y-1">
                          <span className="block text-[8px] font-mono uppercase tracking-widest opacity-30">{cat}</span>
                          <span className="block text-[11px] font-bold text-black dark:text-white line-clamp-1">{items[0].name}</span>
                          {!isSkip && <span className="block text-[9px] font-mono text-gray-400">{items[0].weight}g</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                  <button 
                    onClick={() => {
                      addToCart({
                        id: `ai-${Date.now()}`,
                        ...generatedMeal,
                        type: 'lab',
                        quantity: 1
                      });
                    }}
                    className="w-full py-5 bg-black dark:bg-accent text-white dark:text-black rounded-2xl text-[10px] font-mono font-bold tracking-[0.3em] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                  >
                    Add to Basket
                  </button>
                  <button 
                    onClick={handleCustomize}
                    className="w-full py-5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-2xl text-[10px] font-mono font-bold tracking-[0.3em] uppercase hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Customize in Lab
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Menu = () => {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeProtein, setActiveProtein] = useState<string | null>(null);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [maxCals, setMaxCals] = useState(1000);
  const [minProtein, setMinProtein] = useState(0);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setShowToast(true);
  };

  const filteredMeals = useMemo(() => {
    return ALL_MEALS.filter(meal => {
      const matchesSearch = meal.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           meal.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !activeCategory || meal.category === activeCategory;
      const matchesProtein = !activeProtein || meal.proteinSource.includes(activeProtein);
      const matchesGoal = !activeGoal || meal.goals.includes(activeGoal);
      const matchesCals = parseInt(meal.macros.energy) <= maxCals;
      const matchesProteinLevel = parseInt(meal.macros.protein) >= minProtein;

      return matchesSearch && matchesCategory && matchesProtein && matchesGoal && matchesCals && matchesProteinLevel;
    });
  }, [searchTerm, activeCategory, activeProtein, activeGoal, maxCals, minProtein]);

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedMealIndex === null) return;
      if (e.key === 'ArrowLeft') setSelectedMealIndex((selectedMealIndex - 1 + filteredMeals.length) % filteredMeals.length);
      if (e.key === 'ArrowRight') setSelectedMealIndex((selectedMealIndex + 1) % filteredMeals.length);
      if (e.key === 'Escape') setSelectedMealIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMealIndex, filteredMeals]);

  return (
    <div className="min-h-screen bg-white dark:bg-background transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-gray-50 dark:bg-surface border-b border-black/5 dark:border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant} className="max-w-3xl">
            <span className="text-[10px] font-mono tracking-[0.4em] text-accent-light dark:text-accent uppercase mb-4 block">BYTE / PROTOCOLS</span>
            <h1 className="text-6xl md:text-8xl font-heading font-light tracking-tight mb-8 text-black dark:text-white">
              The <span className="text-accent-light dark:text-accent italic font-medium">Menu.</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-secondary font-light leading-relaxed">
              Precision nutrition across six distinct protocols. <br />
              Select your goal. Engineer your life.
            </p>
          </motion.div>
        </div>
      </section>


      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <MacroGenerator />
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Search & Stats */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 rounded-full bg-gray-50 dark:bg-surface border border-black/5 dark:border-border text-black dark:text-white focus:outline-none focus:border-accent-light dark:focus:border-accent transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white">
                  <X size={20} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm font-mono tracking-widest text-gray-500 dark:text-secondary uppercase">
              <span className="text-black dark:text-white font-bold">{filteredMeals.length}</span> MEALS FOUND
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-12">
              <div className="space-y-6">
                <span className="text-sm font-mono tracking-[0.4em] text-gray-400 dark:text-secondary/60 uppercase block">Macros</span>
                <RangeSlider label="Max Calories" value={maxCals} max={1000} onChange={setMaxCals} unit=" kcal" />
                <RangeSlider label="Min Protein" value={minProtein} max={100} onChange={setMinProtein} unit="g" />
              </div>

              <div className="space-y-6">
                <span className="text-sm font-mono tracking-[0.4em] text-gray-400 dark:text-secondary/60 uppercase block">Protein Source</span>
                <div className="flex flex-col gap-3">
                  {PROTEINS.map(p => (
                    <FilterPill key={p} label={p} active={activeProtein === p} onClick={() => setActiveProtein(activeProtein === p ? null : p)} />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <span className="text-sm font-mono tracking-[0.4em] text-gray-400 dark:text-secondary/60 uppercase block">Goal</span>
                <div className="flex flex-col gap-3">
                  {GOALS.map(g => (
                    <FilterPill key={g} label={g} active={activeGoal === g} onClick={() => setActiveGoal(activeGoal === g ? null : g)} />
                  ))}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="popLayout">
                {filteredMeals.length > 0 ? (
                  <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMeals.map((meal, index) => (
                      <MealCard key={meal.id} meal={meal} onClick={() => setSelectedMealIndex(index)} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                    <p className="text-xl text-gray-400 font-light">No meals match your current selection.</p>
                    <button 
                      onClick={() => { setActiveCategory(null); setActiveProtein(null); setActiveGoal(null); setSearchTerm(''); }}
                      className="mt-6 text-accent-light dark:text-accent font-mono text-sm tracking-widest uppercase border-b border-accent/20 pb-1"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Category Legend Grid */}
      <section className="py-24 border-t border-black/5 dark:border-border/50 bg-gray-50/30 dark:bg-surface/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'CORE', name: 'CORE', sub: 'The Daily Standard', desc: 'Balanced macro profile (40/30/30) designed for consistent energy and metabolic health. Ideal for those seeking long-term vitality.' },
              { id: 'LEAN', name: 'LEAN', sub: 'Precision Cutting', desc: 'High protein, lower carb profile optimized for fat loss while preserving muscle tissue. Engineered for lean aesthetics.' },
              { id: 'ZERO', name: 'ZERO', sub: 'Ketogenic Excellence', desc: 'Strict ultra-low carb protocol. Shifts your body to fat-burning mode for elite mental clarity and sustained energy.' },
              { id: 'MASS', name: 'MASS', sub: 'Hypertrophy Engine', desc: 'Calorie-dense, high-carb formulations designed to fuel intense training and muscle growth. For hard-gainers.' },
              { id: 'BOOST', name: 'BOOST', sub: 'Peak Performance', desc: 'Nutrient-dense pre-workout protocols. Engineered to provide immediate energy spikes for high-intensity output.' },
              { id: 'READY', name: 'READY', sub: 'Performance on the Move', desc: 'Grab-and-go engineered nutrition. Cold-pressed or wrap-style meals for the high-performer with zero downtime.' },
            ].map((cat) => (
              <div key={cat.id} className="p-10 rounded-[40px] bg-white dark:bg-card border border-black/5 dark:border-border transition-all duration-500 flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl md:text-5xl font-heading font-medium text-black dark:text-white tracking-tighter hover:text-accent-light dark:hover:text-accent transition-colors">{cat.name}</span>
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Info size={20} />
                  </div>
                </div>
                <span className="text-xs font-mono tracking-widest text-accent-light dark:text-accent font-bold uppercase mb-4 block">{cat.sub}</span>
                <p className="text-base text-gray-600 dark:text-secondary/80 font-light leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedMealIndex !== null && (
          <MealModal 
            meals={filteredMeals} 
            currentIndex={selectedMealIndex} 
            onClose={() => setSelectedMealIndex(null)} 
            onNavigate={(index) => setSelectedMealIndex(index)}
            addToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      <Toast 
        isVisible={showToast} 
        message="Meal added to basket" 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export default Menu;
