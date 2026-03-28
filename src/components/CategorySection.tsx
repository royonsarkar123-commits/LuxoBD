import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const categories = [
  { 
    name: 'Men', 
    slug: 'men', 
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1974&auto=format&fit=crop',
    size: 'large'
  },
  { 
    name: 'Women', 
    slug: 'women', 
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop',
    size: 'small'
  },
  { 
    name: 'Hoodies', 
    slug: 'hoodie', 
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop',
    size: 'small'
  },
  { 
    name: 'T-Shirts', 
    slug: 't-shirt', 
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1974&auto=format&fit=crop',
    size: 'medium'
  },
];

const CategorySection: React.FC = () => {
  return (
    <section className="py-60 px-6 max-w-[1800px] mx-auto relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-40 gap-12">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-16 h-[1px] bg-white/20"></div>
            <span className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold">Curated Collections</span>
          </div>
          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10vw] font-serif leading-[0.8] tracking-tighter uppercase">
            EXPLORE <span className="accent-text italic">THE</span> <br />
            ARCHIVE
          </h2>
        </div>
        <div className="pb-4">
          <Link to="/shop" className="group flex items-center space-x-6">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors duration-500">View All Collections</span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white transition-all duration-500">
              <ArrowRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-500" />
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8 h-auto lg:h-[1400px]">
        {/* Men - Large Bento Item */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="md:col-span-8 relative group overflow-hidden rounded-[24px] sm:rounded-[40px] luxury-border h-[400px] md:h-full"
        >
          <Link to="/shop?category=men" className="block h-full">
            <img 
              src={categories[0].image} 
              alt={categories[0].name} 
              className="h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-16">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.8em] text-white/60 mb-4 sm:mb-6">Collection 01</span>
              <h3 className="text-4xl sm:text-6xl md:text-8xl font-serif text-white uppercase tracking-tighter mb-8 sm:mb-12">{categories[0].name}</h3>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-700">
                <ArrowRight className="text-white group-hover:text-black transition-colors duration-700" size={20} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Women - Small Bento Item */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          viewport={{ once: true }}
          className="md:col-span-4 relative group overflow-hidden rounded-[24px] sm:rounded-[40px] luxury-border h-[400px] md:h-full"
        >
          <Link to="/shop?category=women" className="block h-full">
            <img 
              src={categories[1].image} 
              alt={categories[1].name} 
              className="h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-16">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.8em] text-white/60 mb-4 sm:mb-6">Collection 02</span>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white uppercase tracking-tighter mb-8 sm:mb-10 italic">{categories[1].name}</h3>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-700">
                <ArrowRight className="text-white group-hover:text-black transition-colors duration-700" size={18} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Hoodies - Small Bento Item */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          viewport={{ once: true }}
          className="md:col-span-4 relative group overflow-hidden rounded-[24px] sm:rounded-[40px] luxury-border h-[400px] md:h-full"
        >
          <Link to="/shop?category=hoodie" className="block h-full">
            <img 
              src={categories[2].image} 
              alt={categories[2].name} 
              className="h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-16">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.8em] text-white/60 mb-4 sm:mb-6">Collection 03</span>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white uppercase tracking-tighter mb-8 sm:mb-10">{categories[2].name}</h3>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-700">
                <ArrowRight className="text-white group-hover:text-black transition-colors duration-700" size={18} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* T-Shirts - Medium Bento Item */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          viewport={{ once: true }}
          className="md:col-span-8 relative group overflow-hidden rounded-[24px] sm:rounded-[40px] luxury-border h-[400px] md:h-full"
        >
          <Link to="/shop?category=t-shirt" className="block h-full">
            <img 
              src={categories[3].image} 
              alt={categories[3].name} 
              className="h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-16">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.8em] text-white/60 mb-4 sm:mb-6">Collection 04</span>
              <h3 className="text-4xl sm:text-6xl md:text-8xl font-serif text-white uppercase tracking-tighter mb-8 sm:mb-12 italic">{categories[3].name}</h3>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-700">
                <ArrowRight className="text-white group-hover:text-black transition-colors duration-700" size={20} />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySection;
