import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Check, Pointer } from 'lucide-react';

export const LabPreview = () => {
  const [chickenGrams, setChickenGrams] = useState(100);
  const [riceGrams, setRiceGrams] = useState(100);
  const [broccoliGrams, setBroccoliGrams] = useState(50);
  
  const [added, setAdded] = useState(false);
  const [cursorState, setCursorState] = useState<'idle' | 'chicken' | 'rice' | 'broccoli' | 'clicking'>('idle');
  
  // Animation sequence
  useEffect(() => {
    let isSubscribed = true;
    
    const runSequence = async () => {
      while (isSubscribed) {
        setAdded(false);
        setChickenGrams(100);
        setRiceGrams(100);
        setBroccoliGrams(50);
        setCursorState('idle');
        
        await new Promise(r => setTimeout(r, 1000));
        
        // --- CHICKEN ---
        setCursorState('chicken');
        if (!isSubscribed) break;
        
        let controls = animate(100, 200, {
          duration: 1,
          ease: "easeInOut",
          onUpdate: (val) => { if (isSubscribed) setChickenGrams(Math.round(val)); }
        });
        await controls;
        await new Promise(r => setTimeout(r, 300));
        
        // --- RICE ---
        setCursorState('rice');
        if (!isSubscribed) break;
        
        controls = animate(100, 150, {
          duration: 1,
          ease: "easeInOut",
          onUpdate: (val) => { if (isSubscribed) setRiceGrams(Math.round(val)); }
        });
        await controls;
        await new Promise(r => setTimeout(r, 300));
        
        // --- BROCCOLI ---
        setCursorState('broccoli');
        if (!isSubscribed) break;
        
        controls = animate(50, 100, {
          duration: 1,
          ease: "easeInOut",
          onUpdate: (val) => { if (isSubscribed) setBroccoliGrams(Math.round(val)); }
        });
        await controls;
        await new Promise(r => setTimeout(r, 500));
        
        // --- CLICK ---
        setCursorState('clicking');
        await new Promise(r => setTimeout(r, 300));
        
        if (isSubscribed) setAdded(true);
        
        await new Promise(r => setTimeout(r, 2000));
      }
    };
    
    runSequence();
    
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Chicken: p:25, f:3, c:0, cal:130
  // Rice: p:3, f:0, c:28, cal:130
  // Broccoli: p:3, f:0, c:7, cal:34

  const totalP = Math.round((25 * chickenGrams / 100) + (3 * riceGrams / 100) + (3 * broccoliGrams / 100));
  const totalF = Math.round((3 * chickenGrams / 100) + (0 * riceGrams / 100) + (0 * broccoliGrams / 100));
  const totalC = Math.round((0 * chickenGrams / 100) + (28 * riceGrams / 100) + (7 * broccoliGrams / 100));
  const totalCal = Math.round((130 * chickenGrams / 100) + (130 * riceGrams / 100) + (34 * broccoliGrams / 100));

  const chickenPercent = ((chickenGrams - 100) / (300 - 100)) * 100;
  const ricePercent = ((riceGrams - 50) / (250 - 50)) * 100;
  const broccoliPercent = ((broccoliGrams - 50) / (200 - 50)) * 100;

  return (
    <section className="section-padding bg-gray-50 border-y border-black/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 space-y-8">
            <div>
              <span className="text-[10px] font-mono tracking-[0.4em] text-accent uppercase mb-4 block">BYTE / LAB</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light tracking-tight text-black leading-tight">
                Total control.<br/>
                <span className="font-medium italic">Down to the gram.</span>
              </h2>
            </div>
            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-md">
              Don't settle for fixed portions. Our proprietary meal builder lets you customize your protein, carbs, and veggies with absolute precision.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/lab" className="px-8 py-4 bg-black text-white rounded-full text-xs font-mono tracking-widest uppercase hover:bg-black/80 transition-all">
                Enter The Lab
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[32px] p-8 border border-black/10 shadow-2xl shadow-black/5 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6 border-b border-black/5 pb-4">
                <div>
                  <h4 className="text-xl font-heading font-medium text-black mb-1">BYTE LAB / CUSTOM</h4>
                  <p className="text-[10px] text-black font-mono font-bold uppercase tracking-widest opacity-40">Performance Build</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 mb-6">
                
                {/* Chicken Slider */}
                <div className="bg-black/[0.02] p-4 rounded-2xl border border-black/5 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase">Grilled Chicken</span>
                    <span className="text-[11px] font-mono font-bold text-accent">{chickenGrams}g</span>
                  </div>
                  <div className="relative">
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden relative">
                      <motion.div className="absolute top-0 left-0 h-full bg-accent" style={{ width: `${chickenPercent}%` }} />
                    </div>
                    <motion.div
                      animate={{ opacity: cursorState === 'chicken' ? 1 : 0, scale: cursorState === 'chicken' ? 0.9 : 1 }}
                      className="absolute top-1/2 -translate-y-1/2 -ml-3 z-50 pointer-events-none text-black/60 drop-shadow-md"
                      style={{ left: `${chickenPercent}%` }}
                    >
                      <Pointer size={24} className="fill-white" />
                    </motion.div>
                  </div>
                </div>

                {/* Rice Slider */}
                <div className="bg-black/[0.02] p-4 rounded-2xl border border-black/5 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase">White Rice</span>
                    <span className="text-[11px] font-mono font-bold text-black">{riceGrams}g</span>
                  </div>
                  <div className="relative">
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden relative">
                      <motion.div className="absolute top-0 left-0 h-full bg-black/80" style={{ width: `${ricePercent}%` }} />
                    </div>
                    <motion.div
                      animate={{ opacity: cursorState === 'rice' ? 1 : 0, scale: cursorState === 'rice' ? 0.9 : 1 }}
                      className="absolute top-1/2 -translate-y-1/2 -ml-3 z-50 pointer-events-none text-black/60 drop-shadow-md"
                      style={{ left: `${ricePercent}%` }}
                    >
                      <Pointer size={24} className="fill-white" />
                    </motion.div>
                  </div>
                </div>

                {/* Broccoli Slider */}
                <div className="bg-black/[0.02] p-4 rounded-2xl border border-black/5 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase">Broccoli</span>
                    <span className="text-[11px] font-mono font-bold text-green-600">{broccoliGrams}g</span>
                  </div>
                  <div className="relative">
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden relative">
                      <motion.div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${broccoliPercent}%` }} />
                    </div>
                    <motion.div
                      animate={{ opacity: cursorState === 'broccoli' ? 1 : 0, scale: cursorState === 'broccoli' ? 0.9 : 1 }}
                      className="absolute top-1/2 -translate-y-1/2 -ml-3 z-50 pointer-events-none text-black/60 drop-shadow-md"
                      style={{ left: `${broccoliPercent}%` }}
                    >
                      <Pointer size={24} className="fill-white" />
                    </motion.div>
                  </div>
                </div>

              </div>

              {/* Macros Panel */}
              <div className="grid grid-cols-4 gap-2 mb-8 bg-gray-50 p-4 rounded-2xl border border-black/5">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-wider text-black/40 mb-1 uppercase">Energy</span>
                  <span className="text-sm font-mono text-black font-bold">{totalCal}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-wider text-accent mb-1 uppercase font-bold">Protein</span>
                  <span className="text-sm font-mono text-accent font-bold">{totalP}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-wider text-black/40 mb-1 uppercase">Carbs</span>
                  <span className="text-sm font-mono text-black font-bold">{totalC}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-wider text-black/40 mb-1 uppercase">Fats</span>
                  <span className="text-sm font-mono text-black font-bold">{totalF}g</span>
                </div>
              </div>

              {/* Add Button */}
              <div className="relative">
                <motion.div
                  animate={{
                    opacity: cursorState === 'clicking' ? 1 : 0,
                    scale: cursorState === 'clicking' ? 0.9 : 1,
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none text-black/60 drop-shadow-md"
                >
                  <Pointer size={24} className="fill-white" />
                </motion.div>
                
                <motion.button
                  animate={{
                    backgroundColor: added ? '#000' : '#f9fafb',
                    color: added ? '#fff' : '#000',
                    borderColor: added ? '#000' : '#e5e7eb'
                  }}
                  className="w-full py-4 rounded-full border flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest font-bold transition-colors duration-300"
                >
                  {added ? (
                    <>
                      <Check size={14} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Add to Cart
                    </>
                  )}
                </motion.button>
              </div>

            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -inset-4 border border-black/5 rounded-[40px] -z-10 bg-white/50" />
            <div className="absolute -inset-8 border border-black/5 rounded-[48px] -z-20 bg-white/20" />
          </div>

        </div>
      </div>
    </section>
  );
};
