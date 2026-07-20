'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, Trash2, Edit3, Plus, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useCurrenciesStore } from '@/store/currenciesStore';
import { currencies as countriesList } from '@/util/countries';
import { api } from '@/util/api';

export default function CurrenciesAdminPage() {
  const { currencies, loading, fetchCurrencies } = useCurrenciesStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    country: '',
    name: '',
    symbol: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    logo: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const handleCountryChange = (countryName: string) => {
    const matched = countriesList.find((c) => c.country === countryName);
    if (matched) {
      setForm((prev) => ({
        ...prev,
        country: countryName,
        name: matched.currencyName,
        symbol: matched.currencySymbol,
        logo: matched.flagUrl,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        country: countryName,
      }));
    }
  };

  const handleCreateOrUpdateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingId) {
        // Edit mode
        await api.put(`/admin/currencies/${editingId}`, form);
        setSuccessMsg(`Currency "${form.name}" updated successfully!`);
      } else {
        // Create mode
        await api.post('/admin/currencies', form);
        setSuccessMsg(`Currency "${form.name}" registered successfully!`);
      }

      setForm({
        country: '',
        name: '',
        symbol: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        logo: '',
      });
      setEditingId(null);
      setIsModalOpen(false);
      fetchCurrencies();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (curr: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    setEditingId(curr._id);
    
    // Find matching country by currencyName or symbol if possible to preselect country dropdown
    const matchedCountry = countriesList.find((c) => c.currencyName === curr.name) || 
                           countriesList.find((c) => c.currencySymbol === curr.symbol);

    setForm({
      country: matchedCountry ? matchedCountry.country : '',
      name: curr.name || '',
      symbol: curr.symbol || '',
      bankName: curr.bankName || '',
      accountName: curr.accountName || '',
      accountNumber: curr.accountNumber || '',
      logo: curr.logo || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteCurrency = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this currency?')) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.delete(`/admin/currencies/${id}`);
      setSuccessMsg('Currency deleted successfully.');
      fetchCurrencies();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  const handleOpenCreateModal = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setEditingId(null);
    setForm({
      country: '',
      name: '',
      symbol: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      logo: '',
    });
    setIsModalOpen(true);
  };

  if (loading && currencies.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-555 text-xs font-semibold uppercase tracking-wider">Syncing Currency Ledgers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header bar with button */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Currencies & Settlement Banks</h2>
          <p className="text-slate-555 text-xs font-light">Manage active system currencies and settlement bank routing keys.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Currency</span>
        </button>
      </div>

      {/* Alert Messaging */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs sm:text-sm flex gap-2.5 items-center">
          <CheckCircle size={18} className="flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-850 p-4 rounded-xl text-xs sm:text-sm flex gap-2.5 items-center">
          <AlertCircle size={18} className="flex-shrink-0 text-red-650" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Existing Currencies (White Card Table) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        
        {currencies.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center">No active currencies registered.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 pb-3">
                  <th className="pb-3 text-slate-400">Currency</th>
                  <th className="pb-3 text-slate-400">Symbol</th>
                  <th className="pb-3 text-slate-400">Bank Name</th>
                  <th className="pb-3 text-slate-400">Account Number</th>
                  <th className="pb-3 text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currencies.map((curr) => (
                  <tr key={curr._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold flex items-center gap-2 text-slate-800">
                      {curr.logo && <img src={curr.logo} alt={curr.name} className="w-5 h-3.5 object-cover rounded shadow-sm border border-slate-200" />}
                      <span>{curr.name}</span>
                    </td>
                    <td className="py-4 font-mono text-slate-655">{curr.symbol}</td>
                    <td className="py-4 text-slate-600">{curr.bankName || 'N/A'}</td>
                    <td className="py-4 text-slate-600 font-mono">{curr.accountNumber || 'N/A'}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(curr)}
                          className="p-2 text-slate-450 hover:text-primary hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Edit Currency"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteCurrency(curr._id)}
                          className="p-2 text-slate-450 hover:text-red-650 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete Currency"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Popup overlay for Currency Creation/Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slideIn">
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Landmark size={18} className="text-primary" />
                <span>{editingId ? 'Edit Currency Details' : 'Register New Currency'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleCreateOrUpdateCurrency}>
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                
                {/* 1. Country select list with side image flag */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-650">Select Country</label>
                  <div className="flex items-center gap-3">
                    <select
                      value={form.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="flex-1 border border-slate-200 rounded px-3 py-2.5 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary font-semibold"
                    >
                      <option value="">-- Choose Country --</option>
                      {countriesList.map((c) => (
                        <option key={c.country} value={c.country}>
                          {c.country} ({c.currencyName})
                        </option>
                      ))}
                    </select>
                    {form.logo && (
                      <div className="w-12 h-8 border border-slate-200 rounded overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center shadow-sm">
                        <img src={form.logo} alt="Flag" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650">Currency Name</label>
                    <input
                      type="text"
                      required
                      disabled
                      placeholder="Currency Name"
                      value={form.name}
                      className="border border-slate-200 rounded px-3 py-2.5 text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650">Symbol</label>
                    <input
                      type="text"
                      required
                      disabled
                      placeholder="Symbol"
                      value={form.symbol}
                      className="border border-slate-200 rounded px-3 py-2.5 text-xs bg-slate-100 text-slate-500 cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-650">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Access Settlement Bank"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="border border-slate-200 rounded px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650">Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Settlement Pool A"
                      value={form.accountName}
                      onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                      className="border border-slate-200 rounded px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 1029304950"
                      value={form.accountNumber}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      className="border border-slate-200 rounded px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded shadow transition-all cursor-pointer"
                >
                  {submitting ? 'Processing...' : editingId ? 'Save Changes' : 'Register Currency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
