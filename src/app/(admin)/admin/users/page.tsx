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
  UserCheck,
  FileText,
  AlertTriangle,
  Key
} from 'lucide-react';
import { useUsersStore } from '@/store/usersStore';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/util/api';
import AdminTacModal from '@/components/modals/AdminTacModal';
import BulkEmailModal from '@/components/modals/BulkEmailModal';
import BulkNotifModal from '@/components/modals/BulkNotifModal';
import InjectTxModal from '@/components/modals/InjectTxModal';
import SuspensionConfirmModal from '@/components/modals/SuspensionConfirmModal';
import DeleteUserModal from '@/components/modals/DeleteUserModal';
import UserDetailModal from '@/components/modals/UserDetailModal';

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

  // Suspension Toggle Confirmation Modal state
  const [suspensionTargetUser, setSuspensionTargetUser] = useState<any>(null);
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [togglingSuspension, setTogglingSuspension] = useState(false);

  // Custom Warning Delete Confirmation Modal state
  const [deleteTargetUser, setDeleteTargetUser] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  // Bulk Email Modal & DB Templates state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [dbEmailTemplates, setDbEmailTemplates] = useState<any[]>([]);
  const [loadingDbEmails, setLoadingDbEmails] = useState(false);
  const [selectedEmailTplId, setSelectedEmailTplId] = useState<string>('');
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
  });

  // Bulk Notification Modal & DB Templates state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [dbNotifTemplates, setDbNotifTemplates] = useState<any[]>([]);
  const [loadingDbNotifs, setLoadingDbNotifs] = useState(false);
  const [selectedNotifTplId, setSelectedNotifTplId] = useState<string>('');
  const [sendingBulkNotif, setSendingBulkNotif] = useState(false);
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
  });

  // Admin TAC Code Modal state
  const [isTacModalOpen, setIsTacModalOpen] = useState(false);
  const [tacTargetUser, setTacTargetUser] = useState<any>(null);
  const [adminTacCode, setAdminTacCode] = useState('');
  const [savingTacCode, setSavingTacCode] = useState(false);

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
    state: '',
    city: '',
    address: '',
    zipCode: '',
    gender: 'Male',
    occupation: '',
    dob: '',
    idType: 'Passport',
    pin: '',
    swiftCode: '',
    routine: '',
    iban: '',
    tacCode: '',
    imf: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittingBalance, setSubmittingBalance] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Open Email Modal & Fetch Email Templates from DB
  const handleOpenEmailModal = async () => {
    setIsEmailModalOpen(true);
    setLoadingDbEmails(true);
    try {
      const data = await api.get('/admin/emails');
      const templatesList = data.templates || data || [];
      
      // Built-in fallbacks if DB returns empty
      const defaultTemplates = [
        {
          _id: 'default-welcome',
          name: 'Welcome & Account Clearance',
          title: 'Welcome to Access National Bank - Account Clearance',
          content: 'Dear Valued Client,\n\nYour online banking vault has been fully initialized and activated. You can now access multi-currency transfers and real-time ledger services.\n\nBest Regards,\nAccess National Bank Administration',
        },
        {
          _id: 'default-kyc',
          name: 'KYC Document Audit Notice',
          title: 'Identity Verification Clearance Required',
          content: 'Dear Client,\n\nTo ensure uninterrupted international transfers, please upload your identity clearance documentation under your dashboard KYC settings.\n\nAccess National Audit Desk',
        },
        {
          _id: 'default-security',
          name: 'Security Clearance Notice',
          title: 'Security Alert - Vault Auth Clearance',
          content: 'Dear Client,\n\nWe detected a routine security audit check on your vault. Please review your active authorizations and contact support if you notice unfamiliar activity.\n\nSecurity Audit Bureau',
        },
      ];

      const finalList = templatesList.length > 0 ? templatesList : defaultTemplates;
      setDbEmailTemplates(finalList);

      if (finalList.length > 0) {
        setSelectedEmailTplId(finalList[0]._id);
        setEmailForm({
          subject: finalList[0].title || finalList[0].name,
          content: finalList[0].content,
        });
      }
    } catch (e) {
      console.error('Error fetching email templates:', e);
    } finally {
      setLoadingDbEmails(false);
    }
  };

  // Open Notification Modal & Fetch Notification Templates from DB
  const handleOpenNotifModal = async () => {
    setIsNotifModalOpen(true);
    setLoadingDbNotifs(true);
    try {
      const data = await api.get('/admin/notification-templates');
      const templatesList = data.templates || data || [];
      
      const defaultNotifTemplates = [
        {
          _id: 'default-sec-notif',
          name: 'Security Alert',
          title: 'Account Security Clearance Notice',
          content: 'Important security update: Please verify your contact details and review active ledger authorizations.',
        },
        {
          _id: 'default-kyc-notif',
          name: 'KYC Audit Reminder',
          title: 'KYC Document Audit Reminder',
          content: 'Your identity verification documents are pending review. Upload valid clearance files to clear wire transfers.',
        },
        {
          _id: 'default-maint-notif',
          name: 'System Maintenance',
          title: 'System Maintenance Announcement',
          content: 'Scheduled system ledger upgrades will take place this weekend. Banking vaults remain fully secure.',
        },
      ];

      const finalList = templatesList.length > 0 ? templatesList : defaultNotifTemplates;
      setDbNotifTemplates(finalList);

      if (finalList.length > 0) {
        setSelectedNotifTplId(finalList[0]._id);
        setNotifForm({
          title: finalList[0].title || finalList[0].name,
          message: finalList[0].content,
        });
      }
    } catch (e) {
      console.error('Error fetching notification templates:', e);
    } finally {
      setLoadingDbNotifs(false);
    }
  };

  const handleSelectEmailTemplate = (tpl: any) => {
    setSelectedEmailTplId(tpl._id);
    setEmailForm({
      subject: tpl.title || tpl.name,
      content: tpl.content || '',
    });
  };

  const handleSelectNotifTemplate = (tpl: any) => {
    setSelectedNotifTplId(tpl._id);
    setNotifForm({
      title: tpl.title || tpl.name,
      message: tpl.content || '',
    });
  };

  const handleStartEdit = async (user: any) => {
    setSelectedUser(user);

    let dobStr = '';
    if (user.dob) {
      try {
        const dateObj = new Date(user.dob);
        if (!isNaN(dateObj.getTime())) {
          dobStr = dateObj.toISOString().split('T')[0];
        }
      } catch (e) {}
    }

    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      country: user.country || '',
      state: user.state || '',
      city: user.city || '',
      address: user.address || '',
      zipCode: user.zipCode || '',
      gender: user.gender || 'Male',
      occupation: user.occupation || '',
      dob: dobStr,
      idType: user.idType || 'Passport',
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

  const handlePromptToggleSuspension = (user: any) => {
    setSuspensionTargetUser(user);
    setIsSuspensionModalOpen(true);
  };

  const handleConfirmToggleSuspension = async () => {
    if (!suspensionTargetUser) return;
    setTogglingSuspension(true);
    const targetStatus = !suspensionTargetUser.suspended;

    try {
      const data = await api.put(`/admin/users/${suspensionTargetUser._id}`, { suspended: targetStatus });
      showToast(targetStatus ? `User @${suspensionTargetUser.username} has been suspended.` : `User @${suspensionTargetUser.username} has been activated.`, 'success');
      if (selectedUser && selectedUser._id === suspensionTargetUser._id) {
        setSelectedUser(data.user);
      }
      setIsSuspensionModalOpen(false);
      setSuspensionTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Error updating user status.', 'error');
    } finally {
      setTogglingSuspension(false);
    }
  };

  const handleToggleSuspension = async (suspendedValue: boolean) => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const data = await api.put(`/admin/users/${selectedUser._id}`, { suspended: suspendedValue });
      showToast(suspendedValue ? 'User account has been suspended.' : 'User account has been activated.', 'success');
      setSelectedUser(data.user);
      fetchUsers();
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error occurred.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyKyc = async (verifyValue: boolean) => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const data = await api.put(`/admin/users/${selectedUser._id}`, { isVerified: verifyValue, onReview: false });
      showToast(verifyValue ? 'KYC cleared and user verified.' : 'KYC audit reset.', 'success');
      setSelectedUser(data.user);
      fetchUsers();
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error occurred.', 'error');
    } finally {
      setActionLoading(false);
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

  const handleDeleteUser = (user: any) => {
    setDeleteTargetUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setDeletingUser(true);
    try {
      await api.delete(`/admin/users/${deleteTargetUser._id}`);
      showToast(`User @${deleteTargetUser.username} and all associated records deleted successfully.`, 'success');
      setIsDeleteModalOpen(false);
      setDeleteTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Error deleting user.', 'error');
    } finally {
      setDeletingUser(false);
    }
  };

  // Bulk Deletion
  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    setDeletingUser(true);
    try {
      await Promise.all(selectedUserIds.map((id) => api.delete(`/admin/users/${id}`)));
      showToast(`${selectedUserIds.length} users and all associated records deleted successfully.`, 'success');
      setSelectedUserIds([]);
      setIsBulkDeleteModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast('Error performing bulk deletion.', 'error');
    } finally {
      setDeletingUser(false);
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
          title: `[EMAIL DISPATCH] ${emailForm.subject}`,
          message: emailForm.content,
          target: u.username,
        }).catch(() => {});
      }

      showToast(`Email template dispatched to ${targetUsers.length} selected users.`, 'success');
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

      showToast(`Notification template broadcasted to ${targetUsers.length} selected users.`, 'success');
      setIsNotifModalOpen(false);
      setSelectedUserIds([]);
    } catch (err: any) {
      showToast('Error broadcasting bulk notifications.', 'error');
    } finally {
      setSendingBulkNotif(false);
    }
  };

  // Open TAC Code Modal for Single User
  const handleOpenTacModalForUser = (user: any) => {
    setTacTargetUser(user);
    setAdminTacCode(user.tacCode || '');
    setIsTacModalOpen(true);
  };

  // Open TAC Code Modal for Bulk Selected Users
  const handleOpenTacModalBulk = () => {
    const targetUsers = users.filter((u) => selectedUserIds.includes(u._id));
    if (targetUsers.length > 0) {
      setTacTargetUser(targetUsers[0]);
      setAdminTacCode(targetUsers[0].tacCode || '');
    }
    setIsTacModalOpen(true);
  };

  // Save TAC Code & Dispatch Approval Notification
  const handleSaveTacCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTacCode.trim()) {
      showToast('Please enter a valid TAC clearance code.', 'error');
      return;
    }

    setSavingTacCode(true);
    try {
      const targetUsers = tacTargetUser && !selectedUserIds.includes(tacTargetUser._id)
        ? [tacTargetUser]
        : users.filter((u) => selectedUserIds.includes(u._id));

      const userList = targetUsers.length > 0 ? targetUsers : (tacTargetUser ? [tacTargetUser] : []);

      for (const u of userList) {
        await api.put(`/admin/users/${u._id}`, { tacCode: adminTacCode.trim() });
      }

      showToast(`TAC Code ${adminTacCode.trim()} set and approval notification dispatched to ${userList.length} client(s).`, 'success');
      setIsTacModalOpen(false);
      setAdminTacCode('');
      setTacTargetUser(null);
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Error saving TAC code.', 'error');
    } finally {
      setSavingTacCode(false);
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
                          <span 
                            onClick={() => handlePromptToggleSuspension(user)}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase cursor-pointer hover:opacity-80 transition-all ${
                              user.suspended ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}
                            title={user.suspended ? 'Click to remove suspension' : 'Click to suspend user'}
                          >
                            {user.suspended ? 'Suspended' : 'Active'}
                          </span>
                          <span 
                            onClick={() => handleStartEdit(user)}
                            className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase cursor-pointer hover:scale-105 transition-all shadow-2xs ${
                              user.isVerified 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-300 animate-pulse'
                            }`}
                            title="Click to view profile & review KYC"
                          >
                            {user.isVerified ? 'KYC Verified' : 'KYC Pending'}
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
                            onClick={() => handleOpenTacModalForUser(user)}
                            className="p-2 text-slate-450 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            title="Set / Approve TAC Code"
                          >
                            <Key size={15} />
                          </button>
                          <button
                            onClick={() => handleStartEdit(user)}
                            className="p-2 text-slate-450 hover:text-primary hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Edit / Audit Account"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
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

      {/* Floating Bulk Options Bar (Icons Only as Requested) */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-6 animate-slideUp">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
              {selectedUserIds.length}
            </span>
            <span className="font-bold hidden sm:inline">Selected</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenEmailModal}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-red-400 hover:text-white rounded-xl transition-all cursor-pointer shadow flex items-center justify-center"
              title="Send Email to Selected Users"
            >
              <Mail size={18} />
            </button>

            <button
              onClick={handleOpenNotifModal}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-white rounded-xl transition-all cursor-pointer shadow flex items-center justify-center"
              title="Send Notification to Selected Users"
            >
              <Bell size={18} />
            </button>

            <button
              onClick={handleOpenTacModalBulk}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-white rounded-xl transition-all cursor-pointer shadow flex items-center justify-center"
              title="Set/Approve TAC Code for Selected User(s)"
            >
              <Key size={18} />
            </button>

            <button
              onClick={handleBulkDelete}
              className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-red-900/40 flex items-center justify-center"
              title="Delete Selected Users"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Send Email Modal Dialog */}
      <BulkEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleSendBulkEmail}
        selectedUserCount={selectedUserIds.length}
        loadingDbEmails={loadingDbEmails}
        dbEmailTemplates={dbEmailTemplates}
        selectedEmailTplId={selectedEmailTplId}
        onSelectTemplate={handleSelectEmailTemplate}
        emailForm={emailForm}
        setEmailForm={setEmailForm}
        sendingBulkEmail={sendingBulkEmail}
      />

      {/* Bulk Send Notification Modal Dialog */}
      <BulkNotifModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onSubmit={handleSendBulkNotif}
        selectedUserCount={selectedUserIds.length}
        loadingDbNotifs={loadingDbNotifs}
        dbNotifTemplates={dbNotifTemplates}
        selectedNotifTplId={selectedNotifTplId}
        onSelectTemplate={handleSelectNotifTemplate}
        notifForm={notifForm}
        setNotifForm={setNotifForm}
        sendingBulkNotif={sendingBulkNotif}
      />

      {/* Manual Custom Transaction Injection Modal */}
      <InjectTxModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleCreateTransaction}
        selectedTxUser={selectedTxUser}
        txForm={txForm}
        setTxForm={setTxForm}
        submittingTx={submittingTx}
      />

      {/* Edit / Audit User Details & Balances Modal */}
      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedUser={selectedUser}
        editForm={editForm}
        setEditForm={setEditForm}
        selectedUserAccounts={selectedUserAccounts}
        accountBalances={accountBalances}
        setAccountBalances={setAccountBalances}
        onSaveDetails={handleUpdateUserDetails}
        onSaveBalances={handleUpdateBalances}
        onToggleSuspensionFromModal={handleToggleSuspension}
        onToggleKycFromModal={handleVerifyKyc}
        actionLoading={actionLoading}
      />

      {/* Suspension Confirmation Modal */}
      <SuspensionConfirmModal
        isOpen={isSuspensionModalOpen}
        onClose={() => setIsSuspensionModalOpen(false)}
        onConfirm={handleConfirmToggleSuspension}
        targetUser={suspensionTargetUser}
        togglingSuspension={togglingSuspension}
      />

      {/* Single & Bulk User Delete Warning Modal */}
      <DeleteUserModal
        isSingleOpen={isDeleteModalOpen}
        isBulkOpen={isBulkDeleteModalOpen}
        onCloseSingle={() => setIsDeleteModalOpen(false)}
        onCloseBulk={() => setIsBulkDeleteModalOpen(false)}
        onConfirmSingle={confirmDeleteUser}
        onConfirmBulk={confirmBulkDelete}
        deleteTargetUser={deleteTargetUser}
        selectedUserCount={selectedUserIds.length}
        deletingUser={deletingUser}
      />

      {/* Admin Set / Approve TAC Code Modal */}
      <AdminTacModal
        isOpen={isTacModalOpen}
        onClose={() => setIsTacModalOpen(false)}
        onSubmit={handleSaveTacCode}
        adminTacCode={adminTacCode}
        setAdminTacCode={setAdminTacCode}
        savingTacCode={savingTacCode}
        targetUser={tacTargetUser}
        selectedUserCount={selectedUserIds.length}
      />

    </div>
  );
}
