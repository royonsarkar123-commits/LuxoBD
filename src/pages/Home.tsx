import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';
import { motion } from 'motion/react';
import { ArrowRight, Clock, Plus, Star, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const featuredQuery = query(collection(db, 'products'), where('isFeatured', '==', true), limit(4));
        const bestQuery = query(collection(db, 'products'), where('isBestSeller', '==', true), limit(4));
        
        const [featuredSnap, bestSnap] = await Promise.all([
          getDocs(featuredQuery),
          getDocs(bestQuery)
        ]);

        setFeatured(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        setBestSellers(bestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full"></div>
      </div>

      <Hero />
      
      {/* Brand Statement Section - Editorial Split */}
      <section className="py-60 px-6 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-4 mb-12">
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                    <Star size={12} className="text-white/40" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold">The Philosophy</span>
                </div>
                
                <h2 className="text-6xl md:text-8xl font-serif leading-[0.9] tracking-tighter mb-16 uppercase">
                  WE BELIEVE IN <span className="accent-text italic">TIMELESS</span> <br />
                  ELEGANCE AND THE <br />
                  POWER OF <span className="text-white/20">MINIMALISM</span>.
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                  <p className="text-white/50 text-lg font-light leading-relaxed">
                    Every piece in our collection is a testament to the artisan's skill and the beauty of premium materials sourced from the heart of Bangladesh.
                  </p>
                  <p className="text-white/30 text-sm font-light leading-relaxed uppercase tracking-widest">
                    Our design language is spoken through silence, where every stitch serves a purpose and every silhouette tells a story of heritage and future.
                  </p>
                </div>

                <Link to="/shop" className="group inline-flex items-center space-x-8">
                  <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-700">
                    <Plus className="text-white group-hover:text-black transition-colors duration-700" size={24} />
                  </div>
                  <span className="text-xs uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all duration-700">Discover More</span>
                </Link>
              </motion.div>
            </div>
            
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="relative aspect-[4/5] overflow-hidden rounded-[40px] luxury-border"
              >
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" 
                  alt="Editorial" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-12 right-12 bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                  <Award size={24} className="text-white mb-2" />
                  <span className="block text-[10px] uppercase tracking-widest text-white/60">Craftsmanship</span>
                  <span className="block text-[10px] uppercase tracking-widest text-white/30">Excellence</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <CategorySection />

      {/* Featured Collection - High-End Grid */}
      <section className="py-60 px-6 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-40 gap-12">
            <div className="max-w-3xl">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-16 h-[1px] bg-white/20"></div>
                <span className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold">Curated Selection</span>
              </div>
              <h2 className="text-8xl md:text-[12vw] font-serif leading-[0.8] tracking-tighter uppercase">
                THE <span className="accent-text italic">SIGNATURE</span> <br />
                SERIES
              </h2>
            </div>
            <div className="lg:pb-4">
              <Link to="/shop" className="group flex items-center space-x-6">
                <span className="text-xs uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors duration-500">View All Pieces</span>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white transition-all duration-500">
                  <ArrowRight size={18} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-500" />
                </div>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-3xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-40">
              {featured.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Split Layout - Immersive */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[120vh] relative z-10">
        <div className="relative group overflow-hidden border-r border-white/5">
          <img 
            src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=2070&auto=format&fit=crop" 
            alt="Men's Collection" 
            className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-all duration-1000 flex flex-col justify-center items-center p-12 text-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.8em] text-white/60 mb-8"
            >
              For Him
            </motion.span>
            <h3 className="text-8xl md:text-[10vw] font-serif text-white mb-16 uppercase tracking-tighter leading-none">ESSENTIAL</h3>
            <Link to="/shop?category=Men" className="group relative px-16 py-6 border border-white/20 rounded-full overflow-hidden transition-all duration-700 hover:border-white">
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]"></div>
              <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] text-white group-hover:text-black transition-colors duration-700">Explore Collection</span>
            </Link>
          </div>
        </div>
        <div className="relative group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" 
            alt="Women's Collection" 
            className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-all duration-1000 flex flex-col justify-center items-center p-12 text-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-[10px] uppercase tracking-[0.8em] text-white/60 mb-8"
            >
              For Her
            </motion.span>
            <h3 className="text-8xl md:text-[10vw] font-serif text-white mb-16 uppercase tracking-tighter leading-none">ETHEREAL</h3>
            <Link to="/shop?category=Women" className="group relative px-16 py-6 border border-white/20 rounded-full overflow-hidden transition-all duration-700 hover:border-white">
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]"></div>
              <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] text-white group-hover:text-black transition-colors duration-700">Explore Collection</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Flash Sale - Atmospheric */}
      <section className="py-60 px-6 relative overflow-hidden bg-[#050505] z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.03)_0%,_transparent_70%)] pointer-events-none"></div>
        
        <div className="max-w-[1800px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="inline-flex items-center space-x-4 bg-white/5 border border-white/10 px-8 py-3 rounded-full mb-16">
                <Zap className="text-white" size={16} />
                <span className="text-white/60 uppercase tracking-[0.6em] text-[10px] font-bold">Limited Time Offer</span>
              </div>
              
              <h2 className="text-8xl md:text-[12vw] font-serif text-white mb-12 leading-[0.8] tracking-tighter uppercase">
                FLASH <br />
                <span className="accent-text italic">SALE</span>
              </h2>
              
              <p className="text-white/40 text-xl max-w-xl mb-20 font-light leading-relaxed uppercase tracking-widest">
                Experience luxury at an unprecedented value. Our seasonal flash sale offers up to 50% off on selected signature pieces.
              </p>
              
              <div className="flex flex-wrap gap-12 mb-20">
                {[
                  { label: 'Days', value: '02' },
                  { label: 'Hours', value: '14' },
                  { label: 'Mins', value: '45' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-7xl md:text-9xl font-serif text-white mb-4">{item.value}</span>
                    <span className="text-white/30 uppercase tracking-[0.4em] text-[10px] font-bold">{item.label}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/shop?sale=true" className="group relative px-20 py-8 bg-white overflow-hidden rounded-full transition-all duration-700">
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]"></div>
                <span className="relative z-10 text-xs uppercase tracking-[0.6em] font-bold text-black group-hover:text-white transition-colors duration-700">Shop the Sale</span>
              </Link>
            </div>
            
            <div className="lg:col-span-5 order-1 lg:order-2">
              <motion.div 
                animate={{ y: [0, -30, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="relative aspect-[3/4] rounded-[60px] overflow-hidden luxury-border shadow-2xl shadow-white/5"
              >
                <img 
                  src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop" 
                  alt="Flash Sale" 
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers - Minimal Grid */}
      <section className="py-60 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-40">
            <span className="text-[10px] uppercase tracking-[1em] text-white/20 mb-8 block font-bold">Customer Favorites</span>
            <h2 className="text-8xl md:text-[10vw] font-serif text-white uppercase tracking-tighter leading-none">BEST SELLERS</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-3xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-40">
              {bestSellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Instagram Gallery - Immersive */}
      <section className="py-60 px-6 bg-white/5 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32 gap-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.6em] text-white/30 mb-6 block font-bold">Social Community</span>
              <h2 className="text-6xl font-serif text-white uppercase tracking-widest">@LuxoBD</h2>
            </div>
            <p className="text-white/40 max-w-sm text-sm uppercase tracking-[0.3em] leading-relaxed font-light">
              Join our journey and share your LuxoBD moments with the world. A community of refined taste.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1529139513477-323b63bc2d56?q=80&w=1000&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop'
            ].map((img, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 0.96, rotate: idx % 2 === 0 ? 1 : -1 }}
                className="aspect-square overflow-hidden rounded-3xl luxury-border"
              >
                <img src={img} alt="Gallery" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" referrerPolicy="no-referrer" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
};

export default Home;
