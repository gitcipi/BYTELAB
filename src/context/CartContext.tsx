import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'standard' | 'lab';
  details?: {
    protein: { name: string; weight: number };
    carb: { name: string; weight: number; unit: string };
    veggies: { name: string; weight: number };
    sauce: { name: string; weight: number };
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_EXPIRY_DAYS = 7;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);


  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('byte_cart');
    const savedTime = localStorage.getItem('byte_cart_timestamp');

    if (savedCart && savedTime) {
      const now = new Date().getTime();
      const expiry = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      
      if (now - parseInt(savedTime) < expiry) {
        setItems(JSON.parse(savedCart));
      } else {
        localStorage.removeItem('byte_cart');
        localStorage.removeItem('byte_cart_timestamp');
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('byte_cart', JSON.stringify(items));
    localStorage.setItem('byte_cart_timestamp', new Date().getTime().toString());
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems(prev => {
      // For lab items, we always add as new if they are different, or we can just treat them as unique per add
      // For standard items, we increment quantity
      if (newItem.type === 'standard') {
        const existing = prev.find(i => i.id === newItem.id && i.type === 'standard');
        if (existing) {
          return prev.map(i => i.id === newItem.id && i.type === 'standard' 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
          );
        }
      }
      // Generate a unique ID for the specific cart entry if it's a lab item or new standard
      const entryId = newItem.type === 'lab' ? `${newItem.id}-${Date.now()}` : newItem.id;
      return [...prev, { ...newItem, id: entryId }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
