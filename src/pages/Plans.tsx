import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Zap, Shield, Star, Clock } from 'lucide-react';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const Plans = () => {
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'EUR');

  useEffect(() => {
    const handleCurrencyChange = () => setCurrency(localStorage.getItem('currency') || 'EUR');
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  const formatPrice = (eur: number) => {
    if (currency === 'USD') return `$${(eur * 1.05).toFixed(0)}`;
    if (currency === 'IDR') return `Rp ${(Math.round(eur * 20000)).toLocaleString()}`;
    return `€${eur.toFixed(0)}`;
  };

  const mealPackages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      meals: 8,
      discount: 10,
      basePrice: 60,
      tag: 'ESSENTIAL LOAD',
      stats: '2 Meals / Day: ~1,300 Kcal / 100g P',
      features: ['8 Precision Engineered Meals', 'Ideal for 4 Full Days', '2 Fresh Deliveries / Week', 'Microwaveable Tupperware'],
      color: 'accent'
    },
    {
      id: 'growth',
      name: 'Growth Pack',
      meals: 14,
      discount: 15,
      basePrice: 105,
      tag: 'PERFORMANCE SYNC',
      stats: '2 Meals / Day: ~1,300 Kcal / 100g P',
      features: ['14 Precision Engineered Meals', 'Complete 7-Day Protocol', '4 Fresh Deliveries / Week', 'Microwaveable Tupperware'],
      color: 'blue-500'
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      meals: 20,
      discount: 25,
      basePrice: 217.3333333,
      tag: 'ULTIMATE STACK',
      stats: '3 Meals / Day: ~1,950 Kcal / 160g P',
      features: ['20 Precision Engineered Meals', 'Elite Performance Load', 'Daily Fresh Deliveries', 'Microwaveable Tupperware'],
      color: 'emerald-500'
    }
  ];

  const handleSubscribe = () => {
    if (!selectedPkg) return;
    const pkg = selectedPkg;
    const discountedPrice = pkg.basePrice * (1 - pkg.discount / 100);
    const formatPrice = (val: number) => `€${val.toFixed(2)}`;
    
    const message = `Hello BYTE,%0A%0AI would like to subscribe to the *OnlyPlans ${pkg.name}*.%0A%0A*Package Details:*%0A- Meals: ${pkg.meals} per week%0A- Protocol: ${pkg.stats}%0A- Frequency: ${pkg.features[2]}%0A%0A*Price:* ${formatPrice(discountedPrice)} / week%0A%0APlease let me know the next steps for my onboarding.`;
    
    window.open(`https://wa.me/4917684262753?text=${message}`, '_blank');
    setSelectedPkg(null);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-white relative overflow-hidden text-black">
      <AnimatePresence>
        {selectedPkg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-black/5"
            >
              <div className="w-16 h-16 rounded-full bg-[#00aff0]/10 flex items-center justify-center text-[#00aff0] mb-8">
                <Star size={32} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-heading font-black tracking-tighter text-black mb-4">Finalize Your Protocol</h2>
              <p className="text-gray-500 font-light leading-relaxed mb-10">
                You're about to be redirected to our engineering team on WhatsApp to finalize your <span className="font-bold text-black">{selectedPkg.name}</span> subscription and setup your delivery schedule.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedPkg(null)}
                  className="flex-1 py-4 rounded-2xl border border-black/5 text-[10px] font-mono font-bold uppercase tracking-widest text-black/20 hover:bg-black/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubscribe}
                  className="flex-1 py-4 rounded-2xl bg-black text-white text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#00aff0] transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00aff0]/5 rounded-full blur-[180px] -z-10 pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#00aff0]/3 rounded-full blur-[180px] -z-10 pointer-events-none opacity-30" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="text-center mb-24"
        >
          <motion.div variants={fadeUpVariant} className="flex justify-center items-center gap-4 mb-8">
             <div className="w-14 h-14 rounded-2xl bg-[#00aff0] flex items-center justify-center text-white shadow-lg shadow-[#00aff0]/20">
                <Star size={28} fill="currentColor" />
             </div>
             <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter text-black">
               Only<span className="text-[#00aff0]">Plans</span>
             </h1>
          </motion.div>
          <motion.p variants={fadeUpVariant} className="text-gray-500 max-w-2xl mx-auto text-xl font-light leading-relaxed">
            Exclusive access to our most potent meal protocols. Subscribe to your favorite nutritional content and unlock peak performance.
          </motion.p>
          <motion.div variants={fadeUpVariant} className="mt-10 flex justify-center gap-4">
            <span className="px-6 py-2.5 rounded-full bg-[#00aff0]/10 text-[#00aff0] text-[10px] font-mono font-bold uppercase tracking-[0.2em] border border-[#00aff0]/20">Premium Meals</span>
            <span className="px-6 py-2.5 rounded-full bg-black/5 text-black/40 text-[10px] font-mono font-bold uppercase tracking-[0.2em] border border-black/5">Unlimited Macros</span>
          </motion.div>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {mealPackages.map((pkg) => {
            const discountedPrice = pkg.basePrice * (1 - pkg.discount / 100);
            return (
              <motion.div 
                key={pkg.id}
                variants={fadeUpVariant}
                className="relative group h-full"
              >
                <div className="h-full bg-white border border-black/5 rounded-[40px] p-10 transition-all duration-500 group-hover:border-black group-hover:shadow-2xl group-hover:shadow-black/5 flex flex-col">
                  {pkg.tag && (
                    <div className="mb-6">
                      <span className="text-[9px] font-mono tracking-widest text-black/60 font-bold uppercase bg-black/5 px-4 py-1.5 rounded-full border border-black/10">
                        {pkg.tag}
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-3xl font-heading font-black tracking-tighter text-black mb-1">{pkg.name}</h3>
                    <p className="text-sm text-gray-500 font-mono tracking-wide mb-4">{pkg.meals} Meals Per Week</p>
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#00aff0]/5 rounded-xl border border-[#00aff0]/10 w-fit">
                      <Zap size={12} className="text-[#00aff0]" fill="currentColor" />
                      <span className="text-[10px] font-mono font-bold text-[#00aff0] tracking-tighter">{pkg.stats}</span>
                    </div>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-mono font-black text-black tracking-tighter leading-none mb-2">€{discountedPrice.toFixed(2)}</span>
                      <span className="text-sm font-mono text-black/20 line-through leading-none">€{pkg.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#00aff0] bg-[#00aff0]/5 px-2 py-0.5 rounded border border-[#00aff0]/20">SAVE {pkg.discount}%</span>
                      <span className="text-[9px] font-mono text-black/40 uppercase tracking-tighter font-bold">Per Week</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-grow">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1 p-1 rounded-full bg-black/5 border border-black/5">
                          <Check size={10} className="text-black" />
                        </div>
                        <span className="text-xs text-black/60 font-light">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setSelectedPkg(pkg)}
                    className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-all hover:bg-[#00aff0] hover:text-black active:scale-95 group-hover:shadow-lg"
                  >
                    Subscribe Now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Benefits Section */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {[
            { icon: <Clock size={28} />, title: "Save 5+ Hours", desc: "Skip the grocery store and the kitchen. We handle everything from prep to macro-tracking." },
            { icon: <Zap size={28} />, title: "Peak Performance", desc: "Consistency is the key to progress. Our weekly plans ensure you never miss a macro goal." },
            { icon: <Shield size={28} />, title: "Zero Waste", desc: "Exactly the fuel you need. No more forgotten ingredients in the back of the fridge." }
          ].map((benefit, idx) => (
            <motion.div key={idx} variants={fadeUpVariant} className="flex flex-col items-center text-center p-8 rounded-[32px] bg-black/[0.02] border border-black/5">
              <div className="w-20 h-20 rounded-3xl bg-[#00aff0]/10 flex items-center justify-center text-[#00aff0] mb-8">
                {benefit.icon}
              </div>
              <h4 className="text-2xl font-heading font-black tracking-tight text-black mb-4">{benefit.title}</h4>
              <p className="text-base text-gray-500 font-light leading-relaxed max-w-[280px]">{benefit.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Plans;
