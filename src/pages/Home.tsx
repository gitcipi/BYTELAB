import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Leaf, Activity, Truck, Zap, CircleSlash, Timer, MapPin, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ALL_MEALS } from '../data/meals';
import { About } from '../components/About';

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
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
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
            <span className="text-[9px] font-mono tracking-wider text-gray-400 mb-1 uppercase">ENERGY</span>
            <span className="text-xs font-mono text-black">{macros.energy}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-wider text-accent font-bold mb-1 uppercase">PROTEIN</span>
            <span className="text-xs font-mono text-black">{macros.protein}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-wider text-gray-400 mb-1 uppercase">CARBS</span>
            <span className="text-xs font-mono text-black">{macros.carbs}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-wider text-gray-400 mb-1 uppercase">FATS</span>
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
            className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-12"
          >
            {ALL_MEALS.map((dish) => (
              <motion.div key={dish.id} className="min-w-[85vw] md:min-w-[450px] snap-center">
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
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'EUR');

  useEffect(() => {
    const handleCurrencyChange = () => setCurrency(localStorage.getItem('currency') || 'EUR');
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  return (
    <div className="relative">
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl mx-auto pt-20">
            <motion.div variants={fadeUpVariant} className="flex flex-col mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-[72px] font-heading font-semibold text-black tracking-tight leading-[1.1]">
                Eat clean.
              </h1>
              <h1 className="text-4xl md:text-6xl lg:text-[72px] font-heading font-semibold text-black tracking-tight leading-[1.1]">
                Think sharp.
              </h1>
              <h1 className="text-4xl md:text-6xl lg:text-[72px] font-heading font-semibold text-black tracking-tight leading-[1.1]">
                Stay fit.
              </h1>
            </motion.div>

            <motion.p 
              variants={fadeUpVariant}
              className="text-lg md:text-xl text-black/50 font-sans font-normal tracking-wide mb-8 max-w-xl mx-auto leading-relaxed"
            >
              Engineered Nutrition based in Ubud. <br />
              Sourced from Ubud.
            </motion.p>

            <motion.div 
              variants={fadeUpVariant}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {['High Protein', 'Macro Tracked', 'Delivered Fresh'].map((text) => (
                <div 
                  key={text}
                  className="px-4 py-1.5 rounded-full border border-black/10 bg-black/5 text-[9px] font-mono font-bold tracking-[0.2em] text-black/40 uppercase"
                >
                  {text}
                </div>
              ))}
            </motion.div>

            <motion.div 
              variants={fadeUpVariant}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to="/lab" className="w-full sm:w-auto px-12 py-5 bg-black text-white rounded-full text-[12px] tracking-[0.2em] uppercase font-bold hover:bg-black/90 transition-all text-center">
                Build Yours
              </Link>
              <Link to="/menu" className="w-full sm:w-auto px-12 py-5 bg-transparent border border-black/20 text-black rounded-full text-[12px] tracking-[0.2em] uppercase font-bold hover:bg-black hover:text-white transition-all text-center">
                Explore Menu
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="h-24 md:h-32 bg-white border-y border-black/5 relative overflow-hidden flex items-center">
        <div className="absolute inset-0 marquee-mask-white z-10 pointer-events-none"></div>
        <div className="flex animate-marquee whitespace-nowrap items-center hover:pause">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center">
              {[
                { icon: <Leaf size={18} />, text: "CLEAN INGREDIENTS" },
                { icon: <Activity size={18} />, text: "MACRO TRACKED" },
                { icon: <Truck size={18} />, text: "DELIVERED FRESH" },
                { icon: <Zap size={18} />, text: "HIGH PROTEIN" },
                { icon: <CircleSlash size={18} />, text: "NO PROCESSED SUGAR" },
                { icon: <Timer size={18} />, text: "DAILY PREP" },
                { icon: <MapPin size={18} />, text: "LOCAL DELIVERY" },
                { icon: <Gauge size={18} />, text: "PERFORMANCE FOCUSED" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center mx-12 group transition-all">
                  <span className="text-accent-light mr-4 group-hover:scale-125 transition-transform">{item.icon}</span>
                  <span className="text-[12px] font-mono tracking-[0.2em] text-black/40 group-hover:text-black transition-colors">{item.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <MenuGrid />

      <section id="plans" className="section-padding bg-white relative border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-light tracking-tight mb-4 text-black">Weekly Protocols</h2>
            <p className="text-gray-600 tracking-wide">Automated nutrition delivery.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "The Core Reset", desc: "Balanced macro profile for sustained energy. Perfect for daily performance.", meals: "10 meals / week", price: currency === 'USD' ? "$152" : "€145" },
              { name: "Lean Protocol", desc: "High protein, low carb formulation. Optimized for cutting and muscle retention.", meals: "14 meals / week", price: currency === 'USD' ? "$205" : "€195" },
              { name: "Zero State", desc: "Strict ketogenic profile. Ultimate mental clarity and fat adaptation.", meals: "21 meals / week", price: currency === 'USD' ? "$299" : "€285" }
            ].map((plan, idx) => (
              <motion.div key={idx} variants={fadeUpVariant} className="bg-gray-50 border border-black/5 p-8 flex flex-col group rounded-[32px] transition-all">
                <h3 className="text-2xl font-heading font-medium tracking-wide text-black mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-8 flex-grow">{plan.desc}</p>
                <div className="border-t border-black/5 pt-6 mb-8 flex justify-between items-end">
                  <div>
                    <span className="block text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-1">Deliveries</span>
                    <span className="text-sm font-mono text-black">{plan.meals}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-1">Starting At</span>
                    <span className="text-2xl font-mono text-black">{plan.price}</span>
                  </div>
                </div>
                <button className="w-full py-4 rounded-[18px] bg-accent-light text-white text-sm font-medium tracking-wide transition-all duration-300 hover:scale-105 active:scale-95">
                  Select Protocol
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <About />

      <section className="section-padding bg-white relative border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-light tracking-tight mb-4 text-black">High performance feedback.</h2>
          <p className="text-gray-600 tracking-wide mb-16">Don't just take our word for it.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Marcus T.", role: "Triathlete", text: "BYTE changed how I train. The macro precision is unmatched, and the ingredients taste like they came from a Michelin kitchen." },
              { name: "Sarah L.", role: "Executive", text: "As a founder, I don't have time to cook, but I refuse to compromise on nutrition. BYTE delivers consistency every single week." },
              { name: "David K.", role: "Fitness Coach", text: "I recommend BYTE to all my high-end clients. It's the only meal prep service that actually hits the macros they claim." }
            ].map((review, idx) => (
              <div key={idx} className="bg-gray-50 border border-black/5 p-8 rounded-[32px] text-left transition-all">
                <div className="flex text-accent-light mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 font-light leading-relaxed mb-8 text-sm italic">"{review.text}"</p>
                <div>
                  <p className="font-mono text-sm text-black tracking-wide">{review.name}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
