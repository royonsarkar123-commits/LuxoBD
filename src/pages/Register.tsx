import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from 'sonner';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      
      // Create user profile in Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          role: 'client',
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }

      toast.success('Welcome to LuxoBD!');
      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email/Password registration is not enabled in Firebase. Please enable it in the Firebase Console.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-serif text-white uppercase tracking-[0.2em] mb-3">Create Account</h1>
          <div className="w-12 h-[1px] bg-white/30 mx-auto mb-4"></div>
          <p className="text-white/40 text-xs uppercase tracking-widest">Join the elite collection</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 ml-6">Full Name</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="text" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-full pl-16 pr-8 py-5 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 placeholder:text-white/20"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

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
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 ml-6">Password</label>
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
                Creating Account...
              </span>
            ) : (
              <>
                <span className="uppercase tracking-[0.2em] text-xs">Register Now</span>
                <UserPlus className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/40 text-xs mt-12 uppercase tracking-widest">
          Already have an account? <Link to="/login" className="text-white font-bold hover:underline underline-offset-8 decoration-white/30 transition-all">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
