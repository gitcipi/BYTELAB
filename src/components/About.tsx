import { motion } from 'framer-motion';

export const About = () => {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Portrait Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/5] lg:aspect-[3/4] rounded-[40px] overflow-hidden bg-gray-100 shadow-2xl shadow-black/5"
          >
            <img 
              src="/founder.png" 
              alt="Cipi - Founder of BYTE"
              className="w-full h-full object-cover blur-md scale-105"
            />
            <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
          </motion.div>

          {/* Copy Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center max-w-xl"
          >
            <span className="text-[10px] font-mono tracking-[0.4em] text-accent font-bold uppercase mb-6 block">
              The Story
            </span>
            
            <h2 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-black mb-2">
              Built from passion.
            </h2>
            <p className="text-xl md:text-2xl text-accent font-mono tracking-widest uppercase mb-12">
              Cooking with purpose.
            </p>

            <div className="space-y-6 text-base md:text-lg text-gray-600 font-light leading-relaxed mb-12">
              <p>
                My name is Cipi (short from Ciprian), and I have been cooking since I was 12 years old.
              </p>
              <p>
                Over the years, cooking became more than a skill. It became how I care and show love for people. 
                I love creating meals that taste exceptional while still staying clean, balanced, and performance focused.
              </p>
              <p>
                After formal culinary training in Germany in 2018, I learned how to build flavor through technique, 
                right use of ingredients, and not through unnecessary fats or unhealthy shortcuts.
              </p>
              <p>
                The idea for BYTE came naturally. Friends from the gym and from my active lifestyle were constantly 
                asking about the meals I kept bringing with me, often bringing an extra lunch box for them to try.
              </p>
              <p>
                What started as sharing food with people around me became something worth building. 
                BYTE was created from genuine demand, passion, and a love for feeding people well.
              </p>
              <p>
                I am 26 years old, based in Ubud, and grateful every day to live a healthy, active, and happy 
                life while doing something I truly enjoy.
              </p>
            </div>

            <div className="pt-12 border-t border-black/5 flex flex-col gap-8">
              <p className="text-lg font-heading font-medium text-black italic">
                Cooked personally. Delivered thoughtfully.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-black/5 shadow-sm">
                  <img src="/founder.png" alt="Cipi" className="w-full h-full object-cover blur-sm scale-110" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold tracking-widest uppercase text-black">Cipi</p>
                  <p className="text-[10px] font-mono tracking-[0.2em] text-gray-400 uppercase">Founder of BYTE</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
