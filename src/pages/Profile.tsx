import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Order, UserProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { User, Package, MapPin, Phone, Mail, LogOut, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  const [editProfile, setEditProfile] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), editProfile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-24 sm:py-32 px-6 bg-deep-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-16 sm:mb-24">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-[1px] bg-white/30"></div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-bold">Client Account</span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif text-white uppercase tracking-tighter leading-none">
            Your <span className="italic opacity-70">Profile</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-20">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white mx-auto mb-8 border border-white/10 relative group">
                <User size={40} strokeWidth={1} />
                <div className="absolute inset-0 rounded-full border border-white/20 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2 uppercase tracking-tight">{profile?.displayName || 'Luxury Client'}</h2>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mb-10">{profile?.email}</p>
              
              <div className="space-y-4 pt-8 border-t border-white/5">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-500",
                    activeTab === 'orders' ? "bg-white text-black" : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>Orders</span>
                  <Package size={14} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-500",
                    activeTab === 'settings' ? "bg-white text-black" : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>Settings</span>
                  <User size={14} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => auth.signOut()}
                  className="w-full flex items-center justify-between px-6 py-4 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all duration-500"
                >
                  <span>Logout</span>
                  <LogOut size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' ? (
              <div className="space-y-12">
                <div className="flex items-end justify-between border-b border-white/5 pb-8">
                  <h2 className="text-3xl sm:text-4xl font-serif text-white uppercase tracking-tighter italic">Order History</h2>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">{orders.length} pieces found</span>
                </div>
                
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-40 bg-white/5 animate-pulse rounded-[32px]"></div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-8">
                    {orders.map(order => (
                      <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-[32px] p-8 sm:p-10 hover:border-white/30 transition-all duration-700 group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold block">Order ID &mdash; {order.id.slice(0, 8)}...</span>
                            <span className="text-sm font-serif text-white/60 italic">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                          </div>
                          <div className="flex items-center space-x-8">
                            <span className={cn(
                              "px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border",
                              order.status === 'delivered' ? "border-green-500/30 text-green-500 bg-green-500/5" :
                              order.status === 'cancelled' ? "border-red-500/30 text-red-500 bg-red-500/5" : "border-white/20 text-white bg-white/5"
                            )}>
                              {order.status}
                            </span>
                            <span className="text-2xl font-serif text-white italic">{formatCurrency(order.total)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-6 mb-10">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="w-16 h-20 rounded-xl overflow-hidden bg-white/5 relative group/item">
                              <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/20 group-hover/item:bg-transparent transition-colors duration-700" />
                            </div>
                          ))}
                        </div>

                        <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3 text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">
                              <Clock size={12} strokeWidth={1.5} />
                              <span>{order.paymentMethod}</span>
                            </div>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                              order.paymentStatus === 'paid' ? "border-green-500/20 text-green-500" : 
                              order.paymentStatus === 'pending_verification' ? "border-blue-500/20 text-blue-500" :
                              "border-yellow-500/20 text-yellow-500"
                            )}>
                              {order.paymentStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <button className="text-white/40 hover:text-white text-[10px] uppercase tracking-[0.2em] font-bold flex items-center group/btn transition-colors">
                            View Details <ChevronRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-32 text-center bg-white/5 border border-white/10 rounded-[32px]">
                    <Package size={48} strokeWidth={1} className="text-white/10 mx-auto mb-8" />
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold">No pieces found in your history.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-end justify-between border-b border-white/5 pb-8">
                  <h2 className="text-3xl sm:text-4xl font-serif text-white uppercase tracking-tighter italic">Settings</h2>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Update your details</span>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="bg-white/5 border border-white/10 rounded-[32px] p-10 sm:p-16 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold ml-4">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white transition-all duration-500 placeholder:text-white/10"
                        value={editProfile.displayName}
                        onChange={(e) => setEditProfile({ ...editProfile, displayName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold ml-4">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white transition-all duration-500 placeholder:text-white/10"
                        value={editProfile.phone}
                        onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold ml-4">Shipping Address</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-[32px] px-8 py-6 text-white focus:outline-none focus:border-white transition-all duration-500 placeholder:text-white/10 resize-none"
                        value={editProfile.address}
                        onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold ml-4">City</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white transition-all duration-500 placeholder:text-white/10"
                        value={editProfile.city}
                        onChange={(e) => setEditProfile({ ...editProfile, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-12 border-t border-white/5">
                    <button type="submit" className="btn-accent px-16 py-6">Save Changes</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
