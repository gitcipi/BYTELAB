import { useState, useEffect } from 'react';
import { useScroll } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'EUR');
  const { items, setIsOpen, isOpen } = useCart();
  const location = useLocation();

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

  const navLinks = [
    { name: 'Menu', path: '/menu' },
    { name: 'Plans', path: '/#plans' },
    { name: 'Lab', path: '/lab' },
    { name: 'About', path: '/#about' },
  ];

  const isDarkHero = location.pathname === '/' && !isScrolled;
  const isBrightBackground = !isDarkHero && (location.pathname !== '/' || isScrolled);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-[padding] duration-300 ${isScrolled ? 'py-4' : 'py-8'}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className={`flex items-center justify-between rounded-full px-8 py-3.5 transition-[background-color,border-color,box-shadow] duration-300 ${
          isScrolled 
            ? isBrightBackground ? 'glass-island-dark-text' : 'glass-island'
            : 'bg-transparent border-transparent'
        }`}>
          <Link 
            to="/" 
            className={`text-[26px] font-heading font-semibold tracking-[0.45em] transition-colors duration-75 ${
              isDarkHero ? 'text-white' : isBrightBackground ? 'text-black/90' : 'text-white'
            }`}
          >
            B Y T E
          </Link>
          
          <div className={`hidden md:flex items-center space-x-12 text-[12px] font-semibold tracking-[0.2em] transition-colors duration-75 ${
            isDarkHero ? 'text-white' : isBrightBackground ? 'text-black/90' : 'text-white'
          }`}>
            {navLinks.map((link) => {
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="hover:opacity-60 transition-opacity duration-200"
                >
                  {link.name.toUpperCase()}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-4 text-[12px] font-mono font-bold tracking-widest ${
              isDarkHero ? 'text-white/40' : isBrightBackground ? 'text-black/30' : 'text-white/40'
            }`}>
              {['EUR', 'USD', 'IDR'].map(curr => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`hover:text-black transition-colors ${
                    currency === curr 
                      ? isDarkHero ? 'text-white' : isBrightBackground ? 'text-black' : 'text-white' 
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
                isDarkHero ? 'text-white' : isBrightBackground ? 'text-black' : 'text-white'
              }`}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
            </button>

            <button className={`px-8 py-3 rounded-full text-[11px] font-mono font-bold tracking-[0.15em] uppercase transition-all duration-300 ${
              (isDarkHero || !isBrightBackground) ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              ORDER NOW
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
