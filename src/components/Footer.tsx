import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-deep-black border-t border-white/5 py-24 sm:py-32 px-8 lg:px-16">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-24 sm:mb-32">
          <div className="lg:col-span-2 space-y-12">
            <h2 className="text-3xl sm:text-4xl font-serif tracking-[0.4em] uppercase text-white">
              Luxo<span className="font-light italic opacity-70">BD</span>
            </h2>
            <p className="text-white/40 text-base sm:text-lg max-w-md leading-relaxed font-light uppercase tracking-wide">
              Redefining luxury fashion with a commitment to quality, 
              minimalism, and timeless elegance. Crafted for the modern individual.
            </p>
            <div className="flex space-x-10">
              {['Instagram', 'Facebook', 'Twitter'].map(social => (
                <a key={social} href="#" className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 hover:text-white transition-all duration-500">
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold block">Collections</span>
            <ul className="space-y-6">
              {['New Arrivals', 'Men', 'Women', 'Accessories'].map(item => (
                <li key={item}>
                  <Link to="/shop" className="text-sm sm:text-base font-serif text-white/50 hover:text-white transition-all duration-500 italic">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold block">Support</span>
            <ul className="space-y-6">
              {['Shipping', 'Returns', 'Contact', 'Privacy'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-sm sm:text-base font-serif text-white/50 hover:text-white transition-all duration-500 italic">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-[1px] bg-white/10"></div>
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold">
              © 2026 LuxoBD &mdash; All rights reserved.
            </span>
          </div>
          <div className="flex space-x-12">
            {['Terms', 'Privacy', 'Cookies'].map(item => (
              <span key={item} className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold hover:text-white/50 cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
