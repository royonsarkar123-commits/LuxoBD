import React, { useState } from 'react';
import { Send, Plus, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Welcome to the LuxoBD inner circle.');
      setEmail('');
    }
  };

  return (
    <section className="py-40 px-6 relative overflow-hidden bg-[#050505] border-t border-white/5">
      {/* Background Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.02)_0%,_transparent_70%)] pointer-events-none"></div>
      
      <div className="max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-6 mb-12">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                <Mail size={16} className="text-white/40" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold">Inner Circle</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-serif text-white mb-12 leading-[0.9] tracking-tighter uppercase">
              JOIN THE <br />
              <span className="accent-text italic">ELITE</span> JOURNEY
            </h2>
            
            <p className="text-white/40 text-lg max-w-md mb-16 font-light leading-relaxed uppercase tracking-widest">
              Subscribe to receive exclusive updates, early access to new collections, and luxury styling tips curated for the modern connoisseur.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative"
          >
            <form onSubmit={handleSubmit} className="relative group">
              <input 
                type="email" 
                placeholder="YOUR EMAIL ADDRESS"
                required
                className="w-full bg-transparent border-b border-white/20 py-8 text-2xl md:text-4xl font-serif text-white placeholder:text-white/10 focus:outline-none focus:border-white transition-all duration-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-0 bottom-8 group flex items-center space-x-4"
              >
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors duration-500">Subscribe</span>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500">
                  <Plus size={20} className="text-white group-hover:text-black transition-colors duration-500" />
                </div>
              </button>
            </form>
            
            <div className="mt-16 flex items-center space-x-8">
              <div className="flex -space-x-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Member" className="w-full h-full object-cover grayscale" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium">
                Join 5,000+ members in our community
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
