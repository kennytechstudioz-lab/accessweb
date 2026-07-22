'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Landmark, 
  ArrowRightLeft, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Lock, 
  UserCheck, 
  UserX, 
  X,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToastStore } from '@/store/toastStore';

export default function Transfer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToastStore();

  const urlType = searchParams.get('type') || 'internal';

  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transferType, setTransferType] = useState<'internal' | 'local' | 'wire'>(urlType as any);
  
  // Form fields
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverBank, setReceiverBank] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [routineNumber, setRoutineNumber] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  
  // Account Lookup State
  const [lookingUp, setLookingUp] = useState(false);
  const [foundBeneficiary, setFoundBeneficiary] = useState<{ fullName: string; username: string; accountNumber: string } | null>(null);
  const [accountError, setAccountError] = useState('');

  // Transfer execution & modal state
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // PIN Modals
  const [showPinModal, setShowPinModal] = useState(false);
  const [showCreatePinModal, setShowCreatePinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const fetchTransferData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const profileRes = await fetch(`${apiUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      setProfile(profileData);

      const accountsRes = await fetch(`${apiUrl}/user/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const accountsData = await accountsRes.json();
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setCurrency(accountsData[0].currency);
      }
    } catch (e) {
      console.error('Error fetching transfer data:', e);
    }
  };

  useEffect(() => {
    fetchTransferData();
  }, []);

  // Update transferType when URL query param changes
  useEffect(() => {
    if (urlType === 'internal' || urlType === 'local' || urlType === 'international' || urlType === 'wire') {
      setTransferType(urlType === 'international' ? 'wire' : (urlType as any));
    }
  }, [urlType]);

  // Real-time Account Lookup Effect
  useEffect(() => {
    if (transferType !== 'internal') return;
    
    const trimmed = receiverAccountNumber.trim();
    if (trimmed.length < 4) {
      setFoundBeneficiary(null);
      setAccountError('');
      return;
    }

    const timer = setTimeout(async () => {
      setLookingUp(true);
      setAccountError('');
      setFoundBeneficiary(null);

      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

        const res = await fetch(`${apiUrl}/user/lookup-account?accountNumber=${encodeURIComponent(trimmed)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.found) {
          setFoundBeneficiary({
            fullName: data.fullName,
            username: data.username,
            accountNumber: data.accountNumber,
          });
          setReceiverName(data.fullName);
        } else {
          setAccountError(data.message || 'Account not found in Access National Bank ledger.');
        }
      } catch (err) {
        setAccountError('Account not found in Access National Bank ledger.');
      } finally {
        setLookingUp(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [receiverAccountNumber, transferType]);

  // Handle Proceed Button Click
  const handleProceedClick = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid transfer amount.', 'error');
      return;
    }

    const selectedAccount = accounts.find((a) => a.currency === currency);
    if (!selectedAccount || selectedAccount.balance < parsedAmount) {
      showToast('Insufficient funds in the selected wallet.', 'error');
      return;
    }

    if (transferType === 'internal') {
      if (!foundBeneficiary) {
        showToast('Please enter a valid recipient account number.', 'error');
        return;
      }
    }

    // Check if user has PIN set
    if (profile?.pin && profile.pin > 0) {
      setEnteredPin('');
      setShowPinModal(true);
    } else {
      setNewPin('');
      setConfirmNewPin('');
      setShowCreatePinModal(true);
    }
  };

  // Create PIN and proceed with transfer
  const handleCreatePinAndTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      showToast('Transaction PIN must be at least 4 digits.', 'error');
      return;
    }
    if (newPin !== confirmNewPin) {
      showToast('PIN confirmation does not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const res = await fetch(`${apiUrl}/user/set-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin: newPin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create PIN');

      setShowCreatePinModal(false);
      // Execute transfer with created PIN
      executeTransfer(newPin);
    } catch (err: any) {
      showToast(err.message || 'Error creating PIN', 'error');
      setLoading(false);
    }
  };

  // Authorize Transfer with PIN
  const handleAuthorizeWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPin) {
      showToast('Please enter your 4-digit Transaction PIN.', 'error');
      return;
    }
    setShowPinModal(false);
    executeTransfer(enteredPin);
  };

  // Execute Transfer API Call
  const executeTransfer = async (pinValue: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const response = await fetch(`${apiUrl}/user/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: transferType,
          amount,
          currency,
          receiverAccountNumber,
          receiverName: transferType === 'internal' ? (foundBeneficiary?.fullName || receiverName) : receiverName,
          receiverBank: transferType === 'internal' ? 'Access National Bank' : receiverBank,
          swiftCode,
          routineNumber,
          receiverAddress,
          pin: pinValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Transfer transaction failed');
      }

      // Success
      setSuccessMsg(data.message || 'Transfer completed successfully.');
      showToast('Transfer completed successfully!', 'success');

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e53e3e', '#121824', '#ffffff'],
      });

      // Reset form
      setAmount('');
      setReceiverAccountNumber('');
      setReceiverName('');
      setFoundBeneficiary(null);
      setReceiverBank('');
      setSwiftCode('');
      setRoutineNumber('');
      setReceiverAddress('');

      // Re-fetch profile and balances
      fetchTransferData();
    } catch (err: any) {
      showToast(err.message || 'An error occurred during transfer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 relative font-sans">
      
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
          {transferType === 'internal' 
            ? 'Internal Account Wire Dispatch' 
            : transferType === 'local' 
            ? 'Local Bank Transfer Dispatch' 
            : 'International Wire Dispatch'}
        </h2>
        <p className="text-slate-500 text-xs font-light">
          {transferType === 'internal' 
            ? 'Transfer funds instantly to another Access National Bank account holder.' 
            : transferType === 'local' 
            ? 'Transfer funds securely to other local financial institutions.' 
            : 'Transfer funds across international bank networks with SWIFT / IBAN clearance.'}
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl text-xs sm:text-sm flex gap-3 items-start shadow-sm">
          <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Transaction Dispatched Successfully!</h4>
            <p className="text-xs text-emerald-700 font-light mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Form */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">

          <form onSubmit={handleProceedClick} className="flex flex-col gap-6">
            
            {/* 1. Account Selector & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Select Source Account */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Select Source Account Wallet</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50 font-bold text-slate-800 cursor-pointer"
                >
                  {accounts.map((a) => (
                    <option key={a._id} value={a.currency}>
                      {a.currency} Wallet - Available: {a.symbol}{a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Transfer Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {/* 2. Recipient Account Number & Account Lookup */}
            <div className="border-t border-slate-100 pt-5 flex flex-col gap-5">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                Beneficiary Clearance
              </h3>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">
                    {transferType === 'internal' ? 'Destination Account Number' : 'Recipient Account Number / IBAN'}
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverAccountNumber}
                    onChange={(e) => setReceiverAccountNumber(e.target.value)}
                    placeholder="Enter recipient account number (e.g. 104829012)"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50 font-mono font-bold text-slate-900"
                  />
                </div>

                {/* Account Lookup Live Feedback for Internal Transfer */}
                {transferType === 'internal' && (
                  <div>
                    {lookingUp && (
                      <div className="bg-slate-50 border border-slate-200 text-slate-500 p-3 rounded-lg text-xs flex items-center gap-2 animate-pulse">
                        <Landmark size={14} className="animate-spin text-primary" />
                        <span>Auditing account ledger for beneficiary...</span>
                      </div>
                    )}

                    {foundBeneficiary && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-2 font-bold">
                          <UserCheck size={16} className="text-emerald-600" />
                          <span>Beneficiary Verified: {foundBeneficiary.fullName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 uppercase bg-emerald-100 px-2 py-0.5 rounded font-extrabold">
                          @{foundBeneficiary.username}
                        </span>
                      </div>
                    )}

                    {accountError && (
                      <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center gap-2 shadow-xs">
                        <UserX size={16} className="text-red-600 flex-shrink-0" />
                        <span>{accountError}</span>
                      </div>
                    )}
                  </div>
                )}

                {transferType !== 'internal' && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Beneficiary Full Name</label>
                    <input
                      type="text"
                      required
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Beneficiary Full Name"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50 font-semibold"
                    />
                  </div>
                )}
              </div>

              {transferType !== 'internal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Recipient Bank Name</label>
                    <input
                      type="text"
                      required
                      value={receiverBank}
                      onChange={(e) => setReceiverBank(e.target.value)}
                      placeholder="e.g. Chase Bank"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">SWIFT / BIC Code</label>
                    <input
                      type="text"
                      required
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="BOFAUS3NXXX"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              )}

              {transferType === 'wire' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Routing Number / Sort Code</label>
                    <input
                      type="text"
                      required
                      value={routineNumber}
                      onChange={(e) => setRoutineNumber(e.target.value)}
                      placeholder="9-digit routing"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Recipient Address</label>
                    <input
                      type="text"
                      required
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      placeholder="Beneficiary Street Address"
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Proceed Button */}
            <button
              type="submit"
              disabled={loading || (transferType === 'internal' && !foundBeneficiary)}
              className="bg-primary hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:bg-slate-300 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              <span>{loading ? 'Processing Transfer...' : 'Proceed with Transfer'}</span>
              <ArrowRightLeft size={16} />
            </button>

          </form>

        </div>

        {/* Informative Side Cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col gap-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Internal Clearance Protocol</h4>
            <ul className="text-xs font-light text-slate-300 flex flex-col gap-3 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><b>Instant Settlement:</b> Internal transfers between Access National Bank client accounts execute immediately.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><b>PIN Verification:</b> Authorize transactions securely with your 4-digit Transaction PIN.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><b>Beneficiary Verification:</b> Account numbers are checked live against bank ledger records to ensure funds reach the correct recipient.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-start">
            <HelpCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Security PIN Help</h4>
              <p className="text-xs font-light text-slate-500 leading-relaxed">
                Need to change or manage your 4-digit Transaction PIN? You can manage your PIN, change passwords, and toggle 2FA in the <b>Settings</b> section.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Enter PIN Pop-up Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full flex flex-col gap-6 relative">
            <button 
              onClick={() => setShowPinModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-red-50 text-primary rounded-full">
                <Lock size={28} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Authorize Transaction</h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Enter your 4-digit Transaction PIN to complete sending <span className="font-bold text-slate-900">${amount}</span> to <span className="font-bold text-slate-900">{foundBeneficiary?.fullName || receiverName}</span>.
              </p>
            </div>

            <form onSubmit={handleAuthorizeWithPin} className="flex flex-col gap-4">
              <input
                type="password"
                required
                autoFocus
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                className="w-full border border-slate-200 rounded-xl py-3.5 px-4 text-center font-mono font-bold text-lg tracking-widest focus:outline-none focus:border-primary bg-slate-50"
              />

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !enteredPin}
                  className="flex-1 py-3 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer disabled:bg-slate-300"
                >
                  {loading ? 'Authorizing...' : 'Authorize & Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Create PIN Pop-up Modal (If User has no PIN set yet) */}
      {showCreatePinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full flex flex-col gap-6 relative">
            <button 
              onClick={() => setShowCreatePinModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Create Transaction PIN</h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                You have not created a Transaction PIN yet. Please create a 4-digit PIN to authorize this transfer and protect your account.
              </p>
            </div>

            <form onSubmit={handleCreatePinAndTransfer} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Create 4-Digit PIN</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 text-center font-mono font-bold text-sm tracking-widest focus:outline-none focus:border-primary bg-slate-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Confirm 4-Digit PIN</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value)}
                  placeholder="Re-enter 4-digit PIN"
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 text-center font-mono font-bold text-sm tracking-widest focus:outline-none focus:border-primary bg-slate-50"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePinModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer disabled:bg-slate-300"
                >
                  {loading ? 'Creating PIN...' : 'Save PIN & Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
