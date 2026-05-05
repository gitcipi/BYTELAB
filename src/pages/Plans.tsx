import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  const handleSubscribe = (pkg: any) => {
    const discountedPrice = pkg.basePrice * (1 - pkg.discount / 100);
    const formatPrice = (val: number) => `€${val.toFixed(2)}`;
    
    const message = `Hello BYTE,%0A%0AI would like to subscribe to the *OnlyPlans ${pkg.name}*.%0A%0A*Package Details:*%0A- Meals: ${pkg.meals} per week%0A- Protocol: ${pkg.stats}%0A- Frequency: ${pkg.features[2]}%0A%0A*Price:* ${formatPrice(discountedPrice)} / week%0A%0APlease let me know the next steps for my onboarding.`;
    
    window.open(`https://wa.me/4917684262753?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00aff0]/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00aff0]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUpVariant} className="flex justify-center items-center gap-3 mb-6">
             <div className="w-12 h-12 rounded-full bg-[#00aff0] flex items-center justify-center text-white shadow-lg shadow-[#00aff0]/20">
                <Star size={24} fill="currentColor" />
             </div>
             <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter text-black">
               Only<span className="text-[#00aff0]">Plans</span>
             </h1>
          </motion.div>
          <motion.p variants={fadeUpVariant} className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Get exclusive access to our most potent meal protocols. Subscribe to your favorite nutritional content and unlock peak performance.
          </motion.p>
          <motion.div variants={fadeUpVariant} className="mt-8 flex justify-center gap-4">
            <span className="px-5 py-2 rounded-full bg-[#00aff0]/10 text-[#00aff0] text-[10px] font-mono font-bold uppercase tracking-widest border border-[#00aff0]/20">Premium Meals</span>
            <span className="px-5 py-2 rounded-full bg-black/5 text-black/60 text-[10px] font-mono font-bold uppercase tracking-widest border border-black/5">Unlimited Macros</span>
          </motion.div>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {mealPackages.map((pkg) => {
            const discountedPrice = pkg.basePrice * (1 - pkg.discount / 100);
            return (
              <motion.div 
                key={pkg.id}
                variants={fadeUpVariant}
                className="relative group h-full"
              >
                <div className="h-full bg-white border border-black/5 rounded-[32px] p-8 transition-all duration-500 group-hover:border-black group-hover:shadow-2xl group-hover:shadow-black/5 flex flex-col">
                  {pkg.tag && (
                    <div className="mb-6">
                      <span className="text-[9px] font-mono tracking-widest text-black font-bold uppercase bg-gray-100 px-3 py-1 rounded-full border border-black/5">
                        {pkg.tag}
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-heading font-medium text-black mb-1">{pkg.name}</h3>
                    <p className="text-sm text-gray-400 font-mono tracking-wide mb-3">{pkg.meals} Meals Per Week</p>
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#00aff0]/5 rounded-xl border border-[#00aff0]/10 w-fit">
                      <Zap size={12} className="text-[#00aff0]" fill="currentColor" />
                      <span className="text-[10px] font-mono font-bold text-[#00aff0] tracking-tighter">{pkg.stats}</span>
                    </div>
                  </div>

                  <div className="mb-10">
                    <div className="flex flex-col mb-2">
                      <span className="text-4xl font-mono font-bold text-black tracking-tighter leading-none mb-2">{formatPrice(discountedPrice)}</span>
                      <span className="text-sm font-mono text-gray-300 line-through leading-none">{formatPrice(pkg.basePrice)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#00aff0] bg-[#00aff0]/5 px-2 py-0.5 rounded">SAVE {pkg.discount}%</span>
                      <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">Per Week</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-grow">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1 p-0.5 rounded-full bg-black/5">
                          <Check size={10} className="text-black" />
                        </div>
                        <span className="text-xs text-gray-500 font-light">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleSubscribe(pkg)}
                    className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-all hover:bg-[#00aff0] active:scale-95 group-hover:shadow-lg group-hover:shadow-[#00aff0]/10"
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
            { icon: <Clock size={24} />, title: "Save 5+ Hours", desc: "Skip the grocery store and the kitchen. We handle everything from prep to macro-tracking." },
            { icon: <Zap size={24} />, title: "Peak Performance", desc: "Consistency is the key to progress. Our weekly plans ensure you never miss a macro goal." },
            { icon: <Shield size={24} />, title: "Zero Waste", desc: "Exactly the fuel you need. No more forgotten ingredients in the back of the fridge." }
          ].map((benefit, idx) => (
            <motion.div key={idx} variants={fadeUpVariant} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-black mb-6">
                {benefit.icon}
              </div>
              <h4 className="text-lg font-heading font-medium text-black mb-3">{benefit.title}</h4>
              <p className="text-sm text-gray-500 font-light leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Plans;
