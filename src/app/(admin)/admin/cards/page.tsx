'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, Check, X, ShieldAlert, CreditCard } from 'lucide-react';
import { useCardsStore } from '@/store/cardsStore';
import { api } from '@/util/api';

export default function CardsAdminPage() {
  const { cards, loading, fetchCards } = useCardsStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleApproveCard = async (id: string) => {
    setActionLoadingId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.put(`/admin/cards/${id}/approve`);

      setSuccessMsg('Card request approved successfully.');
      fetchCards();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectCard = async (id: string) => {
    setActionLoadingId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.put(`/admin/cards/${id}/reject`);

      setSuccessMsg('Card request rejected.');
      fetchCards();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading && cards.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-555 text-xs font-semibold uppercase tracking-wider">Syncing Secure Card Vaults...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Virtual Card Clearances</h2>
        <p className="text-slate-555 text-xs font-light">Approve or reject customer credit and debit card vault allocations.</p>
      </div>

      {/* Alert Messaging */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs sm:text-sm flex gap-2.5 items-center">
          <Check size={18} className="flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-850 p-4 rounded-xl text-xs sm:text-sm flex gap-2.5 items-center">
          <ShieldAlert size={18} className="flex-shrink-0 text-red-555" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cards Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-slate-100">
          <CreditCard size={18} className="text-primary" />
          <span>Card Request Queue</span>
        </h3>

        {cards.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center font-light">No card accounts registered in system.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 pb-3">
                  <th className="pb-3 text-slate-400">Client</th>
                  <th className="pb-3 text-slate-400">Card Details</th>
                  <th className="pb-3 text-slate-400">Type</th>
                  <th className="pb-3 text-slate-400">Limit/Balance</th>
                  <th className="pb-3 text-slate-400">Status</th>
                  <th className="pb-3 text-slate-400 text-right">Clearance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cards.map((card) => {
                  const isPending = card.status === 'Pending';
                  
                  return (
                    <tr key={card._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-slate-800">
                        <div className="flex flex-col">
                          <span>{card.cardHolder}</span>
                          <span className="text-[10px] text-slate-450 font-mono mt-0.5">@{card.username}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-slate-705">
                        <div className="flex flex-col gap-0.5">
                          <span className="tracking-wider">
                            •••• •••• •••• {card.cardNumber?.substring(card.cardNumber.length - 4)}
                          </span>
                          <span className="text-[10px] text-slate-450">Exp: {card.expiryDate} | CVV: {card.cvv}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-600">{card.cardType || 'Visa'}</td>
                      <td className="py-4 font-mono text-slate-700">${card.balance?.toLocaleString()}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          card.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          card.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          'bg-red-50 text-red-655 border border-red-200'
                        }`}>
                          {card.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-slate-550 font-semibold font-mono">
                        {isPending ? (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={actionLoadingId === card._id}
                              onClick={() => handleApproveCard(card._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded transition-colors cursor-pointer"
                              title="Approve Card"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              disabled={actionLoadingId === card._id}
                              onClick={() => handleRejectCard(card._id)}
                              className="bg-red-600 hover:bg-red-750 text-white font-bold p-1.5 rounded transition-colors cursor-pointer"
                              title="Reject Card"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span>RESOLVED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
