import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Globe, ShieldCheck, Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.05)_0%,_transparent_70%)]"></div>
        <motion.img 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Luxury Fashion" 
          className="h-full w-full object-cover grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full min-h-screen max-w-[1800px] mx-auto px-6 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex items-center space-x-6 mb-12"
            >
              <span className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold">Collection 2026</span>
              <div className="w-24 h-[1px] bg-white/20"></div>
              <span className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold">Dhaka &mdash; Paris</span>
            </motion.div>
            
            <div className="relative">
              <motion.h1 
                initial={{ opacity: 0, scale: 1.1, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-7xl sm:text-8xl md:text-9xl lg:text-[14vw] font-serif text-white leading-[0.8] tracking-tighter uppercase"
              >
                THE <br />
                <span className="accent-text italic ml-[2vw] sm:ml-[5vw]">ETHEREAL</span> <br />
                <span className="text-white/20">CRAFT</span>
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute -right-12 top-1/2 -translate-y-1/2 hidden xl:block"
              >
                <div className="w-px h-64 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:pb-12">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <p className="text-white/50 text-sm md:text-base font-light leading-relaxed uppercase tracking-widest max-w-xs">
                  Redefining the boundaries of luxury through ancestral craftsmanship and modern minimalist silhouettes.
                </p>
                <div className="flex items-center space-x-4 text-[10px] uppercase tracking-widest text-white/30">
                  <Globe size={12} />
                  <span>Global Shipping Available</span>
                </div>
              </div>

              <div className="flex flex-col space-y-6">
                <Link to="/shop" className="group relative inline-flex items-center justify-between px-10 py-6 border border-white/10 rounded-full overflow-hidden transition-all duration-700 hover:border-white">
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]"></div>
                  <span className="relative z-10 micro-label text-white group-hover:text-black transition-colors duration-700">Explore Collection</span>
                  <ArrowRight className="relative z-10 text-white group-hover:text-black transition-colors duration-700 ml-4" size={20} />
                </Link>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md">
                    <ShieldCheck size={16} className="text-white/40 mb-4" />
                    <span className="block text-[10px] uppercase tracking-widest text-white/60">Certified</span>
                    <span className="block text-[10px] uppercase tracking-widest text-white/30">Authenticity</span>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md">
                    <Sparkles size={16} className="text-white/40 mb-4" />
                    <span className="block text-[10px] uppercase tracking-widest text-white/60">Limited</span>
                    <span className="block text-[10px] uppercase tracking-widest text-white/30">Editions</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Vertical Text */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:block">
        <span className="writing-vertical-rl rotate-180 text-[8px] uppercase tracking-[1em] text-white/10">
          ESTABLISHED &mdash; MMXXVI &mdash; DHAKA
        </span>
      </div>

      {/* Bottom Navigation Rail */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {[
            { label: 'New Arrivals', count: '12' },
            { label: 'Best Sellers', count: '08' },
            { label: 'Flash Sale', count: '24h' },
            { label: 'Signature', count: '04' }
          ].map((item, idx) => (
            <Link key={idx} to="/shop" className="group p-8 flex justify-between items-center hover:bg-white transition-all duration-700">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 group-hover:text-black transition-colors">{item.label}</span>
              <span className="text-[10px] font-mono text-white/20 group-hover:text-black/40 transition-colors">{item.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
