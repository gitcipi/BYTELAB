import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Info, ChevronLeft, ChevronRight, Filter, ChevronDown } from 'lucide-react';
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

  const calculateMealPrice = (details?: any) => {
    if (!details) return 6.50; // Dynamic fallback
    
    let subtotal = 0;
    const categories = ['protein', 'carb', 'veggies', 'sauce'];
    
    categories.forEach(cat => {
      const items = details[cat] || [];
      items.forEach((item: any) => {
        const opt = INGREDIENTS[cat as keyof typeof INGREDIENTS].find(i => i.name === item.name);
        if (!opt || item.name === 'Skip' || item.name === 'No Sauce') return;
        
        let price = 0;
        if (opt.pricing) {
          const weights = Object.keys(opt.pricing).map(Number).sort((a, b) => a - b);
          price = opt.pricing[item.weight] || 0;
          if (!price) {
            if (item.weight <= weights[0]) price = opt.pricing[weights[0]];
            else if (item.weight >= weights[weights.length - 1]) price = opt.pricing[weights[weights.length - 1]];
            else {
              const lower = [...weights].reverse().find(t => t < item.weight) || weights[0];
              const upper = weights.find(t => t > item.weight) || weights[weights.length - 1];
              const lp = opt.pricing[lower];
              const up = opt.pricing[upper];
              price = lp + (up - lp) * ((item.weight - lower) / (upper - lower));
            }
          }
        } else if (cat === 'veggies') {
          price = item.weight * (opt.tier === 'premium' ? 0.90 / 100 : 0.60 / 100);
        } else if (cat === 'sauce') {
          if (opt.tier === 'flat') price = 0.55;
          else {
            const bp = opt.tier === 'tomato' ? { 25: 0.45, 50: 0.75, 75: 1.05, 100: 1.35 } : { 25: 0.55, 50: 0.95, 75: 1.35, 100: 1.70 };
            const tiers = Object.keys(bp).map(Number).sort((a, b) => a - b);
            price = (bp as any)[item.weight] || 0;
            if (!price) {
              const lower = [...tiers].reverse().find(t => t < item.weight) || tiers[0];
              const upper = tiers.find(t => t > item.weight) || tiers[tiers.length - 1];
              const lp = (bp as any)[lower];
              const up = (bp as any)[upper];
              price = lp + (up - lp) * ((item.weight - lower) / (upper - lower));
            }
          }
        }
        subtotal += price;
      });
    });
    
    return subtotal > 0 ? subtotal + 0.90 : 6.50;
  };

  if (!meal) return null;
  const mealPrice = calculateMealPrice(meal.labDetails);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Navigation Arrows */}
      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + meals.length) % meals.length); }}
        className="absolute left-2 md:left-12 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
      >
        <ChevronLeft size={24} className="md:w-8 md:h-8" />
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % meals.length); }}
        className="absolute right-2 md:right-12 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
      >
        <ChevronRight size={24} className="md:w-8 md:h-8" />
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-5xl max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible bg-white dark:bg-card rounded-[32px] md:rounded-[40px] flex flex-col md:flex-row border border-white/10 shadow-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={meal.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col md:flex-row w-full h-full"
          >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>

        <div className="w-full md:w-1/2 h-[200px] md:h-auto relative overflow-hidden bg-gray-100 dark:bg-black shrink-0">
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
          <div className="absolute top-4 left-4 md:top-8 md:left-8">
            <span className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-black font-bold uppercase border border-black/10 px-4 py-1.5 md:px-6 md:py-2.5 rounded-full shadow-2xl bg-white/95">
              {meal.label}
            </span>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center">
          <div className="mb-6 md:mb-10 flex justify-between items-start">
            <div>
              <h2 className="text-2xl md:text-5xl font-heading font-medium tracking-tight text-black dark:text-white mb-2 leading-tight">{meal.title}</h2>
              <p className="text-sm md:text-xl text-accent-light dark:text-accent font-mono tracking-widest uppercase">{meal.subtitle}</p>
            </div>
            <div className="text-right">
              <span className="text-[8px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1">Price</span>
              <span className="text-xl md:text-3xl font-mono font-bold text-black dark:text-white">€{mealPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
            <p className="text-sm md:text-lg text-gray-600 dark:text-secondary leading-relaxed font-light">
              {meal.desc}
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {meal.goals.map(goal => (
                <span key={goal} className="px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-accent-light/20 dark:border-accent/20 bg-accent-light/5 dark:bg-accent/5 text-[8px] md:text-[10px] font-mono tracking-widest text-accent-light dark:text-accent uppercase">
                  {goal}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-10 border-t border-black/5 dark:border-border">
            <div className="space-y-1">
              <span className="block text-[8px] md:text-[10px] font-mono tracking-widest text-black dark:text-white font-bold uppercase">KCAL.</span>
              <span className="text-sm md:text-xl font-mono text-black dark:text-white">{meal.macros.energy}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[8px] md:text-[10px] font-mono tracking-widest text-accent font-bold uppercase">PROTEIN</span>
              <span className="text-sm md:text-xl font-mono text-black dark:text-white">{meal.macros.protein}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[8px] md:text-[10px] font-mono tracking-widest text-orange-500 font-bold uppercase">CARBS</span>
              <span className="text-sm md:text-xl font-mono text-black dark:text-white">{meal.macros.carbs}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-[8px] md:text-[10px] font-mono tracking-widest text-emerald-500 font-bold uppercase">FATS</span>
              <span className="text-sm md:text-xl font-mono text-black dark:text-white">{meal.macros.fats}</span>
            </div>
          </div>

          <button 
            onClick={() => {
              addToCart({
                id: meal.id,
                name: meal.title,
                price: mealPrice,
                quantity: 1,
                type: 'standard',
                details: meal.labDetails
              });
              onClose();
            }}
            className="mt-8 md:mt-12 w-full py-4 md:py-5 rounded-[20px] md:rounded-[24px] bg-accent-light dark:bg-accent text-white dark:text-black text-[11px] md:text-sm font-bold tracking-widest uppercase transition-all active:scale-[0.98]"
          >
            Add to Basket
          </button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
    </motion.div>
  );
};

const Menu = () => {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden bg-gray-50 dark:bg-surface border-b border-black/5 dark:border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant} className="max-w-3xl">
            <span className="text-[10px] font-mono tracking-[0.4em] text-accent-light dark:text-accent uppercase mb-4 block">BYTE / PROTOCOLS</span>
            <h1 className="text-4xl md:text-8xl font-heading font-light tracking-tight mb-6 md:mb-8 text-black dark:text-white">
              The <span className="text-accent-light dark:text-accent italic font-medium">Menu.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-secondary font-light leading-relaxed">
              Precision nutrition across six distinct protocols. <br />
              Select your goal. Engineer your life.
            </p>
          </motion.div>
        </div>
      </section>



      <section className="py-12 md:py-24">
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-16">
            {/* Mobile Filters Toggle */}
            <div className="lg:hidden">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-[20px] bg-gray-50 dark:bg-surface border border-black/5 dark:border-border font-mono text-[10px] tracking-widest uppercase transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Filter size={14} className={showFilters ? 'text-accent-light dark:text-accent' : 'text-gray-400'} />
                  <span className={showFilters ? 'text-black dark:text-white font-bold' : 'text-gray-500'}>Filters</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters Sidebar */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1 space-y-12`}>
              <div className="space-y-6 pt-4 lg:pt-0">
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

              <div className="space-y-6 pb-4 lg:pb-0">
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
