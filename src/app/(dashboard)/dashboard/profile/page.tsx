'use client';

import React, { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Lock, 
  ShieldCheck, 
  CheckCircle, 
  UploadCloud, 
  Camera, 
  FileText, 
  Save, 
  AlertCircle, 
  Briefcase, 
  Globe, 
  Landmark 
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

export default function UserProfilePage() {
  const { showToast } = useToastStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [occupation, setOccupation] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Media State
  const [profilePicture, setProfilePicture] = useState('');
  const [idType, setIdType] = useState('Passport');
  const [idCardFile, setIdCardFile] = useState<string | null>(null);
  const [idCardFileName, setIdCardFileName] = useState('');

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const res = await fetch(`${apiUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);

      // Populate Form Fields
      setFullName(data.fullName || '');
      setPhoneNumber(data.phoneNumber || '');
      setCountry(data.country || '');
      setAddress(data.address || '');
      setZipCode(data.zipCode || '');
      setGender(data.gender || 'Male');
      setOccupation(data.occupation || '');
      setCity(data.city || '');
      setState(data.state || '');
      setProfilePicture(data.profilePicture || '');
      setIdType(data.idType || 'Passport');
      if (data.passport) {
        setIdCardFileName(data.passport);
      }

      // Convert timestamp to YYYY-MM-DD if present
      if (data.dob) {
        try {
          const dateObj = new Date(data.dob);
          if (!isNaN(dateObj.getTime())) {
            setDob(dateObj.toISOString().split('T')[0]);
          }
        } catch (e) {
          console.error('Error parsing dob:', e);
        }
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle Profile Picture File Upload
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePicture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle ID Card Document File Upload
  const handleIdCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdCardFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setIdCardFile(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Profile Form Updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const dobTimestamp = dob ? new Date(dob).getTime() : 0;

      const res = await fetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          country,
          state,
          city,
          address,
          zipCode,
          gender,
          occupation,
          dob: dobTimestamp,
          profilePicture,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      // Update localStorage user cache
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const updatedUser = { ...parsed, fullName, phoneNumber, country, profilePicture };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {}
      }

      showToast('Account details updated successfully!', 'success');
      fetchProfileData();
    } catch (err: any) {
      showToast(err.message || 'Error updating profile details', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Submit KYC ID Verification
  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardFile && !idCardFileName) {
      showToast('Please upload a copy of your ID card or passport.', 'error');
      return;
    }

    setSubmittingKyc(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const passportValue = idCardFile || idCardFileName;

      const res = await fetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passport: passportValue,
          idType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'KYC submission failed');

      showToast('Identity document submitted successfully! Account is under review.', 'success');
      fetchProfileData();
    } catch (err: any) {
      showToast(err.message || 'Error submitting identity document', 'error');
    } finally {
      setSubmittingKyc(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Decrypting Client Vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Client Account Profile</h1>
        <p className="text-slate-500 text-xs font-light">
          Manage your personal details, profile picture, and upload identity documents for KYC clearance.
        </p>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Avatar & ID Card Verification (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Profile Picture Upload Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-5 text-center">
            
            {/* Avatar Container */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-primary/10 text-primary border-4 border-white shadow-xl flex items-center justify-center font-black text-4xl overflow-hidden relative">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile?.fullName ? profile.fullName[0] : profile?.username[0]}</span>
                )}
              </div>
              
              {/* Upload Trigger */}
              <label 
                htmlFor="profilePictureInput"
                className="absolute bottom-0 right-0 p-2.5 bg-primary hover:bg-red-800 text-white rounded-full shadow-lg cursor-pointer transition-transform transform hover:scale-110"
                title="Change Profile Picture"
              >
                <Camera size={16} />
                <input 
                  id="profilePictureInput"
                  type="file" 
                  accept="image/*" 
                  onChange={handleProfilePictureUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="flex flex-col items-center">
              <h3 className="text-base font-extrabold text-slate-900">{profile?.fullName || profile?.username}</h3>
              <span className="text-xs text-slate-400 font-mono">@{profile?.username}</span>
            </div>

            {/* Account Verification Status Badge */}
            {profile?.isVerified ? (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-600" />
                <span>Verified Account Clearance</span>
              </div>
            ) : profile?.onReview ? (
              <div className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600" />
                <span>KYC Under Review</span>
              </div>
            ) : (
              <div className="bg-red-50 text-red-700 border border-red-200 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                <AlertCircle size={14} className="text-red-600" />
                <span>Unverified - Upload ID Card</span>
              </div>
            )}

            <div className="w-full border-t border-slate-100 pt-3 flex justify-between text-xs font-mono text-slate-500">
              <span>Acc No:</span>
              <span className="font-bold text-slate-800">{profile?.accountNumber}</span>
            </div>
          </div>

          {/* Identity Document (KYC) Upload Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck size={20} className="text-primary" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                Identity Document (KYC)
              </h3>
            </div>

            {profile?.isVerified ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={28} />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-extrabold text-emerald-900 uppercase tracking-tight">Identity Cleared & Verified</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed font-light">
                    Your identity clearance document ({profile?.idType || 'Passport'}) has been audited and approved by bank administration. Verification forms are locked.
                  </p>
                </div>
                {profile?.passport && (
                  <div className="w-full h-32 rounded-lg border border-emerald-200 overflow-hidden mt-1">
                    <img src={profile.passport} alt="Verified ID" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="mt-1 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Lock size={12} />
                  <span>Immutable Verification Record</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitKyc} className="flex flex-col gap-4">
                
                {/* Select ID Card Type */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Select ID Card Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary font-semibold text-xs cursor-pointer"
                  >
                    <option value="Passport">International Passport</option>
                    <option value="Drivers License">Driver's License</option>
                    <option value="Voters Card">Voter's Card</option>
                  </select>
                </div>

                {/* Upload ID Card Document Box */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Upload Document / ID Card</label>
                  
                  <div className="border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-xl p-4 text-center flex flex-col items-center justify-center min-h-[160px] transition-all cursor-pointer relative bg-slate-50 overflow-hidden group">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleIdCardUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    
                    {(idCardFile || profile?.passport) ? (
                      <div className="relative w-full h-36 flex flex-col items-center justify-center overflow-hidden rounded-lg">
                        {((idCardFile || profile?.passport).startsWith('data:image') || (idCardFile || profile?.passport).startsWith('http') || (idCardFile || profile?.passport).length > 200) ? (
                          <img 
                            src={idCardFile || profile?.passport} 
                            alt="ID Card Preview" 
                            className="w-full h-full object-cover rounded-lg border border-slate-200 shadow-xs" 
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-200 rounded-lg w-full">
                            <FileText size={32} className="text-primary" />
                            <span className="font-bold text-xs text-slate-800 truncate max-w-full">
                              {idCardFileName || 'ID Document Uploaded'}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-2 rounded-lg">
                          <Camera size={22} />
                          <span className="text-[11px] font-bold">Click to Change ID Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <UploadCloud size={32} className="text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold text-slate-700">Click or drag ID Card image</span>
                        <span className="text-[10px] text-slate-400">Supports JPEG, PNG or PDF (Max 5MB)</span>
                      </div>
                    )}

                    {idCardFileName && (
                      <div className="mt-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-full truncate max-w-full">
                        Selected: {idCardFileName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit KYC Button */}
                <button
                  type="submit"
                  disabled={submittingKyc}
                  className="w-full py-3 bg-primary hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400"
                >
                  <ShieldCheck size={16} />
                  <span>{submittingKyc ? 'Uploading Document...' : 'Submit Identity Clearance'}</span>
                </button>

              </form>
            )}
          </div>

        </div>

        {/* Right Column: Editable Profile & Registration Details Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User size={20} className="text-primary" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
              Account Registration Details
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
            
            {/* Locked Identifiers (Cannot Edit Email or Username) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              
              {/* Username (Locked) */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-500 uppercase text-[10px] flex items-center gap-1">
                  <Lock size={12} className="text-slate-400" />
                  Username (Locked)
                </label>
                <input
                  type="text"
                  value={profile?.username || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-200/70 border border-slate-300 rounded text-slate-500 font-mono text-xs cursor-not-allowed select-none"
                />
              </div>

              {/* Email (Locked) */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-500 uppercase text-[10px] flex items-center gap-1">
                  <Lock size={12} className="text-slate-400" />
                  Email Address (Locked)
                </label>
                <input
                  type="text"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-200/70 border border-slate-300 rounded text-slate-500 font-mono text-xs cursor-not-allowed select-none"
                />
              </div>

            </div>

            {/* Editable Registration & Personal Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={profile?.isVerified}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={profile?.isVerified}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={profile?.isVerified}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={profile?.isVerified}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Occupation */}
              <div className="flex flex-col gap-1.5 text-xs sm:col-span-2">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Occupation / Profession</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  disabled={profile?.isVerified}
                  placeholder="Software Engineer / Business Executive"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={profile?.isVerified}
                  placeholder="United States"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">State / Region</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={profile?.isVerified}
                  placeholder="California"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={profile?.isVerified}
                  placeholder="Los Angeles"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* Postal / Zip Code */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Postal / Zip Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={profile?.isVerified}
                  placeholder="90001"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              {/* Home Address */}
              <div className="flex flex-col gap-1.5 text-xs sm:col-span-2">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={profile?.isVerified}
                  placeholder="123 Financial Way, Suite 400"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-xs disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

            </div>

            {/* Save Profile Button - Only visible when NOT verified */}
            {!profile?.isVerified ? (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 bg-primary hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:bg-slate-400"
                >
                  <Save size={16} />
                  <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 font-bold">
                  <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>Identity Clearance Approved & Verified — Profile Record is Immutable</span>
                </div>
              </div>
            )}

          </form>

        </div>

      </div>

    </div>
  );
}
