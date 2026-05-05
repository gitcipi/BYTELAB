import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2, Beaker } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDropdown = ({ currency }: { currency: string }) => {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, total } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    if (currency === 'USD') return `$${(value * 1.17).toFixed(2)}`;
    if (currency === 'IDR') return `Rp ${(Math.round(value * 20000)).toLocaleString()}`;
    return `€${value.toFixed(2)}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Find if the click was on the toggle button
        const isToggleButton = (event.target as HTMLElement).closest('.cart-toggle');
        if (!isToggleButton) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  const generateWhatsAppMessage = () => {
    const standardItems = items.filter(i => i.type === 'standard');
    const labItems = items.filter(i => i.type === 'lab');

    let message = "Hello BYTE,\n\nI would like to place an order:\n\n";

    if (standardItems.length > 0) {
      message += "Items:\n";
      standardItems.forEach(i => {
        message += `- ${i.name} x${i.quantity} (${formatCurrency(i.price * i.quantity)})\n`;
      });
      message += "\n";
    }

    if (labItems.length > 0) {
      message += "Custom Builds:\n";
      labItems.forEach(i => {
        message += `- ${i.name}:\n`;
        const renderCat = (label: string, catItems: any[]) => {
          if (catItems && catItems.length > 0) {
            const itemsStr = catItems.map(item => `${item.name} (${item.weight}${item.unit || 'g'})`).join(' & ');
            message += `  ${label}: ${itemsStr}\n`;
          }
        };
        renderCat('Protein', i.details?.protein || []);
        renderCat('Carb', i.details?.carb || []);
        renderCat('Veggies', i.details?.veggies || []);
        renderCat('Sauce', i.details?.sauce || []);
        message += `  Quantity: x${i.quantity}\n`;
        message += `  Price: ${formatCurrency(i.price * i.quantity)}\n\n`;
      });
    }

    message += `Total: ${formatCurrency(total)}\n\n`;
    message += "Please confirm availability.";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/4917684262753?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed right-6 md:right-12 top-24 w-[calc(100vw-3rem)] md:w-[400px] bg-white z-[101] shadow-2xl flex flex-col border border-black/5 rounded-[32px] overflow-hidden"
        >
          <div className="p-6 flex justify-between items-center border-b border-black/5">
            <div className="flex items-center gap-3">
              <ShoppingBag size={16} className="text-accent" />
              <h2 className="text-[10px] font-mono font-bold tracking-[0.3em] text-black uppercase">Basket</h2>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-grow max-h-[60vh] overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {items.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                <ShoppingBag size={40} className="text-black" />
                <p className="text-xs font-mono tracking-widest uppercase text-black">Empty</p>
              </div>
            ) : (
              items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-accent font-bold tracking-widest uppercase">
                        {item.type === 'lab' ? 'Custom' : 'Catalog'}
                      </span>
                      <h3 className="text-sm font-medium text-black tracking-wide leading-snug">{item.name}</h3>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-black/20 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                    <div className="bg-black/5 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-1 gap-2.5 text-[10px] font-mono uppercase tracking-widest text-black/40">
                        {['protein', 'carb', 'veggies', 'sauce'].map(cat => {
                           const catItems = item.details?.[cat as keyof NonNullable<typeof item.details>] as any[];
                           if (!catItems || catItems.length === 0) return null;
                           return (
                             <div key={cat} className="flex justify-between border-b border-black/5 pb-1.5 last:border-0 last:pb-0">
                               <span className="text-accent/60">{cat}:</span>
                               <span className="text-black/60 font-medium text-right max-w-[70%] leading-relaxed">
                                 {catItems.map((c: any) => `${c.name} (${c.weight}${c.unit || 'g'})`).join(' & ')}
                               </span>
                             </div>
                           );
                        })}
                      </div>
                      
                      {item.details && (
                        <button 
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/lab', { state: { config: item.details, name: item.name } });
                          }}
                          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-accent/20 bg-accent/5 text-[9px] font-mono font-bold tracking-widest text-accent uppercase hover:bg-accent hover:text-white transition-all"
                        >
                          <Beaker size={12} />
                          Customize in Lab
                        </button>
                      )}
                    </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-4 bg-black/5 rounded-full px-3.5 py-1.5 border border-black/5">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-black/40 hover:text-black transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-mono font-bold text-black min-w-[18px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-black/40 hover:text-black transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-mono font-bold text-black">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-black/5 bg-black/[0.01] space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono tracking-widest text-black/40 uppercase">Total Bill</span>
              <span className="text-2xl font-mono font-bold text-black">{formatCurrency(total)}</span>
            </div>
            
            <button
              disabled={items.length === 0}
              onClick={generateWhatsAppMessage}
              className="w-full py-5 bg-black text-white rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-accent transition-all active:scale-[0.98] disabled:opacity-10 disabled:cursor-not-allowed shadow-xl shadow-black/10"
            >
              Order on WhatsApp
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
