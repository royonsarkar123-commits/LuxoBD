import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-white mb-8">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-4xl font-serif accent-text mb-4">YOUR CART IS EMPTY</h1>
        <p className="text-gray-400 text-lg mb-10 text-center max-w-md">
          It seems you haven't added any luxury pieces to your collection yet.
        </p>
        <Link to="/shop" className="btn-accent">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 sm:py-32 px-6 bg-deep-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-16 sm:mb-24">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-[1px] bg-white/30"></div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-bold">Your Selection</span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif text-white uppercase tracking-tighter leading-none">
            Shopping <span className="italic opacity-70">Cart</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-10 sm:space-y-12">
            {items.map((item, idx) => (
              <motion.div 
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-12 group"
              >
                <Link to={`/product/${item.product.id}`} className="w-full sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 relative shrink-0">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                </Link>

                <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">{item.product.category}</span>
                      <h3 className="text-2xl sm:text-3xl font-serif text-white uppercase tracking-tight">{item.product.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                      <span>Size &mdash; <span className="text-white">{item.selectedSize}</span></span>
                      <span>Color &mdash; <span className="text-white">{item.selectedColor}</span></span>
                    </div>
                    <div className="text-xl font-serif text-white/80 italic">
                      {formatCurrency(item.product.discountPrice || item.product.price)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-12 pt-6 sm:pt-0 border-t border-white/5 sm:border-t-0">
                    <div className="flex items-center border border-white/10 rounded-full px-4 py-2 bg-white/5">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        className="text-white/40 hover:text-white transition-colors p-2"
                      ><Minus size={12} /></button>
                      <span className="w-10 text-center font-bold text-white text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        className="text-white/40 hover:text-white transition-colors p-2"
                      ><Plus size={12} /></button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                      className="text-white/20 hover:text-red-500 transition-all duration-500 p-2"
                    >
                      <Trash2 size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10 sm:p-12 sticky top-32">
              <h2 className="text-2xl font-serif text-white mb-10 uppercase tracking-tighter">Summary</h2>
              
              <div className="space-y-6 mb-12">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="text-white">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                  <span>Shipping</span>
                  <span className="text-white">Complimentary</span>
                </div>
                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                  <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Total</span>
                  <span className="text-4xl font-serif text-white italic">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full btn-accent flex items-center justify-center py-6 group mb-6"
              >
                Checkout <ArrowRight className="ml-4 group-hover:translate-x-1 transition-transform" size={18} strokeWidth={1.5} />
              </button>
              
              <Link to="/shop" className="block text-center text-white/30 hover:text-white text-[9px] uppercase tracking-[0.3em] font-bold transition-colors">
                Continue Shopping
              </Link>

              <div className="mt-12 pt-12 border-t border-white/5 space-y-6">
                {[
                  'Secure Checkout',
                  'Free Global Shipping',
                  '30-Day Luxury Guarantee'
                ].map(text => (
                  <div key={text} className="flex items-center space-x-4 text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">
                    <div className="w-1 h-1 rounded-full bg-white/20"></div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
