import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Lab from './pages/Lab';
import Plans from './pages/Plans';
import MacroGenerator from './pages/MacroGenerator';
import { Navbar } from './components/Navbar';
import { CartProvider } from './context/CartContext';
import { CartDropdown } from './components/CartDrawer';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Footer = () => {
  return (
    <footer className="border-t border-black/5 pt-20 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-heading font-medium tracking-[0.4em] text-black mb-6">
              B Y T E
            </div>
            <p className="text-sm text-gray-600 max-w-xs font-light">
              Engineered Nutrition™<br/>
              Local delivery for high performers.
            </p>
          </div>
          
          <div>
            <h4 className="font-mono text-xs text-black uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><a href="/menu" className="hover:text-black transition-colors">Menu</a></li>
              <li><Link to="/plans" className="hover:text-black transition-colors">OnlyPlans</Link></li>
              <li><a href="/lab" className="hover:text-black transition-colors">Lab</a></li>
              <li><a href="/#about" className="hover:text-black transition-colors">About</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-mono text-xs text-black uppercase tracking-widest mb-6">Connect</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-black/5 text-xs text-gray-400 font-mono">
          <p>© {new Date().getFullYear()} BYTE Nutrition. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'EUR');

  useEffect(() => {
    const handleCurrencyChange = () => setCurrency(localStorage.getItem('currency') || 'EUR');
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <div className="relative min-h-screen bg-transparent">
          <div className="fixed inset-0 -z-50 bg-[#070707]" style={{ 
            background: 'radial-gradient(circle at top right, rgba(46,71,255,0.06), transparent 40%), #070707' 
          }} />
          <Navbar />
          <CartDropdown currency={currency} />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="/macro-generator" element={<MacroGenerator />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
