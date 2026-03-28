import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, Heart, Share2, Star, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        let docSnap;
        try {
          docSnap = await getDoc(docRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `products/${id}`);
        }
        
        if (docSnap && docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          setSelectedSize(data.sizes[0]);
          setSelectedColor(data.colors[0]);
          
          // Fetch related products
          const relatedQuery = query(
            collection(db, 'products'), 
            where('category', '==', data.category),
            limit(5)
          );
          try {
            const relatedSnap = await getDocs(relatedQuery);
            setRelated(relatedSnap.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Product))
              .filter(p => p.id !== id)
            );
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, 'products');
          }
        } else {
          toast.error('Product not found');
          navigate('/shop');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl luxury-border">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    selectedImage === idx ? "border-white" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <span className="text-white/40 uppercase tracking-[0.4em] text-[10px] sm:text-xs mb-4 block font-bold">Category &mdash; {product.category}</span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-white mb-6 leading-[0.9] uppercase tracking-tighter">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex text-white/80">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} fill={i <= 4 ? "currentColor" : "none"} strokeWidth={1.5} />
                  ))}
                </div>
                <span className="text-white/30 text-[10px] uppercase tracking-widest">(48 Reviews)</span>
              </div>
              
              <div className="flex items-center space-x-6">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl sm:text-5xl font-serif accent-text italic">{formatCurrency(product.discountPrice)}</span>
                    <span className="text-xl sm:text-2xl text-white/20 line-through font-serif">{formatCurrency(product.price)}</span>
                    <span className="bg-white text-black text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-5xl font-serif accent-text italic">{formatCurrency(product.price)}</span>
                )}
              </div>
            </div>

            <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-12 font-light max-w-xl uppercase tracking-wide">
              {product.description}
            </p>

            {/* Selection */}
            <div className="space-y-10 mb-16">
              {/* Sizes */}
              <div>
                <h3 className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold mb-6">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-500 uppercase tracking-widest",
                        selectedSize === size ? "bg-white text-black border-white" : "border-white/10 text-white/40 hover:border-white/40"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold mb-6">Select Color</h3>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "group flex items-center space-x-3 px-6 py-3 rounded-full border transition-all duration-500",
                        selectedColor === color ? "bg-white/5 border-white" : "border-white/10 hover:border-white/40"
                      )}
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full border border-white/20",
                        color.toLowerCase() === 'black' ? 'bg-black' : 
                        color.toLowerCase() === 'white' ? 'bg-white' : 
                        color.toLowerCase() === 'gold' ? 'bg-[#D4AF37]' : 'bg-gray-500'
                      )}></div>
                      <span className={cn(
                        "text-[10px] uppercase tracking-[0.2em] font-bold",
                        selectedColor === color ? "text-white" : "text-white/40"
                      )}>{color}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold mb-6">Quantity</h3>
                <div className="flex items-center space-x-8">
                  <div className="flex items-center border border-white/10 rounded-full px-6 py-3 bg-white/5">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-white/40 hover:text-white transition-colors p-2"
                    >-</button>
                    <span className="w-12 text-center font-bold text-white text-sm">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="text-white/40 hover:text-white transition-colors p-2"
                    >+</button>
                  </div>
                  <span className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-bold">
                    {product.stock} pieces available
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <button 
                onClick={handleAddToCart}
                className="flex-1 btn-accent flex items-center justify-center group py-6"
              >
                Add to Cart <ShoppingBag className="ml-4 group-hover:translate-x-1 transition-transform" size={18} strokeWidth={1.5} />
              </button>
              <div className="flex gap-4">
                <button className="w-16 h-16 sm:w-20 sm:h-20 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:bg-white hover:text-black hover:border-white transition-all duration-700">
                  <Heart size={20} strokeWidth={1.5} />
                </button>
                <button className="w-16 h-16 sm:w-20 sm:h-20 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:bg-white hover:text-black hover:border-white transition-all duration-700">
                  <Share2 size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 pt-12 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Check size={20} />
                </div>
                <span className="text-xs uppercase tracking-widest text-gray-400">Premium Quality</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Check size={20} />
                </div>
                <span className="text-xs uppercase tracking-widest text-gray-400">Luxury Packaging</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Check size={20} />
                </div>
                <span className="text-xs uppercase tracking-widest text-gray-400">Global Shipping</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Check size={20} />
                </div>
                <span className="text-xs uppercase tracking-widest text-gray-400">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="py-24 border-t border-white/10">
            <div className="text-center mb-16">
              <span className="text-white uppercase tracking-[0.3em] text-xs mb-2 block">Complete the Look</span>
              <h2 className="text-4xl font-serif accent-text">YOU MAY ALSO LIKE</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
