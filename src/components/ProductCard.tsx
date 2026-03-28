import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Plus, ArrowUpRight } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes[0], product.colors[0]);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-[#0a0a0a] mb-8 rounded-[32px] luxury-border">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-[2s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay Details */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-8">
          <div className="flex justify-between items-end translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-bold">{product.category}</span>
              <h4 className="text-white font-serif italic text-2xl leading-none">{product.name}</h4>
            </div>
            <button 
              onClick={handleAddToCart}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition-all duration-500 shadow-xl"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {product.discountPrice && (
          <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold">
            Sale
          </div>
        )}

        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </Link>
      
      <div className="flex justify-between items-start px-4">
        <div className="space-y-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-[11px] uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors duration-500 font-bold">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-serif italic text-white">
              {formatCurrency(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-white/20 line-through tracking-wider">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
        <button className="text-white/20 hover:text-white transition-colors duration-500 mt-1">
          <Heart size={16} strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
