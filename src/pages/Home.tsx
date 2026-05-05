import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ALL_MEALS } from '../data/meals';
import { About } from '../components/About';
import { LabPreview } from '../components/LabPreview';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const MealCard = ({ label, title, subtitle, desc, macros, img }: any) => {
  return (
    <motion.div
      variants={fadeUpVariant}
      className="rounded-[32px] overflow-hidden bg-white border border-black transition-all duration-500 group h-full flex flex-col"
    >
      <div className="relative h-[300px] overflow-hidden bg-gray-100">
        {img ? (
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 opacity-20">
              <div className="w-16 h-16 rounded-full border border-black flex items-center justify-center">
                <span className="text-xl font-mono font-bold tracking-tighter">B /</span>
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase">No Visual</span>
            </div>
          </div>
        )}
        <div className="absolute top-6 left-6 z-10">
          <span className="text-[10px] font-mono tracking-widest text-black font-bold uppercase border border-black/10 px-4 py-1.5 rounded-full shadow-lg bg-white/95">
            {label}
          </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-6">
          <h3 className="text-2xl font-heading font-medium tracking-wide text-black mb-1">{title}</h3>
          <p className="text-sm font-medium text-gray-500">{subtitle}</p>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow line-clamp-2">
          {desc}
        </p>

        <div className="grid grid-cols-4 gap-4 pt-8 border-t border-black/5">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-wider text-black/40 mb-1 uppercase font-bold">Kcal.</span>
            <span className="text-xs font-mono text-black">{macros.energy}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-wider text-accent font-bold mb-1 uppercase">PROTEIN</span>
            <span className="text-xs font-mono text-black">{macros.protein}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-wider text-orange-500 font-bold mb-1 uppercase">CARBS</span>
            <span className="text-xs font-mono text-black">{macros.carbs}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-wider text-emerald-500 font-bold mb-1 uppercase">FATS</span>
            <span className="text-xs font-mono text-black">{macros.fats}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MenuGrid = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowLeftArrow(scrollRef.current.scrollLeft > 50);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.8 : 500;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="menu" className="section-padding bg-white relative overflow-hidden group border-y border-black/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-[10px] font-mono tracking-[0.4em] text-accent uppercase mb-4 block">Engineered Selection</span>
            <h2 className="text-4xl md:text-5xl font-heading font-light tracking-tight text-black">Precision Meals</h2>
          </div>
          <Link to="/menu" className="text-[10px] font-mono tracking-widest text-accent hover:text-black transition-colors uppercase border-b border-accent/20 pb-1">View Catalog</Link>
        </motion.div>

        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-8 overflow-x-auto scrollbar-hide pb-12"
          >
            {ALL_MEALS.map((dish) => (
              <motion.div key={dish.id} className="min-w-[85vw] md:min-w-[450px]">
                <MealCard {...dish} />
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/5 backdrop-blur-xl border border-black/10 flex items-center justify-center text-black transition-all hover:bg-black/10 hover:scale-110 active:scale-95 shadow-none"
              >
                <ArrowRight className="rotate-180" size={20} />
              </button>
            )}
          </AnimatePresence>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/5 backdrop-blur-xl border border-black/10 flex items-center justify-center text-black transition-all hover:bg-black/10 hover:scale-110 active:scale-95 shadow-none"
          >
            <ArrowRight size={20} />
          </button>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          className="mt-16 flex justify-center"
        >
          <Link
            to="/menu"
            className="px-12 py-5 bg-white text-black border border-black rounded-full text-[12px] tracking-[0.2em] uppercase font-bold hover:bg-black hover:text-white transition-all text-center"
          >
            View Meals
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      {/* Premium Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-28 md:pt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">

            {/* Left Column: Brand & Messaging */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="z-10"
            >
              <motion.div variants={fadeUpVariant} className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center">
                  <span className="text-sm font-mono font-black tracking-tighter">B /</span>
                </div>
                <span className="text-[10px] font-mono tracking-[0.4em] text-black/40 uppercase font-bold">Byte Lab Nutrition</span>
              </motion.div>

              <motion.h1
                variants={fadeUpVariant}
                className="text-5xl md:text-7xl lg:text-8xl font-heading font-light tracking-tight text-black mb-6 md:mb-8 leading-[0.95]"
              >
                Food, <br />
                <span className="italic font-medium text-accent-light">engineered.</span>
              </motion.h1>

              <motion.p
                variants={fadeUpVariant}
                className="text-xl md:text-2xl text-black/60 font-sans font-light tracking-wide mb-12 max-w-lg leading-relaxed"
              >
                Crafted fresh in Ubud. Macro tracked meals and weekly prep plans delivered across Bali.
              </motion.p>

              <motion.div
                variants={fadeUpVariant}
                className="flex flex-wrap gap-3 md:gap-4 mb-12 md:mb-16"
              >
                <Link to="/menu" className="px-6 py-3.5 md:px-8 md:py-4 bg-black text-white rounded-full text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-accent-light transition-all shadow-xl shadow-black/10">
                  Explore Menu
                </Link>
                <Link to="/lab" className="px-6 py-3.5 md:px-8 md:py-4 bg-white text-black border border-black/10 rounded-full text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold hover:border-black transition-all">
                  Build Meal
                </Link>
                <Link to="/generate-meal" className="px-6 py-3.5 md:px-8 md:py-4 bg-white text-black border border-black/10 rounded-full text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold hover:border-black transition-all">
                  Generate Meals
                </Link>
              </motion.div>

              {/* Trust Metrics */}
              <motion.div
                variants={fadeUpVariant}
                className="grid grid-cols-2 md:flex items-center gap-x-10 gap-y-6 pt-12 border-t border-black/5"
              >
                {[
                  { icon: '📍', val: 'Ubud', label: 'Kitchen' },
                  { icon: '🛵', val: 'Bali', label: 'Delivery' },
                  { icon: '📦', val: 'Weekly', label: 'Meal Prep' },
                  { icon: '🥩', val: '48g', label: 'Avg Protein' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="flex items-center gap-3 cursor-default group"
                  >
                    <span className="text-xl">{stat.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono font-bold text-black uppercase tracking-widest group-hover:text-accent-light transition-colors">{stat.val}</span>
                      <span className="text-[9px] font-mono text-black/40 uppercase tracking-widest font-medium group-hover:text-black/60 transition-colors">{stat.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Delivery Note */}
              <motion.p
                variants={fadeUpVariant}
                className="mt-8 text-[9px] font-mono text-black/30 uppercase tracking-[0.2em]"
              >
                Delivery available via Grab, Gojek or pickup.
              </motion.p>
            </motion.div>

            {/* Right Column: Premium Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              <div className="relative aspect-[4/5] md:aspect-square rounded-[48px] overflow-hidden bg-gray-50 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                <img
                  src="/premium_byte_meal_hero.png"
                  alt="Premium Engineered Meal"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
              </div>

              {/* Nutrition Card Overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{
                  delay: 0.8,
                  duration: 0.8
                }}
                className="absolute -bottom-6 -left-6 md:-left-12 bg-white/90 backdrop-blur-2xl p-8 rounded-[32px] border border-black/5 shadow-2xl z-20 min-w-[280px] cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-black/40 uppercase block mb-1">Synthesized Profile</span>
                    <h4 className="text-2xl font-heading font-medium text-black tracking-tight leading-none">Optimal Bowl.</h4>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-black/5 flex items-center justify-center">
                    <Activity size={14} className="text-accent-light" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex flex-col group/stat">
                    <span className="text-[9px] font-mono font-bold text-black/30 uppercase tracking-widest mb-1 transition-colors group-hover/stat:text-black/50">Energy</span>
                    <span className="text-lg font-mono font-bold text-black">620 <span className="text-[10px] text-black/20">KCAL</span></span>
                  </div>
                  <div className="flex flex-col group/stat">
                    <span className="text-[9px] font-mono font-bold text-accent-light uppercase tracking-widest mb-1">Protein</span>
                    <span className="text-lg font-mono font-bold text-black">48 <span className="text-[10px] text-black/20">G</span></span>
                  </div>
                  <div className="flex flex-col group/stat">
                    <span className="text-[9px] font-mono font-bold text-orange-500 uppercase tracking-widest mb-1">Carbs</span>
                    <span className="text-lg font-mono font-bold text-black">61 <span className="text-[10px] text-black/20">G</span></span>
                  </div>
                  <div className="flex flex-col group/stat">
                    <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest mb-1">Fats</span>
                    <span className="text-lg font-mono font-bold text-black">14 <span className="text-[10px] text-black/20">G</span></span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Protocol Strip */}
      <section className="py-12 md:py-20 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 mb-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['CORE', 'LEAN', 'ZERO', 'MASS', 'BOOST', 'READY'].map((p) => (
              <span key={p} className="text-lg md:text-xl font-heading font-light tracking-[0.3em] text-black cursor-default hover:text-accent-light transition-colors">{p}</span>
            ))}
          </div>
          <p className="text-[10px] font-mono tracking-[0.5em] text-black/30 uppercase font-bold">6 protocols. One system.</p>
        </div>
      </section>

      <MenuGrid />

      <section className="py-32 bg-gray-50 relative overflow-hidden border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} className="max-w-3xl mx-auto">
            <span className="text-[10px] font-mono tracking-[0.4em] text-[#00aff0] uppercase mb-4 block font-bold">Protocol Subscription</span>
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight mb-6 text-black">Only<span className="text-[#00aff0]">Plans</span></h2>
            <p className="text-lg text-gray-500 font-light mb-12 leading-relaxed">
              Unlock exclusive weekly meal protocols. Engineered for consistency, delivered for performance. Save up to 25% with our subscription packages.
            </p>
            <Link
              to="/plans"
              className="inline-flex items-center gap-3 bg-black text-white px-12 py-5 rounded-full text-[12px] tracking-[0.2em] uppercase font-bold hover:bg-[#00aff0] transition-all group"
            >
              Explore Exclusive Plans
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <LabPreview />

      <About />


      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] z-0 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-heading font-light tracking-tight mb-6 text-black">Upgrade your fuel.</h2>
          <p className="text-lg text-gray-600 font-light mb-12 max-w-xl mx-auto">Experience the difference of precision nutrition. Start your first week of BYTE.</p>
          <Link
            to="/lab"
            className="inline-block bg-accent-light text-white rounded-[24px] px-12 py-5 text-sm tracking-widest uppercase transition-transform hover:scale-105 active:scale-95 shadow-2xl shadow-accent/20"
          >
            Start Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
