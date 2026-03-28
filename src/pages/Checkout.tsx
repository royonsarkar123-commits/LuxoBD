import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency, cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const Checkout: React.FC = () => {
  const { user, profile } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: profile?.displayName || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    paymentMethod: 'COD' as 'COD' | 'bKash' | 'Nagad' | 'Rocket' | 'SSLCommerz',
    transactionId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (formData.paymentMethod !== 'COD' && formData.paymentMethod !== 'SSLCommerz' && !formData.transactionId) {
      toast.error('Please provide the Transaction ID for verification');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user.uid,
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.discountPrice || item.product.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          image: item.product.images[0]
        })),
        total: totalPrice,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'COD' ? 'unpaid' : (formData.paymentMethod === 'SSLCommerz' ? 'unpaid' : 'pending_verification'),
        transactionId: formData.transactionId,
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (formData.paymentMethod === 'SSLCommerz') {
        const response = await fetch('/api/payment/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            total_amount: totalPrice,
            cus_name: formData.name,
            cus_email: user.email || 'customer@example.com',
            cus_add1: formData.address,
            cus_city: formData.city,
            cus_phone: formData.phone,
            product_name: items.map(i => i.product.name).join(', '),
          }),
        });

        const data = await response.json();
        if (data.url && data.tran_id) {
          // Save order as pending before redirecting
          const finalOrderData = {
            ...orderData,
            transactionId: data.tran_id
          };
          await addDoc(collection(db, 'orders'), finalOrderData);
          window.location.href = data.url;
          return;
        } else {
          throw new Error('Failed to initialize payment');
        }
      }

      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      setOrderSuccess(true);
      toast.success('Order placed successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white mb-8"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-4xl font-serif accent-text mb-4 text-center">ORDER CONFIRMED</h1>
        <p className="text-gray-400 text-lg mb-10 text-center max-w-md">
          Thank you for choosing LuxoBD. Your luxury pieces are being prepared for shipment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/profile')} className="btn-accent">View Order History</button>
          <button onClick={() => navigate('/shop')} className="btn-outline-accent">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-serif accent-text mb-12 uppercase tracking-widest">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Shipping Info */}
          <div className="space-y-12">
            <section>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Truck size={20} />
                </div>
                <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Shipping Details</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 ml-4">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    className="w-full bg-matte-black border border-white/30 rounded-full px-6 py-3 text-white focus:outline-none focus:border-white"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 ml-4">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    className="w-full bg-matte-black border border-white/30 rounded-full px-6 py-3 text-white focus:outline-none focus:border-white"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 ml-4">Shipping Address</label>
                  <textarea 
                    name="address"
                    required
                    rows={3}
                    className="w-full bg-matte-black border border-white/30 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white"
                    value={formData.address}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 ml-4">City</label>
                  <input 
                    type="text" 
                    name="city"
                    required
                    className="w-full bg-matte-black border border-white/30 rounded-full px-6 py-3 text-white focus:outline-none focus:border-white"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-2xl font-serif text-white uppercase tracking-widest">Payment Method</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                {['COD', 'bKash', 'Nagad', 'Rocket', 'SSLCommerz'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method as any }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
                      formData.paymentMethod === method ? "bg-white/10 border-white" : "bg-matte-black border-white/20 hover:border-white/50"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      formData.paymentMethod === method ? "text-white" : "text-gray-500"
                    )}>{method}</span>
                  </button>
                ))}
              </div>

              {formData.paymentMethod !== 'COD' && formData.paymentMethod !== 'SSLCommerz' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/20 rounded-xl p-6 space-y-4"
                >
                  <p className="text-sm text-gray-400">
                    Please send the total amount to our official <span className="text-white font-bold">{formData.paymentMethod}</span> number: <span className="text-white font-bold">+880 1700 000000</span> and enter the Transaction ID below.
                  </p>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 ml-4">Transaction ID</label>
                    <input 
                      type="text" 
                      name="transactionId"
                      required
                      placeholder="e.g. 8N7K9L2P"
                      className="w-full bg-deep-black border border-white/30 rounded-full px-6 py-3 text-white focus:outline-none focus:border-white"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </section>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-matte-black border border-white/30 rounded-xl p-8 sticky top-32">
              <h2 className="text-2xl font-serif accent-text mb-8 uppercase tracking-widest">Order Summary</h2>
              
              <div className="max-h-64 overflow-y-auto mb-8 space-y-4 pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-12 h-16 rounded overflow-hidden luxury-border shrink-0">
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs text-white font-bold truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Qty: {item.quantity} | {item.selectedSize}</p>
                    </div>
                    <span className="text-xs text-white font-bold">
                      {formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8 pt-6 border-t border-white/10">
                <div className="flex justify-between text-gray-400 uppercase tracking-widest text-xs">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-400 uppercase tracking-widest text-xs">
                  <span>Shipping</span>
                  <span className="text-white">Free</span>
                </div>
                <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                  <span className="text-white font-bold uppercase tracking-widest">Total</span>
                  <span className="text-3xl font-bold accent-text">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-accent flex items-center justify-center"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Order'} 
                {!isSubmitting && <ShieldCheck className="ml-2" size={20} />}
              </button>
              
              <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mt-6">
                By clicking confirm, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
