'use client';

import React from 'react';
import { 
  X, 
  Ban, 
  Check, 
  ShieldCheck, 
  User as UserIcon, 
  FileText, 
  Camera, 
  Loader2 
} from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  editForm: any;
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  selectedUserAccounts?: any[];
  accountBalances?: Record<string, number>;
  setAccountBalances?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onSaveDetails?: (e: React.FormEvent) => void;
  onSaveBalances?: (e: React.FormEvent) => void;
  onToggleSuspensionFromModal: (status: boolean) => void;
  onToggleKycFromModal: (status: boolean) => void;
  actionLoading?: boolean;
}

export default function UserDetailModal({
  isOpen,
  onClose,
  selectedUser,
  editForm,
  setEditForm,
  onToggleSuspensionFromModal,
  onToggleKycFromModal,
  actionLoading = false,
}: UserDetailModalProps) {
  if (!isOpen || !selectedUser) return null;

  const getDocSrc = (val?: string) => {
    if (!val || typeof val !== 'string' || val.trim() === '') return '';
    if (val.startsWith('data:') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/')) {
      return val;
    }
    return `data:image/jpeg;base64,${val}`;
  };

  const rawDoc = selectedUser?.passport || selectedUser?.idCard || selectedUser?.idCardFileName || selectedUser?.document || editForm?.passport;
  const docSrc = getDocSrc(rawDoc);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-slideIn flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs sm:text-sm overflow-hidden">
              {selectedUser.profilePicture ? (
                <img src={getDocSrc(selectedUser.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{selectedUser.fullName ? selectedUser.fullName[0] : selectedUser.username[0]}</span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                {selectedUser.fullName || selectedUser.username}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                @{selectedUser.username} | Acc: {selectedUser.accountNumber || 'N/A'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={actionLoading}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg cursor-pointer hover:bg-slate-800 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="px-[10px] py-4 sm:p-6 flex flex-col gap-5 sm:gap-6 overflow-y-auto flex-1">
          
          {/* Status Badges Header */}
          <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                selectedUser.suspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedUser.suspended ? 'Suspended Account' : 'Active Account'}
              </span>

              <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                selectedUser.isVerified 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : selectedUser.onReview 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedUser.isVerified ? 'KYC Verified' : selectedUser.onReview ? 'KYC Pending Review' : 'KYC Pending'}
              </span>
            </div>
          </div>

          {/* KYC Media & Document Inspection Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
            
            {/* Left: Client Profile Picture */}
            <div className="md:col-span-4 flex flex-col items-center justify-center gap-3 text-center border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Camera size={12} className="text-primary" />
                Client Avatar / Photo
              </span>
              
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-slate-800 shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-3xl text-primary">
                {selectedUser.profilePicture ? (
                  <img src={getDocSrc(selectedUser.profilePicture)} alt="Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{selectedUser.fullName ? selectedUser.fullName[0] : selectedUser.username[0]}</span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{selectedUser.fullName || 'No Full Name'}</span>
                <span className="text-[10px] text-slate-400 font-mono">@{selectedUser.username}</span>
              </div>
            </div>

            {/* Right: Uploaded ID Clearance Document */}
            <div className="md:col-span-8 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" />
                  Uploaded ID Clearance Document ({selectedUser.idType || 'Passport'})
                </span>
                <span className="text-[10px] font-mono bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">
                  {selectedUser.idType || 'ID Document'}
                </span>
              </div>

              {docSrc ? (
                <div className="w-full h-48 sm:h-56 overflow-hidden rounded-xl border border-slate-800 bg-black flex items-center justify-center group relative">
                  <img 
                    src={docSrc} 
                    alt="Client Uploaded ID Card" 
                    className="h-full w-auto max-w-full object-contain rounded transition-transform duration-300 group-hover:scale-105" 
                  />
                  <a 
                    href={docSrc} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-700 transition-colors shadow"
                  >
                    View Full Image ↗
                  </a>
                </div>
              ) : (
                <div className="h-44 sm:h-48 rounded-xl border border-dashed border-slate-800 bg-slate-850/50 flex flex-col items-center justify-center text-slate-500 gap-2 p-4 text-center">
                  <FileText size={32} className="text-slate-600 animate-pulse" />
                  <span className="text-xs font-bold text-slate-400">No Identity Document Uploaded Yet</span>
                  <span className="text-[10px] text-slate-500 font-light">Client hasn't attached passport or ID card photo</span>
                </div>
              )}
            </div>

          </div>

          {/* KYC Form: Client Profile & Demographic Registration Details */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <UserIcon size={14} className="text-primary" />
                Client Demographic & Profile Clearance Form
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Profile Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Date of Birth</label>
                <input
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Gender</label>
                <select
                  value={editForm.gender || 'Male'}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800 cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Occupation */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Occupation / Profession</label>
                <input
                  type="text"
                  value={editForm.occupation}
                  onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Country</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* State / Region */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">State / Region</label>
                <input
                  type="text"
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* City */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* Zip Code */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Postal / Zip Code</label>
                <input
                  type="text"
                  value={editForm.zipCode}
                  onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* Residential Address */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Residential Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* Transaction PIN */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Transaction PIN</label>
                <input
                  type="text"
                  value={editForm.pin}
                  onChange={(e) => setEditForm({ ...editForm, pin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* TAC Code */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">TAC Code</label>
                <input
                  type="text"
                  value={editForm.tacCode}
                  onChange={(e) => setEditForm({ ...editForm, tacCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              {/* IMF Code */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">IMF Clearance Code</label>
                <input
                  type="text"
                  value={editForm.imf}
                  onChange={(e) => setEditForm({ ...editForm, imf: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

            </div>
          </div>

        </div>

        {/* Modal Decision Footer (Replaced Save Profile button with Action Buttons) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5 flex-shrink-0">
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onToggleSuspensionFromModal(!selectedUser.suspended)}
            className={`flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap ${
              selectedUser.suspended 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-800 text-white'
            }`}
          >
            {actionLoading ? <Loader2 className="animate-spin" size={14} /> : (selectedUser.suspended ? <Check size={14} /> : <Ban size={14} />)}
            <span>{actionLoading ? 'Updating...' : (selectedUser.suspended ? 'Unsuspend Account' : 'Suspend Account')}</span>
          </button>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onToggleKycFromModal(false)}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60 whitespace-nowrap"
          >
            {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Ban size={14} />}
            <span>{actionLoading ? 'Disapproving...' : 'Disapprove KYC'}</span>
          </button>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onToggleKycFromModal(true)}
            className="flex-1 sm:flex-none justify-center px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-60 whitespace-nowrap"
          >
            {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
            <span>{actionLoading ? 'Approving...' : 'Approve KYC'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
