'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, CreditCard, ShieldAlert, CheckCircle, Plus, AlertCircle } from 'lucide-react';

export default function Cards() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [cardType, setCardType] = useState('Visa');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const res = await fetch(`${apiUrl}/user/cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCards(data);
    } catch (e) {
      console.error('Error fetching cards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleRequestCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequesting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const res = await fetch(`${apiUrl}/user/cards/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardType }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to request credit card');
      }

      setSuccess('Your credit card request was successfully submitted for clearance.');
      fetchCards();
    } catch (err: any) {
      setError(err.message || 'Error requesting card');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Syncing Cards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Card Management</h2>
        <p className="text-slate-400 text-xs font-light">View active priority vault cards or request a credit expansion.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex gap-2 items-center">
          <CheckCircle size={16} className="flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs flex gap-2 items-center">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Card Grid display */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Your Priority Cards</h3>
          
          {cards.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center gap-3 shadow-sm">
              <CreditCard size={36} className="text-slate-300" />
              <p className="text-slate-450 text-xs font-light">You do not have any credit/debit cards active.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cards.map((card) => {
                const isVisa = card.cardType === 'Visa';
                const isActive = card.status === 'Active';
                return (
                  <div
                    key={card._id}
                    className={`p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between h-48 relative overflow-hidden group border border-slate-800 ${
                      isActive 
                        ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900' 
                        : 'bg-gradient-to-br from-slate-800/80 to-slate-700/80'
                    }`}
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                    
                    <div className="flex justify-between items-start">
                      <Landmark size={24} className="text-primary" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        {card.cardType} {isActive ? '' : ' - Pending Approval'}
                      </span>
                    </div>

                    <p className="font-mono text-base tracking-widest text-center my-4">
                      {card.cardNumber.substring(0, 4)} **** **** {card.cardNumber.substring(card.cardNumber.length - 4)}
                    </p>

                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-500 uppercase">Card Holder</span>
                        <span className="text-xs font-semibold tracking-wide truncate max-w-[120px]">{card.cardHolder}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 text-right">
                        <span className="text-[8px] text-slate-500 uppercase">CVV</span>
                        <span className="text-xs font-semibold">{isActive ? '***' : card.cvv}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 text-right">
                        <span className="text-[8px] text-slate-500 uppercase">Expires</span>
                        <span className="text-xs font-semibold">{card.expiryDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Request Card Form */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Request New Card</h3>
          <p className="text-xs font-light text-slate-500 leading-relaxed">
            Expand your financial operations with a custom priority debit or credit card. Submit your request for administrative review.
          </p>

          <form onSubmit={handleRequestCard} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Card Provider / Network</label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 font-semibold text-slate-700"
              >
                <option value="Visa">Priority Visa</option>
                <option value="MasterCard">Priority MasterCard</option>
                <option value="Amex">Premium American Express</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={requesting}
              className="bg-primary text-white font-bold py-3.5 rounded hover:bg-primary-hover shadow transition-all flex items-center justify-center gap-2 text-xs disabled:bg-slate-400 cursor-pointer mt-2"
            >
              <Plus size={16} />
              <span>{requesting ? 'Submitting request...' : 'Submit Request'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
