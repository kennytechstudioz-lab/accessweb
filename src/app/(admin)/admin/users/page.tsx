'use client';

import React, { useEffect, useState } from 'react';
import { 
  Landmark, 
  Search, 
  Check, 
  Ban, 
  Edit3, 
  Trash2, 
  DollarSign, 
  FileText, 
  CheckSquare,
  X,
  ArrowRightLeft,
  Send
} from 'lucide-react';
import { useUsersStore } from '@/store/usersStore';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/util/api';

export default function UsersAdminPage() {
  const { users, loading, fetchUsers } = useUsersStore();
  const { showToast } = useToastStore();
  
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected user for details editing (Modal state)
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserAccounts, setSelectedUserAccounts] = useState<any[]>([]);
  const [accountBalances, setAccountBalances] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected user for transaction dispatch (Modal state)
  const [selectedTxUser, setSelectedTxUser] = useState<any>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [submittingTx, setSubmittingTx] = useState(false);

  const [txForm, setTxForm] = useState({
    username: '',
    amount: '',
    transactionType: 'Credit',
    currency: 'USD',
    description: '',
    senderName: '',
    receiverName: '',
    receiverBank: '',
    receiverAccountNumber: '',
    status: 'Approved',
  });

  // Form states for profile editing
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    country: '',
    address: '',
    pin: '',
    swiftCode: '',
    routine: '',
    iban: '',
    tacCode: '',
    imf: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittingBalance, setSubmittingBalance] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((u) => {
      const nameMatch = u.fullName?.toLowerCase().includes(query);
      const usernameMatch = u.username?.toLowerCase().includes(query);
      const accMatch = u.accountNumber?.includes(query);
      const emailMatch = u.email?.toLowerCase().includes(query);
      return nameMatch || usernameMatch || accMatch || emailMatch;
    });
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleStartEdit = async (user: any) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      country: user.country || '',
      address: user.address || '',
      pin: user.pin?.toString() || '',
      swiftCode: user.swiftCode || '',
      routine: user.routine || '',
      iban: user.iban || '',
      tacCode: user.tacCode || '',
      imf: user.imf || '',
    });
    setIsModalOpen(true);

    try {
      const data = await api.get(`/admin/users/${user.username}`);
      const accountsList = data.accounts || [];
      setSelectedUserAccounts(accountsList);
      
      const initialBals: Record<string, number> = {};
      accountsList.forEach((acc: any) => {
        initialBals[acc.currency] = acc.balance;
      });
      setAccountBalances(initialBals);
    } catch (e) {
      console.error('Error fetching user accounts:', e);
    }
  };

  const handleStartTx = (user: any) => {
    setSelectedTxUser(user);
    setTxForm({
      username: user.username,
      amount: '',
      transactionType: 'Credit',
      currency: 'USD',
      description: 'System Manual Adjustment Entry',
      senderName: 'System Admin',
      receiverName: user.fullName || user.username,
      receiverBank: 'Access National Bank',
      receiverAccountNumber: user.accountNumber || '',
      status: 'Approved',
    });
    setIsTxModalOpen(true);
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTx(true);

    try {
      await api.post('/admin/transactions', txForm);
      showToast(`Transaction logged for @${txForm.username} successfully.`, 'success');
      setIsTxModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Error executing transaction clearance.', 'error');
    } finally {
      setSubmittingTx(false);
    }
  };

  const handleUpdateUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);

    try {
      const data = await api.put(`/admin/users/${selectedUser._id}`, editForm);
      showToast('User profile updated successfully.', 'success');
      setSelectedUser(data.user);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSuspension = async (suspendedValue: boolean) => {
    if (!selectedUser) return;

    try {
      const data = await api.put(`/admin/users/${selectedUser._id}`, { suspended: suspendedValue });
      showToast(suspendedValue ? 'User account has been suspended.' : 'User account has been activated.', 'success');
      setSelectedUser(data.user);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Error occurred.', 'error');
    }
  };

  const handleVerifyKyc = async (verifyValue: boolean) => {
    if (!selectedUser) return;

    try {
      const data = await api.put(`/admin/users/${selectedUser._id}`, { isVerified: verifyValue, onReview: false });
      showToast(verifyValue ? 'KYC cleared and user verified.' : 'KYC audit reset.', 'success');
      setSelectedUser(data.user);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Error occurred.', 'error');
    }
  };

  const handleUpdateBalances = async () => {
    if (!selectedUser) return;
    setSubmittingBalance(true);
    let updatedCount = 0;

    try {
      for (const acc of selectedUserAccounts) {
        const inputVal = accountBalances[acc.currency];
        if (inputVal !== undefined && inputVal !== acc.balance) {
          await api.put(`/admin/users/${selectedUser._id}/balance`, {
            currency: acc.currency,
            amount: inputVal,
          });
          updatedCount++;
        }
      }
      
      if (updatedCount > 0) {
        showToast('Ledger accounts updated successfully.', 'success');
        const accountsData = await api.get(`/admin/users/${selectedUser.username}`);
        const freshList = accountsData.accounts || [];
        setSelectedUserAccounts(freshList);
        
        const initialBals: Record<string, number> = {};
        freshList.forEach((a: any) => {
          initialBals[a.currency] = a.balance;
        });
        setAccountBalances(initialBals);
        fetchUsers();
      } else {
        showToast('No balance modifications detected.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating balances.', 'error');
    } finally {
      setSubmittingBalance(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      showToast('User has been successfully deleted.', 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Error deleting user.', 'error');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-555 text-xs font-semibold uppercase tracking-wider">Syncing Client Logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Audit Clients Database</h2>
        <p className="text-slate-555 text-xs font-light">Edit user credentials, KYC audits, account statuses, and ledger balances.</p>
      </div>

      {/* Search Bar & Stats summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, acc number..."
            className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total active users: <span className="font-bold text-slate-800">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Main Full Width Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {filteredUsers.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center font-light">No clients found matching query.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 pb-3">
                  <th className="pb-3 text-slate-400 w-12">S/N</th>
                  <th className="pb-3 text-slate-400 w-16">Picture</th>
                  <th className="pb-3 text-slate-400">Username & Acc</th>
                  <th className="pb-3 text-slate-400">Full Name</th>
                  <th className="pb-3 text-slate-400">Email Address</th>
                  <th className="pb-3 text-slate-400">Date Registered</th>
                  <th className="pb-3 text-slate-400">Status</th>
                  <th className="pb-3 text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, idx) => {
                  const createdDate = user.createdAt ? new Date(user.createdAt) : null;
                  const dateStr = createdDate ? createdDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A';
                  const timeStr = createdDate ? createdDate.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '';

                  return (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs uppercase text-slate-700 shadow-inner">
                          {user.fullName ? user.fullName[0] : user.username[0]}
                        </div>
                      </td>
                      <td className="py-4 font-mono">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800">@{user.username}</span>
                          <span className="text-[10px] text-slate-400">Acc: {user.accountNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-slate-700">{user.fullName || 'N/A'}</td>
                      <td className="py-4 text-slate-600">{user.email}</td>
                      <td className="py-4 font-mono font-light">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-800 font-bold">{timeStr}</span>
                          <span className="text-slate-400 text-[10px]">{dateStr}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            user.suspended ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}>
                            {user.suspended ? 'Suspended' : 'Active'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            user.isVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                            user.onReview ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            'bg-slate-100 text-slate-550 border border-slate-200'
                          }`}>
                            {user.isVerified ? 'KYC Verified' : user.onReview ? 'KYC Review' : 'No KYC'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleStartTx(user)}
                            className="p-2 text-slate-450 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            title="Inject Direct Transaction"
                          >
                            <ArrowRightLeft size={15} />
                          </button>
                          <button
                            onClick={() => handleStartEdit(user)}
                            className="p-2 text-slate-450 hover:text-primary hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Edit / Audit Account"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-slate-450 hover:text-red-655 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Client"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Custom Transaction injection Modal (for specific user) */}
      {isTxModalOpen && selectedTxUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slideIn">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-primary animate-pulse" />
                <span>Inject Transaction for @{selectedTxUser.username}</span>
              </h3>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-655 cursor-pointer p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTransaction}>
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Transaction Type</label>
                    <select
                      value={txForm.transactionType}
                      onChange={(e) => setTxForm({ ...txForm, transactionType: e.target.value })}
                      className="border border-slate-200 rounded px-2.5 py-2.5 text-xs bg-slate-50 text-slate-750 focus:outline-none focus:border-primary font-semibold"
                    >
                      <option value="Credit">Credit</option>
                      <option value="Debit">Debit</option>
                      <option value="Local-Transfer">Local Transfer</option>
                      <option value="Domestic-Wire">Domestic Wire</option>
                      <option value="International-Wire">International Wire</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Currency</label>
                    <select
                      value={txForm.currency}
                      onChange={(e) => setTxForm({ ...txForm, currency: e.target.value })}
                      className="border border-slate-200 rounded px-2.5 py-2.5 text-xs bg-slate-50 text-slate-750 focus:outline-none focus:border-primary font-semibold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Transaction Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={txForm.amount}
                      onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                      className="border border-slate-200 rounded px-3.5 py-2.5 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary font-mono font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Clearance Status</label>
                    <select
                      value={txForm.status}
                      onChange={(e) => setTxForm({ ...txForm, status: e.target.value })}
                      className="border border-slate-200 rounded px-2.5 py-2.5 text-xs bg-slate-50 text-slate-750 focus:outline-none focus:border-primary font-semibold"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Sender Name</label>
                    <input
                      type="text"
                      value={txForm.senderName}
                      onChange={(e) => setTxForm({ ...txForm, senderName: e.target.value })}
                      placeholder="e.g. Bank Deposit Desk"
                      className="border border-slate-200 rounded px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Receiver Name</label>
                    <input
                      type="text"
                      value={txForm.receiverName}
                      onChange={(e) => setTxForm({ ...txForm, receiverName: e.target.value })}
                      className="border border-slate-200 rounded px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Receiver Bank Name</label>
                    <input
                      type="text"
                      value={txForm.receiverBank}
                      onChange={(e) => setTxForm({ ...txForm, receiverBank: e.target.value })}
                      className="border border-slate-200 rounded px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Receiver Acc Number</label>
                    <input
                      type="text"
                      value={txForm.receiverAccountNumber}
                      onChange={(e) => setTxForm({ ...txForm, receiverAccountNumber: e.target.value })}
                      className="border border-slate-200 rounded px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-650 uppercase">Description / Memo</label>
                  <input
                    type="text"
                    required
                    value={txForm.description}
                    onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                    className="border border-slate-200 rounded px-3.5 py-2.5 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2.5 rounded border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTx}
                  className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={12} />
                  <span>{submittingTx ? 'Processing...' : 'Create Entry'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit User Modal Dialog overlay */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-slideIn">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                  {selectedUser.fullName ? selectedUser.fullName[0] : selectedUser.username[0]}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Audit User: {selectedUser.fullName || selectedUser.username}
                  </h3>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">Username: @{selectedUser.username} | Account: {selectedUser.accountNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-655 cursor-pointer p-1.5 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Scrollable block */}
            <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
              
              {/* 1. Accounts & Balances (Top of Modal) */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-primary" />
                  <span>Ledger Accounts & Balances</span>
                </h4>
                
                {selectedUserAccounts.length === 0 ? (
                  <p className="text-slate-400 text-xs py-2 text-center font-light">No ledger wallets registered for this client.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedUserAccounts.map((acc) => (
                        <div key={acc._id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-2 shadow-sm">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-750">
                            <span>{acc.currency} Wallet</span>
                            <span className="font-mono text-slate-400 text-[10px]">Acc No: {acc.accountNumber || 'N/A'}</span>
                          </div>
                          
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                              {acc.symbol}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={accountBalances[acc.currency] ?? 0}
                              onChange={(e) => setAccountBalances({ ...accountBalances, [acc.currency]: parseFloat(e.target.value) || 0 })}
                              className="w-full border border-slate-200 rounded pl-7 pr-3 py-1.5 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary font-mono font-bold"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      disabled={submittingBalance}
                      onClick={handleUpdateBalances}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded shadow self-end cursor-pointer disabled:bg-slate-200 transition-colors mt-2"
                    >
                      {submittingBalance ? 'Updating ledger balances...' : 'Update Ledger Balances'}
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Compliance Status Toggles */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-primary" />
                  <span>Compliance & Account Status</span>
                </h4>
                
                <div className="flex flex-wrap items-center gap-3">
                  {!selectedUser.isVerified ? (
                    <button
                      onClick={() => handleVerifyKyc(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                    >
                      <CheckSquare size={14} />
                      <span>Approve KYC Clearances</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerifyKyc(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckSquare size={14} />
                      <span>Revoke KYC Status</span>
                    </button>
                  )}

                  {selectedUser.suspended ? (
                    <button
                      onClick={() => handleToggleSuspension(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-emerald-600 border border-slate-200 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Activate User Account</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleSuspension(true)}
                      className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-250 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ban size={14} />
                      <span>Suspend User Account</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Profile Credentials Form */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-1.5">
                  <Edit3 size={14} className="text-primary" />
                  <span>Profile Specifications & Security Credentials</span>
                </h4>

                <form onSubmit={handleUpdateUserDetails} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">Client Full Name</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">Registered Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">IBAN Specifications</label>
                      <input
                        type="text"
                        value={editForm.iban}
                        onChange={(e) => setEditForm({ ...editForm, iban: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">SWIFT Code BIC</label>
                      <input
                        type="text"
                        value={editForm.swiftCode}
                        onChange={(e) => setEditForm({ ...editForm, swiftCode: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">Routing / Transit Code</label>
                      <input
                        type="text"
                        value={editForm.routine}
                        onChange={(e) => setEditForm({ ...editForm, routine: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">Transaction Auth (TAC)</label>
                      <input
                        type="text"
                        value={editForm.tacCode}
                        onChange={(e) => setEditForm({ ...editForm, tacCode: e.target.value })}
                        placeholder="e.g. 10293"
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">IMF Clearance Code</label>
                      <input
                        type="text"
                        value={editForm.imf}
                        onChange={(e) => setEditForm({ ...editForm, imf: e.target.value })}
                        placeholder="e.g. 50392"
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">Security Vault PIN</label>
                      <input
                        type="text"
                        value={editForm.pin}
                        onChange={(e) => setEditForm({ ...editForm, pin: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">Country</label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-550 uppercase">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded shadow transition-all self-end cursor-pointer mt-2"
                  >
                    {submitting ? 'Saving specifications...' : 'Save Profile Specs'}
                  </button>
                </form>
              </div>

              {/* 4. KYC Identity Document */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" />
                  <span>Identity Proof (KYC File Document)</span>
                </h4>

                {selectedUser.passport ? (
                  <div className="flex flex-col gap-3">
                    <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-mono truncate max-w-lg text-slate-600">{selectedUser.passport}</span>
                      <span className="text-[10px] text-primary uppercase font-bold">Uploaded Copy</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl text-xs text-slate-500 leading-relaxed font-light italic">
                      Government Identity clearance copy logged. Ready for compliance dispatch verification.
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-250 rounded-xl p-8 text-center text-slate-400 text-xs font-light">
                    No compliance documents uploaded on this vault directory.
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
