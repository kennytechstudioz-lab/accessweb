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
  CheckSquare,
  X,
  ArrowRightLeft,
  Send,
  Mail,
  Bell,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useUsersStore } from '@/store/usersStore';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/util/api';

export default function UsersAdminPage() {
  const { users, loading, fetchUsers } = useUsersStore();
  const { showToast } = useToastStore();
  
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-select & Bulk actions state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Selected user for details editing (Modal state)
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserAccounts, setSelectedUserAccounts] = useState<any[]>([]);
  const [accountBalances, setAccountBalances] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected user for transaction dispatch (Modal state)
  const [selectedTxUser, setSelectedTxUser] = useState<any>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [submittingTx, setSubmittingTx] = useState(false);

  // Bulk Email Modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({
    template: 'welcome',
    subject: 'Welcome to Access National Bank - Account Clearance',
    content: 'Dear Valued Client,\n\nYour online banking vault has been fully initialized and activated. You can now access multi-currency transfers and real-time ledger services.\n\nBest Regards,\nAccess National Bank Administration',
  });

  // Bulk Notification Modal state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [sendingBulkNotif, setSendingBulkNotif] = useState(false);
  const [notifForm, setNotifForm] = useState({
    template: 'security',
    title: 'Account Security Clearance Notice',
    message: 'Important security update: Please verify your contact details and review active ledger authorizations.',
  });

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

  // Filter users & reset pagination
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((u) => {
        const nameMatch = u.fullName?.toLowerCase().includes(query);
        const usernameMatch = u.username?.toLowerCase().includes(query);
        const accMatch = u.accountNumber?.includes(query);
        const emailMatch = u.email?.toLowerCase().includes(query);
        return nameMatch || usernameMatch || accMatch || emailMatch;
      });
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, users]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle selection
  const handleToggleSelectAll = () => {
    const currentPageIds = paginatedUsers.map((u) => u._id);
    const allSelectedOnPage = currentPageIds.every((id) => selectedUserIds.includes(id));

    if (allSelectedOnPage) {
      setSelectedUserIds(selectedUserIds.filter((id) => !currentPageIds.includes(id)));
    } else {
      const updated = Array.from(new Set([...selectedUserIds, ...currentPageIds]));
      setSelectedUserIds(updated);
    }
  };

  const handleToggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((item) => item !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

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

  // Bulk Deletion
  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedUserIds.length} selected users? This action cannot be undone.`)) return;

    try {
      await Promise.all(selectedUserIds.map((id) => api.delete(`/admin/users/${id}`)));
      showToast(`${selectedUserIds.length} users deleted successfully.`, 'success');
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err: any) {
      showToast('Error performing bulk deletion.', 'error');
    }
  };

  // Preset Email Template Selection
  const handleEmailTemplateChange = (templateKey: string) => {
    if (templateKey === 'welcome') {
      setEmailForm({
        template: 'welcome',
        subject: 'Welcome to Access National Bank - Account Clearance',
        content: 'Dear Valued Client,\n\nYour online banking vault has been fully initialized and activated. You can now access multi-currency transfers and real-time ledger services.\n\nBest Regards,\nAccess National Bank Administration',
      });
    } else if (templateKey === 'kyc') {
      setEmailForm({
        template: 'kyc',
        subject: 'Identity Verification Clearance Required',
        content: 'Dear Client,\n\nTo ensure uninterrupted international transfers, please upload your identity clearance documentation under your dashboard KYC settings.\n\nAccess National Audit Desk',
      });
    } else if (templateKey === 'security') {
      setEmailForm({
        template: 'security',
        subject: 'Security Alert - Vault Auth Clearance',
        content: 'Dear Client,\n\nWe detected a routine security audit check on your vault. Please review your active authorizations and contact support if you notice unfamiliar activity.\n\nSecurity Audit Bureau',
      });
    } else if (templateKey === 'statement') {
      setEmailForm({
        template: 'statement',
        subject: 'Monthly Ledger Statement Notice',
        content: 'Dear Client,\n\nYour monthly account transaction statement and ledger summaries are now available for review inside your secure portal.\n\nAccess National Accounting',
      });
    } else {
      setEmailForm({
        template: 'custom',
        subject: '',
        content: '',
      });
    }
  };

  // Preset Notification Template Selection
  const handleNotifTemplateChange = (templateKey: string) => {
    if (templateKey === 'security') {
      setNotifForm({
        template: 'security',
        title: 'Account Security Clearance Notice',
        message: 'Important security update: Please verify your contact details and review active ledger authorizations.',
      });
    } else if (templateKey === 'kyc') {
      setNotifForm({
        template: 'kyc',
        title: 'KYC Document Audit Reminder',
        message: 'Your identity verification documents are pending review. Upload valid clearance files to clear wire transfers.',
      });
    } else if (templateKey === 'maintenance') {
      setNotifForm({
        template: 'maintenance',
        title: 'System Maintenance Announcement',
        message: 'Scheduled system ledger upgrades will take place this weekend. Banking vaults remain fully secure.',
      });
    } else {
      setNotifForm({
        template: 'custom',
        title: '',
        message: '',
      });
    }
  };

  // Submit Bulk Email
  const handleSendBulkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBulkEmail(true);

    try {
      const targetUsers = users.filter((u) => selectedUserIds.includes(u._id));
      for (const u of targetUsers) {
        await api.post('/admin/notifications', {
          title: `[EMAIL SENT] ${emailForm.subject}`,
          message: emailForm.content,
          target: u.username,
        }).catch(() => {});
      }

      showToast(`Email successfully dispatched to ${targetUsers.length} selected users.`, 'success');
      setIsEmailModalOpen(false);
      setSelectedUserIds([]);
    } catch (err: any) {
      showToast('Error dispatching bulk emails.', 'error');
    } finally {
      setSendingBulkEmail(false);
    }
  };

  // Submit Bulk Notification
  const handleSendBulkNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBulkNotif(true);

    try {
      const targetUsers = users.filter((u) => selectedUserIds.includes(u._id));
      for (const u of targetUsers) {
        await api.post('/admin/notifications', {
          title: notifForm.title,
          message: notifForm.message,
          target: u.username,
        });
      }

      showToast(`Notification broadcasted to ${targetUsers.length} selected users.`, 'success');
      setIsNotifModalOpen(false);
      setSelectedUserIds([]);
    } catch (err: any) {
      showToast('Error broadcasting bulk notifications.', 'error');
    } finally {
      setSendingBulkNotif(false);
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
    <div className="flex flex-col gap-6 relative pb-20">
      
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

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col gap-4">
        {filteredUsers.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center font-light">No clients found matching query.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 pb-3">
                  <th className="pb-3 text-slate-400 w-24">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUserIds.includes(u._id))}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                      <span>S/N</span>
                    </div>
                  </th>
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
                {paginatedUsers.map((user, idx) => {
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

                  const isSelected = selectedUserIds.includes(user._id);
                  const snNumber = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr key={user._id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-red-50/40' : ''}`}>
                      <td className="py-4 font-mono font-bold text-slate-400">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectUser(user._id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                          />
                          <span>{snNumber}</span>
                        </div>
                      </td>
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

        {/* Pagination Bar */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-mono">
            <div>
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of{' '}
              <span className="font-bold text-slate-800">{filteredUsers.length}</span> clients
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bulk Options Bar */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-6 max-w-2xl w-[92%] animate-slideUp">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
              {selectedUserIds.length}
            </span>
            <span className="font-bold">Clients Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Mail size={14} className="text-red-400" />
              <span>Send Email</span>
            </button>

            <button
              onClick={() => setIsNotifModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Bell size={14} className="text-amber-400" />
              <span>Send Notification</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-900/40"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Bulk Send Email Modal Dialog */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slideIn">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Bulk Email Dispatch ({selectedUserIds.length} Recipients)
                </h3>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer p-1 rounded-full hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendBulkEmail}>
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-650 uppercase">Select Email Template</label>
                  <select
                    value={emailForm.template}
                    onChange={(e) => handleEmailTemplateChange(e.target.value)}
                    className="border border-slate-200 rounded px-3 py-2 text-xs bg-slate-50 text-slate-800 font-bold focus:outline-none focus:border-primary"
                  >
                    <option value="welcome">Welcome & Account Clearance</option>
                    <option value="kyc">KYC Verification Clearance Request</option>
                    <option value="security">Vault Security Alert Notice</option>
                    <option value="statement">Monthly Account Audit & Statement</option>
                    <option value="custom">Custom Email Template</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-650 uppercase">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-650 uppercase">Email Body / Content</label>
                  <textarea
                    rows={6}
                    required
                    value={emailForm.content}
                    onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                    className="border border-slate-200 rounded p-3 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono leading-relaxed"
                  />
                </div>

              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingBulkEmail}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2 rounded shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>{sendingBulkEmail ? 'Dispatching Email...' : 'Send Bulk Email'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Bulk Send Notification Modal Dialog */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slideIn">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-amber-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Bulk In-App Notification ({selectedUserIds.length} Recipients)
                </h3>
              </div>
              <button
                onClick={() => setIsNotifModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer p-1 rounded-full hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendBulkNotif}>
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-650 uppercase">Select Notification Template</label>
                  <select
                    value={notifForm.template}
                    onChange={(e) => handleNotifTemplateChange(e.target.value)}
                    className="border border-slate-200 rounded px-3 py-2 text-xs bg-slate-50 text-slate-800 font-bold focus:outline-none focus:border-primary"
                  >
                    <option value="security">Account Security Clearance Notice</option>
                    <option value="kyc">KYC Document Audit Reminder</option>
                    <option value="maintenance">System Maintenance Announcement</option>
                    <option value="custom">Custom In-App Notification</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-650 uppercase">Notification Title</label>
                  <input
                    type="text"
                    required
                    value={notifForm.title}
                    onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    className="border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-650 uppercase">Notification Message</label>
                  <textarea
                    rows={4}
                    required
                    value={notifForm.message}
                    onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                    className="border border-slate-200 rounded p-3 text-xs text-slate-800 focus:outline-none focus:border-primary font-sans leading-relaxed"
                  />
                </div>

              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNotifModalOpen(false)}
                  className="px-4 py-2 rounded border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingBulkNotif}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2 rounded shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Bell size={14} />
                  <span>{sendingBulkNotif ? 'Broadcasting...' : 'Send Notification'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

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
                      <label className="text-[10px] font-bold text-slate-555 uppercase">Client Full Name</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-555 uppercase">Registered Email</label>
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
                      <label className="text-[10px] font-bold text-slate-555 uppercase">IBAN Specifications</label>
                      <input
                        type="text"
                        value={editForm.iban}
                        onChange={(e) => setEditForm({ ...editForm, iban: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-555 uppercase">SWIFT Code BIC</label>
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
                      <label className="text-[10px] font-bold text-slate-555 uppercase">Routing / Transit Code</label>
                      <input
                        type="text"
                        value={editForm.routine}
                        onChange={(e) => setEditForm({ ...editForm, routine: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-555 uppercase">Transaction Auth (TAC)</label>
                      <input
                        type="text"
                        value={editForm.tacCode}
                        onChange={(e) => setEditForm({ ...editForm, tacCode: e.target.value })}
                        placeholder="e.g. 10293"
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-555 uppercase">IMF Clearance Code</label>
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
                      <label className="text-[10px] font-bold text-slate-555 uppercase">Security Vault PIN</label>
                      <input
                        type="text"
                        value={editForm.pin}
                        onChange={(e) => setEditForm({ ...editForm, pin: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-555 uppercase">Country</label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-555 uppercase">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-555 uppercase">Address</label>
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
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-lg shadow self-end cursor-pointer disabled:bg-slate-200 transition-colors mt-2"
                  >
                    {submitting ? 'Saving changes...' : 'Save Profile Credentials'}
                  </button>
                </form>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
