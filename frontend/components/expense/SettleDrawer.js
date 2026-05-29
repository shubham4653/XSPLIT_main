"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, Loader2, Handshake, QrCode, ExternalLink } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function SettleDrawer({ debt, groupId, members, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'upi'

  // debt object has { from, to, amount }
  const receiver = members.find(m => m._id === debt.to);
  const hasUpi = Boolean(receiver?.upiId);

  const upiDeepLink = hasUpi 
    ? `upi://pay?pa=${receiver.upiId}&pn=${encodeURIComponent(receiver.name)}&am=${debt.amount.toFixed(2)}&cu=INR`
    : '';

  const handleSettle = async () => {
    setLoading(true);
    setError('');
    try {
      await fetchApi(`/groups/${groupId}/settle`, {
        method: 'POST',
        body: JSON.stringify({
          toUserId: debt.to,
          amount: debt.amount
        })
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to settle debt');
      setLoading(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-stone-200 flex flex-col max-h-[90vh]"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      <div className="p-4 flex justify-between items-center border-b shrink-0" style={{ borderColor: 'var(--card-border)' }}>
        <h2 className="text-xl font-bold font-serif tracking-tight" style={{ color: 'var(--foreground)' }}>Settle Up</h2>
        <button 
          onClick={onClose} 
          className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto p-6 pb-12 flex-1">
        
        {/* Payment Method Toggle */}
        <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              paymentMethod === 'cash' ? 'bg-white shadow-sm text-stone-900 border border-stone-200' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span>Cash</span>
          </button>
          <button
            onClick={() => setPaymentMethod('upi')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
              paymentMethod === 'upi' ? 'bg-white shadow-sm text-stone-900 border border-stone-200' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>UPI Transfer</span>
          </button>
        </div>

        {paymentMethod === 'cash' ? (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200 shadow-sm">
              <Handshake className="w-10 h-10 text-stone-600" />
            </div>
            <p className="text-stone-500 text-sm uppercase tracking-wide font-medium">
              Are you sure you want to record a cash payment of
            </p>
            <p className="text-4xl font-mono font-light text-stone-900 my-4">
              ₹{debt.amount.toFixed(2)}
            </p>
            <p className="text-stone-500 text-sm uppercase tracking-wide font-medium">
              to <span className="font-bold text-stone-900">{receiver?.name || 'this user'}</span>?
            </p>
          </div>
        ) : (
          <div className="text-center mb-8">
            {!hasUpi ? (
              <div className="py-8 px-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <p className="text-stone-600 font-medium mb-2">{receiver?.name} has not added their UPI ID.</p>
                <p className="text-stone-400 text-sm">You'll need to settle with cash or ask them to update their profile.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-stone-500 text-sm uppercase tracking-wide font-medium">
                  Scan to pay <span className="font-bold text-stone-900">{receiver.name}</span>
                </p>
                <div className="mx-auto bg-white p-4 rounded-2xl shadow-sm border border-stone-200 inline-block">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`} 
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-2xl font-mono font-light text-stone-900 my-2">
                  ₹{debt.amount.toFixed(2)}
                </p>
                <a 
                  href={upiDeepLink}
                  className="w-full bg-blush-400 text-white font-sans font-bold uppercase tracking-wide rounded-2xl py-3 hover:bg-blush-500 transition-colors flex items-center justify-center space-x-2 shadow-md"
                >
                  <span>Open UPI App</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs text-stone-400 mt-2">After paying, click "Confirm Payment" below to record it.</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSettle}
          disabled={loading || (paymentMethod === 'upi' && !hasUpi)}
          className="w-full bg-stone-900 text-white font-sans font-medium uppercase tracking-wide rounded-2xl py-4 hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <span>{paymentMethod === 'upi' ? 'I have made the payment' : 'Confirm Cash Payment'}</span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
