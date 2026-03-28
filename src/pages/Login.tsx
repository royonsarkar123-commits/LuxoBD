import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back to LuxoBD!');
      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email/Password login is not enabled in Firebase. Please enable it in the Firebase Console or use Google Login.');
      } else {
        toast.error(error.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Welcome to LuxoBD!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login with Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-deep-black">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md bg-matte-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 md:p-14 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex flex-col items-center mb-10 group">
            <span className="text-5xl font-serif tracking-[0.4em] text-white font-bold group-hover:tracking-[0.5em] transition-all duration-700">LUXO</span>
            <span className="text-[10px] tracking-[0.8em] text-white/50 -mt-1 uppercase">Bangladesh</span>
          </Link>
          <h1 className="text-3xl font-serif text-white uppercase tracking-[0.2em] mb-3">Welcome Back</h1>
          <div className="w-12 h-[1px] bg-white/30 mx-auto mb-4"></div>
          <p className="text-white/40 text-xs uppercase tracking-widest">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 ml-6">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-full pl-16 pr-8 py-5 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 placeholder:text-white/20"
                placeholder="email@luxobd.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-6">
              <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Password</label>
              <Link to="/forgot-password" className="text-[9px] uppercase tracking-widest text-white/60 hover:text-white transition-colors">Forgot Password?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-full pl-16 pr-8 py-5 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 placeholder:text-white/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-5 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-500 group shadow-lg shadow-white/5"
          >
            {loading ? (
              <span className="flex items-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full mr-3"
                />
                Authenticating...
              </span>
            ) : (
              <>
                <span className="uppercase tracking-[0.2em] text-xs">Sign In</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12">
          <div className="relative flex items-center justify-center mb-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative bg-matte-black px-6 text-[9px] uppercase tracking-[0.3em] text-white/30">Or continue with</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-transparent border border-white/10 text-white font-medium py-5 rounded-full flex items-center justify-center hover:bg-white/5 transition-all duration-300 group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="uppercase tracking-[0.2em] text-[11px]">Google Account</span>
          </button>
        </div>

        <p className="text-center text-white/40 text-xs mt-12 uppercase tracking-widest">
          New to LuxoBD? <Link to="/register" className="text-white font-bold hover:underline underline-offset-8 decoration-white/30 transition-all">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
