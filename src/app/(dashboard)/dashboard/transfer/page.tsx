'use client';

import React, { useEffect, useState } from 'react';
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
  CreditCard,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToastStore } from '@/store/toastStore';
import PinVerificationModal from '@/components/modals/PinVerificationModal';
import CreatePinModal from '@/components/modals/CreatePinModal';
import TacVerificationModal from '@/components/modals/TacVerificationModal';

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

  // TAC Code Modal State
  const [showTacModal, setShowTacModal] = useState(false);
  const [tacCode, setTacCode] = useState('');
  const [requestingTac, setRequestingTac] = useState(false);

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
      if (transferType === 'local' || transferType === 'wire') {
        setTacCode('');
        setShowTacModal(true);
      } else {
        setEnteredPin('');
        setShowPinModal(true);
      }
    } else {
      setNewPin('');
      setConfirmNewPin('');
      setShowCreatePinModal(true);
    }
  };

  // Create PIN and proceed with transfer
  const handleCreatePinAndTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6) {
      showToast('Transaction PIN must be exactly 6 digits.', 'error');
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
      setLoading(false);

      if (transferType === 'local' || transferType === 'wire') {
        setTacCode('');
        setShowTacModal(true);
      } else {
        executeTransfer(newPin);
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating PIN', 'error');
      setLoading(false);
    }
  };

  // Step 1 for Local/Wire: Authorize Transfer with TAC Code -> Then Open PIN Modal
  const handleAuthorizeWithTac = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tacCode.trim()) {
      showToast('Please enter your 5-digit Transaction Authorization Code (TAC).', 'error');
      return;
    }
    setShowTacModal(false);
    setEnteredPin('');
    setShowPinModal(true);
  };

  // Step 2: Authorize Transfer with 6-Digit PIN -> Process Transaction
  const handleAuthorizeWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPin || enteredPin.length !== 6) {
      showToast('Please enter your valid 6-digit Transaction PIN.', 'error');
      return;
    }
    setShowPinModal(false);
    executeTransfer(enteredPin, tacCode.trim());
  };

  // Request TAC Code
  const handleRequestTacCode = async () => {
    setRequestingTac(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const res = await fetch(`${apiUrl}/user/request-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'TAC' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request TAC code');

      showToast(data.message || 'TAC clearance code request submitted! Email sent.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error requesting TAC code', 'error');
    } finally {
      setRequestingTac(false);
    }
  };

  // Execute Transfer API Call
  const executeTransfer = async (pinValue: string, tacValue?: string) => {
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
          swiftCode: transferType === 'wire' ? swiftCode : '',
          routineNumber,
          receiverAddress,
          pin: pinValue,
          tacCode: tacValue,
          codeType: tacValue ? 'TAC' : undefined,
          codeValue: tacValue,
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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Reset form
      setAmount('');
      setReceiverAccountNumber('');
      setReceiverName('');
      setReceiverBank('');
      setSwiftCode('');
      setRoutineNumber('');
      setReceiverAddress('');
      setFoundBeneficiary(null);
      fetchTransferData();
    } catch (err: any) {
      showToast(err.message || 'Transfer process error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activeAccount = accounts.find((a) => a.currency === currency);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Wire & Internal Transfer Portal</h1>
        <p className="text-slate-500 text-xs font-light">Send funds securely across internal ledger, domestic clearing, or SWIFT network.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl max-w-md text-xs font-bold">
        <button
          onClick={() => { setTransferType('internal'); router.push('/dashboard/transfer?type=internal'); }}
          className={`flex-1 py-2 rounded-lg transition-all ${transferType === 'internal' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Internal Transfer
        </button>
        <button
          onClick={() => { setTransferType('local'); router.push('/dashboard/transfer?type=local'); }}
          className={`flex-1 py-2 rounded-lg transition-all ${transferType === 'local' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Local Transfer
        </button>
        <button
          onClick={() => { setTransferType('wire'); router.push('/dashboard/transfer?type=international'); }}
          className={`flex-1 py-2 rounded-lg transition-all ${transferType === 'wire' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          International Wire
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm uppercase">Transaction Dispatched Successfully</span>
              <span className="text-xs text-emerald-700 font-light">{successMsg}</span>
            </div>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800 text-xs font-bold uppercase">Dismiss</button>
        </div>
      )}

      {/* Main Form & Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Area (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
          <form onSubmit={handleProceedClick} className="flex flex-col gap-6">
            
            {/* 1. Account & Amount */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-3">
                <Landmark size={18} className="text-primary" />
                Source Wallet & Amount
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Select Currency Account</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50 font-bold text-slate-800"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.currency} value={acc.currency}>
                        {acc.currency} Wallet ({acc.symbol}{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">
                    Transfer Amount ({activeAccount?.symbol || '$'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50 font-mono font-bold text-slate-900"
                  />
                </div>
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
              </div>

              {/* Local Transfer Layout: Beneficiary Full Name & Recipient Bank Name side by side */}
              {transferType === 'local' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                  <div className="flex flex-col gap-1.5">
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
                </div>
              )}

              {/* International Wire Transfer Layout */}
              {transferType === 'wire' && (
                <div className="flex flex-col gap-5 mt-2">
                  <div className="flex flex-col gap-1.5">
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
                        placeholder="Street Address, City, Country"
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 mt-2"
            >
              <ArrowRightLeft size={16} />
              <span>{loading ? 'Processing Transfer...' : `Authorize ${transferType.toUpperCase()} Transfer`}</span>
            </button>
          </form>
        </div>

        {/* Right Help Sidebar (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <ShieldCheck size={18} />
              <span>Transfer Security Protocols</span>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              All transactions require transaction PIN authorization and encrypted clearance protocol verification.
            </p>
            <ul className="text-xs text-slate-300 flex flex-col gap-2.5">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><b>Internal Transfers:</b> Instant ledger settlement with 0% processing fee.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><b>PIN Verification:</b> Authorize transactions securely with your 6-digit Transaction PIN.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><b>TAC Clearance:</b> Transaction Authorization Code (TAC) required for local & wire transfers.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <HelpCircle size={24} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Security PIN Help</h4>
              <p className="text-xs font-light text-slate-500 leading-relaxed">
                Need to change or manage your 6-digit Transaction PIN? You can manage your PIN, change passwords, and toggle 2FA in the <b>Settings</b> section.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. PIN Authorization Modal */}
      <PinVerificationModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSubmit={handleAuthorizeWithPin}
        enteredPin={enteredPin}
        setEnteredPin={setEnteredPin}
        amount={amount}
        recipientName={foundBeneficiary?.fullName || receiverName}
        loading={loading}
      />

      {/* 4. Create PIN Pop-up Modal */}
      <CreatePinModal
        isOpen={showCreatePinModal}
        onClose={() => setShowCreatePinModal(false)}
        onSubmit={handleCreatePinAndTransfer}
        newPin={newPin}
        setNewPin={setNewPin}
        confirmNewPin={confirmNewPin}
        setConfirmNewPin={setConfirmNewPin}
        loading={loading}
      />

      {/* 5. TAC Code Verification Modal */}
      <TacVerificationModal
        isOpen={showTacModal}
        onClose={() => setShowTacModal(false)}
        onSubmit={handleAuthorizeWithTac}
        tacCode={tacCode}
        setTacCode={setTacCode}
        onRequestTacCode={handleRequestTacCode}
        requestingTac={requestingTac}
        loading={loading}
      />

    </div>
  );
}
