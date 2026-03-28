import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

interface PaymentStatusProps {
  status: 'success' | 'fail' | 'cancel';
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ status }) => {
  const [searchParams] = useSearchParams();
  const tran_id = searchParams.get('tran_id');
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const updateOrderStatus = async () => {
      if (status === 'success' && tran_id && user) {
        clearCart();
        try {
          // Find the order with this transaction ID and user ID
          const ordersRef = collection(db, 'orders');
          const q = query(
            ordersRef, 
            where('transactionId', '==', tran_id),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, 'orders', orderDoc.id), {
              paymentStatus: 'paid',
              status: 'processing',
              updatedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      }
    };

    updateOrderStatus();
  }, [status, tran_id, clearCart]);

  const config = {
    success: {
      icon: <CheckCircle2 size={64} className="text-white" />,
      title: "PAYMENT SUCCESSFUL",
      description: `Thank you for your purchase. Your transaction ID is ${tran_id}. Your luxury pieces are being prepared for shipment.`,
      button: "View Order History",
      link: "/profile"
    },
    fail: {
      icon: <XCircle size={64} className="text-white" />,
      title: "PAYMENT FAILED",
      description: "Unfortunately, your payment could not be processed. Please try again or contact support if the issue persists.",
      button: "Try Again",
      link: "/checkout"
    },
    cancel: {
      icon: <AlertCircle size={64} className="text-white" />,
      title: "PAYMENT CANCELLED",
      description: "You have cancelled the payment process. If this was a mistake, you can return to the checkout page to complete your order.",
      button: "Return to Checkout",
      link: "/checkout"
    }
  };

  const current = config[status];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 100 }}
        className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-12"
      >
        {current.icon}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-lg"
      >
        <h1 className="editorial-title mb-6">{current.title}</h1>
        <p className="text-white/60 text-lg mb-12 font-light leading-relaxed">
          {current.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => navigate(current.link)} 
            className="btn-accent"
          >
            {current.button}
          </button>
          <button 
            onClick={() => navigate('/shop')} 
            className="btn-outline-accent"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentStatus;
