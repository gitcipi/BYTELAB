import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

export const Toast = ({ message, isVisible, onClose }: { message: string; isVisible: boolean; onClose: () => void }) => {
  const { setIsOpen } = useCart();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onClose();
    }, 3000);
  };

  useEffect(() => {
    if (isVisible) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  const handleHoverStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleHoverEnd = () => {
    startTimer();
  };

  const handleClick = () => {
    setIsOpen(true);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          onMouseEnter={handleHoverStart}
          onMouseLeave={handleHoverEnd}
          onClick={handleClick}
          className="fixed bottom-12 left-1/2 z-[200] flex items-center gap-4 px-8 py-5 bg-white text-black rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 backdrop-blur-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="p-3 rounded-2xl bg-accent text-white group-hover:rotate-12 transition-transform duration-300">
            <ShoppingBag size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase opacity-30">Success</span>
            <span className="text-xs font-mono font-bold tracking-tight">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
