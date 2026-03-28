import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'));
        
        if (categoryParam) {
          q = query(q, where('category', '==', categoryParam));
        }
        
        const snap = await getDocs(q);
        let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Client-side filtering for search and price (Firestore limitations)
        if (searchParam) {
          const searchLower = searchParam.toLowerCase();
          results = results.filter(p => 
            p.name.toLowerCase().includes(searchLower) || 
            p.description.toLowerCase().includes(searchLower)
          );
        }

        results = results.filter(p => {
          const price = p.discountPrice || p.price;
          return price >= priceRange[0] && price <= priceRange[1];
        });

        // Sorting
        if (sortBy === 'price-low') results.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        if (sortBy === 'price-high') results.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        if (sortBy === 'newest') results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setProducts(results);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, searchParam, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-deep-black pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col mb-12 sm:mb-20">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-8 sm:w-12 h-[1px] bg-white/30"></div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/50 font-bold">Exclusive Collection</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif text-white uppercase tracking-tighter leading-none">
              {categoryParam ? categoryParam : 'The Shop'}
            </h1>
            
            <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start border-t border-white/5 pt-6 md:border-t-0 md:pt-0">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-colors">
                  <SlidersHorizontal size={14} className="text-white/60 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Refine</span>
              </button>
              
              <div className="relative group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-white/60 text-[10px] uppercase tracking-[0.2em] focus:outline-none appearance-none pr-8 cursor-pointer group-hover:text-white transition-colors font-bold"
                >
                  <option value="newest" className="bg-matte-black">Newest</option>
                  <option value="price-low" className="bg-matte-black">Price: Low</option>
                  <option value="price-high" className="bg-matte-black">Price: High</option>
                </select>
                <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="overflow-hidden mb-20"
            >
              <div className="bg-matte-black/30 backdrop-blur-xl border border-white/5 rounded-3xl p-10 md:p-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                  {/* Categories */}
                  <div>
                    <h3 className="micro-label text-white mb-8 border-b border-white/10 pb-4">Categories</h3>
                    <div className="flex flex-col space-y-4">
                      <button 
                        onClick={() => setSearchParams({})}
                        className={cn(
                          "text-left micro-label transition-all hover:translate-x-2",
                          !categoryParam ? "text-white font-bold" : "text-white/40 hover:text-white"
                        )}
                      >
                        All Collections
                      </button>
                      {categories.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setSearchParams({ category: cat.slug })}
                          className={cn(
                            "text-left micro-label transition-all hover:translate-x-2",
                            categoryParam === cat.slug ? "text-white font-bold" : "text-white/40 hover:text-white"
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="micro-label text-white mb-8 border-b border-white/10 pb-4">Price Range</h3>
                    <div className="space-y-8">
                      <div className="relative h-1 bg-white/10 rounded-full">
                        <input 
                          type="range" 
                          min="0" 
                          max="50000" 
                          step="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                          className="absolute inset-0 w-full h-1 bg-transparent accent-white cursor-pointer appearance-none"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">BDT 0</span>
                        <span className="text-sm font-serif text-white">BDT {priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Search */}
                  <div>
                    <h3 className="micro-label text-white mb-8 border-b border-white/10 pb-4">Search</h3>
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="Find your piece..."
                        className="w-full bg-white/5 border-b border-white/10 py-3 text-sm text-white focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                        value={searchParam || ''}
                        onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
                      />
                      <Search size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="space-y-6">
                <div className="aspect-[3/4] bg-white/5 animate-pulse rounded-2xl"></div>
                <div className="h-4 w-2/3 bg-white/5 animate-pulse rounded"></div>
                <div className="h-4 w-1/3 bg-white/5 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <div className="inline-block w-16 h-[1px] bg-white/20 mb-8"></div>
            <h3 className="text-4xl font-serif text-white mb-6 uppercase tracking-widest">No pieces found</h3>
            <p className="text-white/40 micro-label mb-12">Try adjusting your filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSearchParams({}); setPriceRange([0, 50000]); }}
              className="px-12 py-5 border border-white/20 rounded-full text-white micro-label hover:bg-white hover:text-black transition-all duration-500"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
