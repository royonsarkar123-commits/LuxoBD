import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-700",
        isScrolled ? "bg-black/80 backdrop-blur-2xl py-4 border-b border-white/5" : "bg-transparent py-10"
      )}>
        <div className="max-w-[1800px] mx-auto px-8 lg:px-16 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-white/70 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-16">
            {['Men', 'Women', 'Accessories', 'New Arrival'].map((item) => (
              <Link 
                key={item}
                to={`/shop?category=${item}`}
                className="micro-label text-white/50 hover:text-white transition-all duration-500 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <h1 className="text-3xl font-serif tracking-[0.4em] uppercase text-white">
              Luxo<span className="font-light italic opacity-70">BD</span>
            </h1>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-8">
            <button 
              className="text-white/50 hover:text-white transition-all duration-500 hidden sm:block"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link to="/cart" className="relative text-white/50 hover:text-white transition-all duration-500">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link to={user ? "/profile" : "/login"} className="text-white/50 hover:text-white transition-all duration-500">
              <User size={20} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-6"
            >
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex items-center">
                <input 
                  type="text"
                  placeholder="Search luxury fashion..."
                  className="flex-1 bg-transparent border-b border-white/30 text-white focus:outline-none py-2 text-lg"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="ml-4 text-white hover:text-accent-light">
                  <Search size={24} />
                </button>
                <button 
                  type="button" 
                  className="ml-4 text-white hover:text-accent-light"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X size={24} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-deep-black/95 backdrop-blur-3xl flex flex-col"
          >
            <div className="flex justify-between items-center p-8 border-b border-white/5">
              <span className="text-2xl font-serif tracking-[0.4em] uppercase text-white">
                Luxo<span className="font-light italic opacity-70">BD</span>
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center px-12 space-y-10">
              <div className="space-y-6">
                <span className="text-[10px] uppercase tracking-[0.6em] text-white/30 font-bold block mb-4">Navigation</span>
                {['Home', 'Shop', 'Men', 'Women', 'Accessories'].map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link 
                      to={item === 'Home' ? '/' : item === 'Shop' ? '/shop' : `/shop?category=${item}`} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="text-4xl sm:text-6xl font-serif text-white/80 hover:text-white transition-all duration-500 uppercase tracking-tighter block"
                    >
                      {item === 'Women' ? <span className="italic">{item}</span> : item}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="pt-12 border-t border-white/5 space-y-6">
                <span className="text-[10px] uppercase tracking-[0.6em] text-white/30 font-bold block mb-4">Account</span>
                <div className="flex flex-col space-y-4">
                  {user ? (
                    <>
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-serif text-white/60 hover:text-white transition-colors uppercase tracking-widest">Profile</Link>
                      {isAdmin && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-serif text-white/60 hover:text-white transition-colors uppercase tracking-widest">Admin Panel</Link>}
                      <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left text-xl font-serif text-white/60 hover:text-white transition-colors uppercase tracking-widest">Logout</button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-serif text-white/60 hover:text-white transition-colors uppercase tracking-widest">Sign In</Link>
                  )}
                </div>
              </div>
            </div>

            <div className="p-12 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[8px] uppercase tracking-[0.4em] text-white/20">Established &mdash; 2026</span>
                <div className="flex space-x-6">
                  {['IG', 'FB', 'TW'].map(social => (
                    <span key={social} className="text-[10px] uppercase tracking-widest text-white/40">{social}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
