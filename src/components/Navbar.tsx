import { useState, useEffect } from 'react';
import { useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'EUR');
  const { items, setIsOpen, isOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('currency', currency);
    window.dispatchEvent(new Event('currencyChange'));
  }, [currency]);

  // Since hero is now white, we don't need a special dark mode for it
  const isDarkHero = false; 
  const isBrightBackground = true; // Most of the app is now white-themed

  const navLinks = [
    { name: 'MENU', path: '/menu' },
    { name: 'GENERATE MEAL', path: '/macro-generator' },
    { name: 'OnlyPlans', path: '/plans' },
    { name: 'LAB', path: '/lab' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
      isScrolled || isMobileMenuOpen
        ? 'py-4 bg-white/95 backdrop-blur-3xl' 
        : 'py-8 bg-transparent'
    }`}>
      {/* Bottom Border - Fades in on scroll */}
      <div className={`absolute bottom-0 left-0 right-0 h-[1.5px] transition-opacity duration-700 ${
        isScrolled || isMobileMenuOpen
          ? isBrightBackground ? 'bg-black opacity-100' : 'bg-white opacity-100'
          : 'opacity-0'
      }`} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link 
            to="/" 
            className={`text-[20px] font-heading font-semibold tracking-[0.45em] transition-colors duration-300 ${
              isDarkHero && !isMobileMenuOpen ? 'text-white' : isBrightBackground ? 'text-black' : 'text-white'
            }`}
          >
            BYTE
          </Link>

          {/* Center: Links */}
          <div className="hidden lg:flex items-center gap-14">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[12px] font-mono font-bold tracking-[0.2em] transition-all duration-300 hover:text-accent ${
                  isDarkHero ? 'text-white/60' : isBrightBackground ? 'text-black/60' : 'text-white/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className={`hidden sm:flex items-center gap-4 text-[10px] font-mono font-bold tracking-[0.1em] ${
              isDarkHero && !isMobileMenuOpen ? 'text-white/40' : isBrightBackground ? 'text-black/40' : 'text-white/40'
            }`}>
              {['EUR', 'USD', 'IDR'].map(curr => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`hover:text-black dark:hover:text-white transition-colors ${
                    currency === curr 
                      ? isDarkHero && !isMobileMenuOpen ? 'text-white' : isBrightBackground ? 'text-black' : 'text-white' 
                      : ''
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 transition-colors cart-toggle ${
                isDarkHero && !isMobileMenuOpen ? 'text-white' : isBrightBackground ? 'text-black' : 'text-white'
              }`}
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
            </button>

            <Link 
              to="/lab" 
              className={`hidden md:inline-block px-8 py-3 rounded-full text-[10px] font-mono font-bold tracking-[0.15em] uppercase transition-all duration-500 ${
                (isDarkHero && !isMobileMenuOpen || !isBrightBackground) ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'
              }`}
            >
              Build Your Menu
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors ${
                isDarkHero && !isMobileMenuOpen ? 'text-white' : isBrightBackground ? 'text-black' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-black shadow-2xl lg:hidden overflow-hidden origin-top"
          >
            <div className="flex flex-col px-6 py-8 gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[14px] font-mono font-bold tracking-[0.2em] text-black hover:text-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              <Link 
                to="/lab" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 px-8 py-4 text-center rounded-full text-[12px] font-mono font-bold tracking-[0.15em] uppercase transition-all duration-500 bg-black text-white hover:bg-black/90"
              >
                Build Your Menu
              </Link>

              {/* Mobile Currency Selector */}
              <div className="flex items-center gap-6 mt-4 pt-8 border-t border-black/10 text-[12px] font-mono font-bold tracking-[0.1em] text-black/40">
                {['EUR', 'USD', 'IDR'].map(curr => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`hover:text-black transition-colors ${
                      currency === curr ? 'text-black' : ''
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
