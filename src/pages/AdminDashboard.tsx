import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { 
  collection, getDocs, query, orderBy, limit, doc, 
  updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc 
} from 'firebase/firestore';
import { Product, Order, Category, UserProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, 
  Plus, Edit, Trash2, Check, X, Eye, TrendingUp, DollarSign,
  Layers, Image as ImageIcon, Search, Filter, ArrowRight,
  ChevronRight, MoreVertical, ExternalLink, Ticket, Monitor,
  Star, Calendar, Clock, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Coupon, Banner, Review } from '../types';

const AdminDashboard: React.FC = () => {
  const { isAdmin, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'users' | 'categories' | 'coupons' | 'banners' | 'reviews'>('stats');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueData: [] as any[],
    categoryData: [] as any[]
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodSnap, orderSnap, userSnap, catSnap, couponSnap, bannerSnap, reviewSnap] = await Promise.all([
          getDocs(collection(db, 'products')).catch(err => handleFirestoreError(err, OperationType.GET, 'products')),
          getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))).catch(err => handleFirestoreError(err, OperationType.GET, 'orders')),
          getDocs(collection(db, 'users')).catch(err => handleFirestoreError(err, OperationType.GET, 'users')),
          getDocs(collection(db, 'categories')).catch(err => handleFirestoreError(err, OperationType.GET, 'categories')),
          getDocs(collection(db, 'coupons')).catch(err => handleFirestoreError(err, OperationType.GET, 'coupons')),
          getDocs(collection(db, 'banners')).catch(err => handleFirestoreError(err, OperationType.GET, 'banners')),
          getDocs(collection(db, 'reviews')).catch(err => handleFirestoreError(err, OperationType.GET, 'reviews'))
        ]);

        if (!prodSnap || !orderSnap || !userSnap || !catSnap || !couponSnap || !bannerSnap || !reviewSnap) return;

        const prodList = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const orderList = orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        const userList = userSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        const catList = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        const couponList = couponSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
        const bannerList = bannerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
        const reviewList = reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));

        setProducts(prodList);
        setOrders(orderList);
        setUsers(userList);
        setCategories(catList);
        setCoupons(couponList);
        setBanners(bannerList);
        setReviews(reviewList);

        const totalSales = orderList
          .filter(o => o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + o.total, 0);

        // Prepare revenue data for chart
        const revenueByDate: { [key: string]: number } = {};
        orderList.filter(o => o.paymentStatus === 'paid').forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          revenueByDate[date] = (revenueByDate[date] || 0) + order.total;
        });

        const revenueData = Object.entries(revenueByDate)
          .map(([date, amount]) => ({ date, amount }))
          .reverse()
          .slice(-7);

        // Prepare category data for chart
        const categoryCounts: { [key: string]: number } = {};
        prodList.forEach(p => {
          categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        });

        const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

        setStats({
          totalSales,
          totalOrders: orderList.length,
          totalProducts: prodList.length,
          totalUsers: userList.length,
          revenueData,
          categoryData
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  // --- Product Handlers ---
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      discountPrice: formData.get('discountPrice') ? Number(formData.get('discountPrice')) : undefined,
      category: formData.get('category') as string,
      stock: Number(formData.get('stock')),
      images: (formData.get('images') as string).split(',').map(s => s.trim()),
      sizes: (formData.get('sizes') as string).split(',').map(s => s.trim()),
      colors: (formData.get('colors') as string).split(',').map(s => s.trim()),
      isFeatured: formData.get('isFeatured') === 'on',
      isBestSeller: formData.get('isBestSeller') === 'on',
      isNewArrival: formData.get('isNewArrival') === 'on',
      updatedAt: new Date().toISOString(),
    };

    const flashSaleDiscount = formData.get('flashSaleDiscount') as string;
    const flashSaleEndTime = formData.get('flashSaleEndTime') as string;
    
    const finalData = {
      ...productData,
      flashSale: (flashSaleDiscount && flashSaleEndTime) ? {
        discount: Number(flashSaleDiscount),
        endTime: new Date(flashSaleEndTime).toISOString()
      } : null
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), finalData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...finalData } : p));
        toast.success('Product updated successfully');
      } else {
        const newDoc = await addDoc(collection(db, 'products'), {
          ...finalData,
          createdAt: new Date().toISOString(),
        });
        setProducts(prev => [{ id: newDoc.id, ...finalData, createdAt: new Date().toISOString() } as Product, ...prev]);
        toast.success('Product added successfully');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  // --- Category Handlers ---
  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryData = {
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
      image: formData.get('image') as string,
    };

    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...categoryData } : c));
        toast.success('Category updated successfully');
      } else {
        const newDoc = await addDoc(collection(db, 'categories'), categoryData);
        setCategories(prev => [{ id: newDoc.id, ...categoryData } as Category, ...prev]);
        toast.success('Category added successfully');
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'categories');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  // --- Order Handlers ---
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
      toast.success('Order status updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentStatus: 'paid', updatedAt: new Date().toISOString() });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid' } : o));
      toast.success('Payment verified');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Order deleted successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  };

  // --- Coupon Handlers ---
  const handleSaveCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const couponData = {
      code: (formData.get('code') as string).toUpperCase(),
      discount: Number(formData.get('discount')),
      type: formData.get('type') as 'percentage' | 'fixed',
      expiryDate: new Date(formData.get('expiryDate') as string).toISOString(),
      isActive: formData.get('isActive') === 'on',
    };

    try {
      if (editingCoupon) {
        await updateDoc(doc(db, 'coupons', editingCoupon.id), couponData);
        setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? { ...c, ...couponData } : c));
        toast.success('Coupon updated successfully');
      } else {
        const newDoc = await addDoc(collection(db, 'coupons'), couponData);
        setCoupons(prev => [{ id: newDoc.id, ...couponData } as Coupon, ...prev]);
        toast.success('Coupon added successfully');
      }
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'coupons');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `coupons/${id}`);
    }
  };

  // --- Banner Handlers ---
  const handleSaveBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bannerData = {
      title: formData.get('title') as string,
      subtitle: formData.get('subtitle') as string,
      image: formData.get('image') as string,
      link: formData.get('link') as string,
      order: Number(formData.get('order')),
    };

    try {
      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), bannerData);
        setBanners(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...bannerData } : b));
        toast.success('Banner updated successfully');
      } else {
        const newDoc = await addDoc(collection(db, 'banners'), bannerData);
        setBanners(prev => [{ id: newDoc.id, ...bannerData } as Banner, ...prev]);
        toast.success('Banner added successfully');
      }
      setIsBannerModalOpen(false);
      setEditingBanner(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'banners');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success('Banner deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `banners/${id}`);
    }
  };

  // --- Review Handlers ---
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reviews/${id}`);
    }
  };

  // --- User Handlers ---
  const handleToggleUserRole = async (uid: string, currentRole: string) => {
    if (uid === currentUser?.uid) {
      toast.error("You cannot change your own role");
      return;
    }
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole, updatedAt: new Date().toISOString() });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  // --- Search & Filter Logic ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-black">
        <div className="text-center">
          <X size={64} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-serif text-white uppercase tracking-widest">Access Denied</h1>
          <p className="text-white/40 mt-4">You do not have administrative privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-6 bg-deep-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-[1px] bg-white/30"></div>
              <span className="micro-label text-white/50">Management Suite</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif text-white uppercase tracking-tighter leading-none">
              Control <span className="accent-text italic">Center</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap bg-matte-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-1.5 gap-1">
            {[
              { id: 'stats', icon: LayoutDashboard, label: 'Stats' },
              { id: 'products', icon: Package, label: 'Products' },
              { id: 'categories', icon: Layers, label: 'Categories' },
              { id: 'orders', icon: ShoppingCart, label: 'Orders' },
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'coupons', icon: Ticket, label: 'Coupons' },
              { id: 'banners', icon: Monitor, label: 'Banners' },
              { id: 'reviews', icon: Star, label: 'Reviews' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center space-x-2 px-5 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all duration-500",
                  activeTab === tab.id ? "bg-white text-black font-bold shadow-lg shadow-white/10" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon size={14} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Search Bar (except for stats) */}
        {activeTab !== 'stats' && (
          <div className="mb-12 relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={20} />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-matte-black/30 border border-white/5 rounded-full pl-20 pr-8 py-6 text-white focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-16 h-16 border-2 border-white/10 border-t-white rounded-full mb-8"
            />
            <p className="micro-label text-white/30 animate-pulse">Synchronizing Data...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Revenue', value: formatCurrency(stats.totalSales), icon: DollarSign, color: 'text-green-400' },
                    { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-400' },
                    { label: 'Inventory', value: stats.totalProducts, icon: Package, color: 'text-white' },
                    { label: 'Clients', value: stats.totalUsers, icon: Users, color: 'text-purple-400' }
                  ].map((stat, idx) => (
                    <div 
                      key={idx}
                      className="bg-matte-black/30 border border-white/5 rounded-3xl p-10 flex flex-col justify-between h-56 group hover:border-white/20 transition-all duration-500"
                    >
                      <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500", stat.color)}>
                        <stat.icon size={24} />
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                        <h3 className="text-4xl font-serif text-white">{stat.value}</h3>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Revenue Chart */}
                  <div className="lg:col-span-2 bg-matte-black/30 border border-white/5 rounded-[2.5rem] p-10">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-xl font-serif text-white uppercase tracking-widest">Revenue Flow</h3>
                      <span className="micro-label text-white/30">Last 7 Days</span>
                    </div>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.revenueData}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#ffffff30" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#ffffff30" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `৳${value}`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="#fff" fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Distribution */}
                  <div className="bg-matte-black/30 border border-white/5 rounded-[2.5rem] p-10">
                    <h3 className="text-xl font-serif text-white uppercase tracking-widest mb-10">Inventory Split</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stats.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`rgba(255, 255, 255, ${0.2 + (index * 0.2)})`} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-3">
                      {stats.categoryData.slice(0, 4).map((cat, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest text-white/40">{cat.name}</span>
                          <span className="text-xs font-bold text-white">{cat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-matte-black/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                  <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Inventory</h2>
                  <div className="flex items-center gap-4">
                    <select 
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-[10px] uppercase tracking-widest text-white focus:outline-none focus:border-white/40 transition-all"
                    >
                      <option value="all" className="bg-matte-black">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug} className="bg-matte-black">{cat.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                      className="bg-white text-black px-8 py-3 rounded-full micro-label font-bold hover:bg-gray-200 transition-all flex items-center"
                    >
                      <Plus size={14} className="mr-2" /> Add Piece
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase tracking-[0.3em] text-white/40">
                      <tr>
                        <th className="px-10 py-6">Product</th>
                        <th className="px-10 py-6">Category</th>
                        <th className="px-10 py-6">Price</th>
                        <th className="px-10 py-6">Stock</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-8">
                            <div className="flex items-center space-x-6">
                              <div className="w-16 h-20 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-white block mb-1">{product.name}</span>
                                <div className="flex gap-2">
                                  {product.isFeatured && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Featured</span>}
                                  {product.flashSale && <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Flash Sale</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <span className="px-4 py-1.5 rounded-full bg-white/5 text-[10px] uppercase tracking-widest text-white/60 border border-white/5">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{formatCurrency(product.discountPrice || product.price)}</span>
                              {product.discountPrice && (
                                <span className="text-[10px] text-white/30 line-through">{formatCurrency(product.price)}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center space-x-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-yellow-500" : "bg-red-500"
                              )}></div>
                              <span className="text-sm text-white/60">{product.stock} Units</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-red-500/60 hover:text-red-500 hover:border-red-500 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div 
                  onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}
                  className="bg-matte-black/30 border border-white/5 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center h-64 cursor-pointer hover:border-white/20 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Plus size={24} className="text-white/40" />
                  </div>
                  <span className="micro-label text-white/40">New Category</span>
                </div>
                
                {categories.map(cat => (
                  <div 
                    key={cat.id}
                    className="bg-matte-black/30 border border-white/5 rounded-3xl overflow-hidden group hover:border-white/20 transition-all h-64 relative"
                  >
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1 block">Collection</span>
                        <h3 className="text-2xl font-serif text-white">{cat.name}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
                          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-matte-black/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="p-10 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Order Management</h2>
                  <select 
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-[10px] uppercase tracking-widest text-white focus:outline-none focus:border-white/40 transition-all"
                  >
                    <option value="all" className="bg-matte-black">All Status</option>
                    <option value="pending" className="bg-matte-black">Pending</option>
                    <option value="processing" className="bg-matte-black">Processing</option>
                    <option value="shipped" className="bg-matte-black">Shipped</option>
                    <option value="delivered" className="bg-matte-black">Delivered</option>
                    <option value="cancelled" className="bg-matte-black">Cancelled</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase tracking-[0.3em] text-white/40">
                      <tr>
                        <th className="px-10 py-6">Order</th>
                        <th className="px-10 py-6">Customer</th>
                        <th className="px-10 py-6">Total</th>
                        <th className="px-10 py-6">Payment</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-8">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white mb-1">#{order.id.slice(-6).toUpperCase()}</span>
                              <span className="text-[10px] text-white/30">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white mb-1">{order.shippingAddress.name}</span>
                              <span className="text-[10px] text-white/30">{order.shippingAddress.phone}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-sm text-white font-bold">{formatCurrency(order.total)}</td>
                          <td className="px-10 py-8">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] uppercase tracking-widest text-white/60">{order.paymentMethod}</span>
                                <span className={cn(
                                  "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                  order.paymentStatus === 'paid' ? "border-green-500/30 text-green-500 bg-green-500/10" : 
                                  order.paymentStatus === 'pending_verification' ? "border-blue-500/30 text-blue-500 bg-blue-500/10" :
                                  "border-yellow-500/30 text-yellow-500 bg-yellow-500/10"
                                )}>
                                  {order.paymentStatus.replace('_', ' ')}
                                </span>
                              </div>
                              {(order.transactionId || order.paymentStatus === 'pending_verification') && order.paymentStatus !== 'paid' && (
                                <button 
                                  onClick={() => handleVerifyPayment(order.id)}
                                  className="text-[8px] uppercase tracking-widest bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-gray-200 transition-all"
                                >
                                  Verify {order.transactionId}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <select 
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] uppercase tracking-widest text-white focus:outline-none focus:border-white/40 transition-all"
                            >
                              <option value="pending" className="bg-matte-black">Pending</option>
                              <option value="processing" className="bg-matte-black">Processing</option>
                              <option value="shipped" className="bg-matte-black">Shipped</option>
                              <option value="delivered" className="bg-matte-black">Delivered</option>
                              <option value="cancelled" className="bg-matte-black">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end space-x-4">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all"
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:border-red-500 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-matte-black/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="p-10 border-b border-white/5">
                  <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Client Base</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase tracking-[0.3em] text-white/40">
                      <tr>
                        <th className="px-10 py-6">User</th>
                        <th className="px-10 py-6">Role</th>
                        <th className="px-10 py-6">Joined</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map(u => (
                        <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-8">
                            <div className="flex items-center space-x-6">
                              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-serif text-xl">
                                {u.photoURL ? (
                                  <img src={u.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  u.displayName?.[0] || 'U'
                                )}
                              </div>
                              <div>
                                <span className="text-sm font-bold text-white block mb-1">{u.displayName || 'Anonymous'}</span>
                                <span className="text-[10px] text-white/30">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                              u.role === 'admin' ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-xs text-white/40">
                            {new Date(u.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          </td>
                          <td className="px-10 py-8 text-right">
                            <button 
                              onClick={() => handleToggleUserRole(u.uid, u.role)}
                              className="micro-label text-white/40 hover:text-white transition-colors"
                            >
                              Toggle Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Coupons Tab */}
            {activeTab === 'coupons' && (
              <div className="bg-matte-black/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="p-10 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Promotions</h2>
                  <button 
                    onClick={() => { setEditingCoupon(null); setIsCouponModalOpen(true); }}
                    className="bg-white text-black px-8 py-3 rounded-full micro-label font-bold hover:bg-gray-200 transition-all flex items-center"
                  >
                    <Plus size={14} className="mr-2" /> New Coupon
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase tracking-[0.3em] text-white/40">
                      <tr>
                        <th className="px-10 py-6">Code</th>
                        <th className="px-10 py-6">Discount</th>
                        <th className="px-10 py-6">Expiry</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {coupons.map(coupon => (
                        <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-8">
                            <span className="text-sm font-mono font-bold text-white bg-white/5 px-4 py-2 rounded-lg border border-white/10">{coupon.code}</span>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-sm text-white font-bold">
                              {coupon.type === 'percentage' ? `${coupon.discount}%` : formatCurrency(coupon.discount)}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-xs text-white/40">
                            {new Date(coupon.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="px-10 py-8">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                              coupon.isActive ? "border-green-500/30 text-green-500 bg-green-500/10" : "border-red-500/30 text-red-500 bg-red-500/10"
                            )}>
                              {coupon.isActive ? 'Active' : 'Expired'}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end space-x-4">
                              <button 
                                onClick={() => { setEditingCoupon(coupon); setIsCouponModalOpen(true); }}
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:border-red-500 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Banners Tab */}
            {activeTab === 'banners' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                  onClick={() => { setEditingBanner(null); setIsBannerModalOpen(true); }}
                  className="bg-matte-black/30 border border-white/5 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center h-64 cursor-pointer hover:border-white/20 transition-all group"
                >
                  <Plus size={24} className="text-white/20 mb-4" />
                  <span className="micro-label text-white/40">Add New Banner</span>
                </div>
                {banners.map(banner => (
                  <div key={banner.id} className="bg-matte-black/30 border border-white/5 rounded-3xl overflow-hidden relative group h-64">
                    <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
                      <div>
                        <h3 className="text-xl font-serif text-white mb-1">{banner.title}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Order: {banner.order}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => { setEditingBanner(banner); setIsBannerModalOpen(true); }}
                          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="bg-matte-black/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="p-10 border-b border-white/5">
                  <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Customer Feedback</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {reviews.map(review => (
                    <div key={review.id} className="p-10 flex justify-between items-start group">
                      <div className="flex space-x-6">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white font-serif text-xl">
                          {review.userName[0]}
                        </div>
                        <div>
                          <div className="flex items-center space-x-4 mb-2">
                            <span className="text-sm font-bold text-white">{review.userName}</span>
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-white/60 text-sm mb-4 leading-relaxed max-w-2xl">{review.comment}</p>
                          <div className="flex items-center space-x-4 text-[10px] text-white/30 uppercase tracking-widest">
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            <span>Product ID: {review.productId}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:border-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-matte-black border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 md:p-16 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-4xl font-serif text-white uppercase tracking-widest mb-2">
                      {editingProduct ? 'Refine Piece' : 'New Creation'}
                    </h2>
                    <p className="micro-label text-white/30">Enter the details for the elite collection</p>
                  </div>
                  <button 
                    onClick={() => setIsProductModalOpen(false)}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="micro-label text-white/40 ml-4">Product Name</label>
                      <input 
                        name="name"
                        defaultValue={editingProduct?.name}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white focus:outline-none focus:border-white/40 transition-all"
                        placeholder="Ex: Royal Silk Panjabi"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="micro-label text-white/40 ml-4">Category</label>
                      <select 
                        name="category"
                        defaultValue={editingProduct?.category}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white focus:outline-none focus:border-white/40 transition-all appearance-none"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.slug} className="bg-matte-black">{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="micro-label text-white/40 ml-4">Base Price (BDT)</label>
                      <input 
                        name="price"
                        type="number"
                        defaultValue={editingProduct?.price}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="micro-label text-white/40 ml-4">Discount Price (Optional)</label>
                      <input 
                        name="discountPrice"
                        type="number"
                        defaultValue={editingProduct?.discountPrice}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="micro-label text-white/40 ml-4">Stock Quantity</label>
                      <input 
                        name="stock"
                        type="number"
                        defaultValue={editingProduct?.stock}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="micro-label text-white/40 ml-4">Image URLs (Comma separated)</label>
                      <input 
                        name="images"
                        defaultValue={editingProduct?.images.join(', ')}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white focus:outline-none focus:border-white/40 transition-all"
                        placeholder="https://link1.com, https://link2.com"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="micro-label text-white/40 ml-4">Available Sizes (Comma separated)</label>
                      <input 
                        name="sizes"
                        defaultValue={editingProduct?.sizes.join(', ')}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white focus:outline-none focus:border-white/40 transition-all"
                        placeholder="S, M, L, XL"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="micro-label text-white/40 ml-4">Available Colors (Comma separated)</label>
                      <input 
                        name="colors"
                        defaultValue={editingProduct?.colors.join(', ')}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-white focus:outline-none focus:border-white/40 transition-all"
                        placeholder="Black, White, Gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <label className="flex items-center space-x-4 cursor-pointer group">
                      <input type="checkbox" name="isFeatured" defaultChecked={editingProduct?.isFeatured} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 checked:bg-white transition-all" />
                      <span className="micro-label text-white/60 group-hover:text-white transition-colors">Featured Piece</span>
                    </label>
                    <label className="flex items-center space-x-4 cursor-pointer group">
                      <input type="checkbox" name="isBestSeller" defaultChecked={editingProduct?.isBestSeller} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 checked:bg-white transition-all" />
                      <span className="micro-label text-white/60 group-hover:text-white transition-colors">Best Seller</span>
                    </label>
                    <label className="flex items-center space-x-4 cursor-pointer group">
                      <input type="checkbox" name="isNewArrival" defaultChecked={editingProduct?.isNewArrival} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 checked:bg-white transition-all" />
                      <span className="micro-label text-white/60 group-hover:text-white transition-colors">New Arrival</span>
                    </label>
                  </div>

                  <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-8">
                    <div className="flex items-center space-x-4">
                      <Clock size={18} className="text-red-500" />
                      <h3 className="micro-label text-white font-bold">Flash Sale Configuration</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="micro-label text-white/40 ml-4">Discount %</label>
                        <input 
                          name="flashSaleDiscount"
                          type="number"
                          defaultValue={editingProduct?.flashSale?.discount}
                          className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                          placeholder="Ex: 20"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="micro-label text-white/40 ml-4">End Time</label>
                        <input 
                          name="flashSaleEndTime"
                          type="datetime-local"
                          defaultValue={editingProduct?.flashSale?.endTime ? new Date(editingProduct.flashSale.endTime).toISOString().slice(0, 16) : ''}
                          className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="micro-label text-white/40 ml-4">Description</label>
                    <textarea 
                      name="description"
                      defaultValue={editingProduct?.description}
                      required
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-white focus:outline-none focus:border-white/40 transition-all resize-none"
                      placeholder="Describe the craftsmanship..."
                    />
                  </div>
                  <div className="pt-8 flex justify-end space-x-6">
                    <button 
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="px-10 py-5 rounded-full micro-label text-white/40 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-white text-black px-12 py-5 rounded-full micro-label font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
                    >
                      {editingProduct ? 'Update Piece' : 'Add to Collection'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coupon Modal */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-matte-black border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 md:p-12">
                <div className="flex justify-between items-start mb-10">
                  <h2 className="text-3xl font-serif text-white uppercase tracking-widest">
                    {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
                  </h2>
                  <button onClick={() => setIsCouponModalOpen(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveCoupon} className="space-y-6">
                  <div className="space-y-3">
                    <label className="micro-label text-white/40 ml-4">Coupon Code</label>
                    <input 
                      name="code"
                      defaultValue={editingCoupon?.code}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                      placeholder="SUMMER20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="micro-label text-white/40 ml-4">Discount</label>
                      <input 
                        name="discount"
                        type="number"
                        defaultValue={editingCoupon?.discount}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="micro-label text-white/40 ml-4">Type</label>
                      <select 
                        name="type"
                        defaultValue={editingCoupon?.type || 'percentage'}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all appearance-none"
                      >
                        <option value="percentage" className="bg-matte-black">Percentage</option>
                        <option value="fixed" className="bg-matte-black">Fixed Amount</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="micro-label text-white/40 ml-4">Expiry Date</label>
                    <input 
                      name="expiryDate"
                      type="date"
                      defaultValue={editingCoupon?.expiryDate ? new Date(editingCoupon.expiryDate).toISOString().split('T')[0] : ''}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                  <label className="flex items-center space-x-4 cursor-pointer group pt-2">
                    <input type="checkbox" name="isActive" defaultChecked={editingCoupon?.isActive ?? true} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 checked:bg-white transition-all" />
                    <span className="micro-label text-white/60 group-hover:text-white transition-colors">Active Coupon</span>
                  </label>
                  <button 
                    type="submit"
                    className="w-full bg-white text-black py-5 rounded-full micro-label font-bold hover:bg-gray-200 transition-all mt-4"
                  >
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Banner Modal */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-matte-black border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 md:p-12">
                <div className="flex justify-between items-start mb-10">
                  <h2 className="text-3xl font-serif text-white uppercase tracking-widest">
                    {editingBanner ? 'Edit Banner' : 'New Banner'}
                  </h2>
                  <button onClick={() => setIsBannerModalOpen(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveBanner} className="space-y-6">
                  <div className="space-y-3">
                    <label className="micro-label text-white/40 ml-4">Banner Title</label>
                    <input 
                      name="title"
                      defaultValue={editingBanner?.title}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="micro-label text-white/40 ml-4">Subtitle (Optional)</label>
                    <input 
                      name="subtitle"
                      defaultValue={editingBanner?.subtitle}
                      className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="micro-label text-white/40 ml-4">Image URL</label>
                    <input 
                      name="image"
                      defaultValue={editingBanner?.image}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="micro-label text-white/40 ml-4">Link URL</label>
                      <input 
                        name="link"
                        defaultValue={editingBanner?.link}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                        placeholder="/shop"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="micro-label text-white/40 ml-4">Display Order</label>
                      <input 
                        name="order"
                        type="number"
                        defaultValue={editingBanner?.order || 0}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-white text-black py-5 rounded-full micro-label font-bold hover:bg-gray-200 transition-all mt-4"
                  >
                    {editingBanner ? 'Update Banner' : 'Create Banner'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-matte-black border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-3xl font-serif text-white uppercase tracking-widest mb-2">Order Details</h2>
                    <p className="micro-label text-white/30">#{selectedOrder.id.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>

                <div className="space-y-10">
                  {/* Items */}
                  <div>
                    <h3 className="micro-label text-white mb-6 border-b border-white/10 pb-4">Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-16 rounded overflow-hidden border border-white/10">
                              <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.name}</p>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.size} | {item.color} | x{item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-sm text-white">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                      <span className="micro-label text-white/40">Total Amount</span>
                      <span className="text-xl font-bold text-white">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="micro-label text-white mb-4 border-b border-white/10 pb-2">Shipping To</h3>
                      <div className="text-sm text-white/60 space-y-1">
                        <p className="font-bold text-white">{selectedOrder.shippingAddress.name}</p>
                        <p>{selectedOrder.shippingAddress.phone}</p>
                        <p>{selectedOrder.shippingAddress.address}</p>
                        <p>{selectedOrder.shippingAddress.city}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="micro-label text-white mb-4 border-b border-white/10 pb-2">Payment</h3>
                      <div className="text-sm text-white/60 space-y-1">
                        <p className="uppercase tracking-widest">{selectedOrder.paymentMethod}</p>
                        <p className={cn(
                          "font-bold uppercase tracking-widest text-[10px]",
                          selectedOrder.paymentStatus === 'paid' ? "text-green-500" : "text-yellow-500"
                        )}>{selectedOrder.paymentStatus}</p>
                        {selectedOrder.transactionId && <p className="text-[10px] font-mono">TX: {selectedOrder.transactionId}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="bg-white text-black px-10 py-4 rounded-full micro-label font-bold hover:bg-gray-200 transition-all"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
