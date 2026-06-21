import React, { useState } from 'react';
import { UserProfile, UserType, BusinessInfo, PersonalInfo } from '../types';
import { Shield, Building, User, Briefcase, ChevronRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(0); // 0 = Auth, 1 = User Type, 2 = Profile details
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  
  // Profile Form State
  const [userType, setUserType] = useState<UserType>('Individual');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [businessType, setBusinessType] = useState('Private Limited');
  const [gstNumber, setGstNumber] = useState('');
  const [pan, setPan] = useState('');
  const [cin, setCin] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || (!isLoginMode && !authName)) {
      setErrorMsg("Please fill in all authentication fields.");
      return;
    }
    setErrorMsg('');
    setName(authName || name || authEmail.split('@')[0]); // Fallback
    setStep(1); // Proceed to role selection
  };

  const selectUserType = (type: UserType) => {
    setUserType(type);
    setStep(2); // Proceed to details
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && !authName) {
      setErrorMsg("Contact Name is required.");
      return;
    }

    const personalInfo: PersonalInfo = {
      name: name || authName || "User",
      email: authEmail || "user@example.com",
      phone: phone || "9999999999"
    };

    let businessInfo: BusinessInfo | undefined = undefined;
    if (userType === 'Startup' || userType === 'Business' || userType === 'Freelancer') {
      businessInfo = {
        companyName: companyName || (userType === 'Freelancer' ? `${personalInfo.name} Consulting` : 'My Venture Inc.'),
        registrationDate: registrationDate || new Date().toISOString().split('T')[0],
        businessType: userType === 'Freelancer' ? 'Sole Proprietorship' : businessType,
        gstNumber: gstNumber || undefined,
        pan: pan || undefined,
        cin: cin || undefined
      };
    }

    onComplete({
      personalInfo,
      userType,
      businessInfo,
      isOnboarded: true
    });
  };

  return (
    <div id="onboarding-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
            <Shield className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold font-sans text-slate-900 tracking-tight">TaxOne</span>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          {step === 0 ? (isLoginMode ? 'Sign in to TaxOne' : 'Get Started with TaxOne') :
           step === 1 ? 'Choose Your Profile Type' : 'Setup Compliance Profile'}
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-500">
          {step === 0 ? 'Your AI-powered financial obligation & tracking companion' : 
           step === 1 ? 'Select the profile that fits your economic operations' : 
           'Enter registry values for dynamic notification tracking'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          {errorMsg && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* STEP 0: LOGIN & REGISTRATION */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="step-auth">
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLoginMode && (
                  <div>
                    <label id="lbl-auth-name" className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all sm:text-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                )}
                <div>
                  <label id="lbl-auth-email" className="block text-sm font-medium text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label id="lbl-auth-password" className="block text-sm font-medium text-slate-700">Password</label>
                    {isLoginMode && (
                      <button
                        type="button"
                        onClick={() => alert("Password reset simulated! Please sign in with any credentials.")}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors cursor-pointer"
                  >
                    {isLoginMode ? 'Sign In and Continue' : 'Create Account'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setErrorMsg('');
                  }}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
                >
                  {isLoginMode ? 'New to TaxOne? Create an account' : 'Already have an account? Sign In'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: CHOOSE PROFILE ROLE */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} id="step-user-type" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    type: 'Individual' as UserType,
                    title: 'Individual',
                    desc: 'Salaried employee, investor, or general citizen checking ITR tax dates.',
                    icon: User,
                    color: 'text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-300'
                  },
                  {
                    type: 'Freelancer' as UserType,
                    title: 'Freelancer / Consultant',
                    desc: 'Contract worker, designer, developer tax reporting under presumptive schemes.',
                    icon: Briefcase,
                    color: 'text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300'
                  },
                  {
                    type: 'Startup' as UserType,
                    title: 'Startup Founder',
                    desc: 'Early stage founder, bootstrapping teams needing GST and ROC tracking help.',
                    icon: Shield,
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300'
                  },
                  {
                    type: 'Business' as UserType,
                    title: 'Small Business',
                    desc: 'Private Limited or LLP corporations, processing corporate taxes & audits.',
                    icon: Building,
                    color: 'text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300'
                  }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => selectUserType(item.type)}
                    className="flex flex-col text-left p-4.5 border border-slate-100 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer group hover:shadow-sm"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-between space-x-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Back to Auth
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PROFILE DETAILS FORM */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} id="step-details">
              <h3 className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded mb-4 inline-block">
                Type: {userType}
              </h3>
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Contact / Representative Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Phone Contact Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                </div>

                {userType !== 'Individual' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Company / Entity Name *</label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="e.g. Antigravity Software Private Limited"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Registration / Incorporation Date</label>
                        <input
                          type="date"
                          value={registrationDate}
                          onChange={(e) => setRegistrationDate(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {userType !== 'Freelancer' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Business Entity Type</label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                          <option value="Limited Liability Partnership">Limited Liability Partnership (LLP)</option>
                          <option value="One Person Company">One Person Company (OPC)</option>
                          <option value="Partnership Firm">Registered Partnership Firm</option>
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-600">GST Registration Number (GSTIN)</label>
                        <input
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                          maxLength={15}
                          className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider"
                          placeholder="e.g. 07AAAAA1111A1Z1"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Leave empty if you don't possess a GST certificate.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600">Corporate PAN (Permanent Acct No)</label>
                        <input
                          type="text"
                          value={pan}
                          onChange={(e) => setPan(e.target.value.toUpperCase())}
                          maxLength={10}
                          className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider"
                          placeholder="e.g. ABCDE1234F"
                        />
                      </div>
                    </div>

                    {userType === 'Business' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600">CIN (Corporate Identification Number) - Optional</label>
                        <input
                          type="text"
                          value={cin}
                          onChange={(e) => setCin(e.target.value.toUpperCase())}
                          maxLength={21}
                          className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider"
                          placeholder="e.g. U72900DL2023PTC123456"
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 py-2"
                  >
                    Change Type
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow transition duration-150 cursor-pointer"
                  >
                    <span>Complete Configuration</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
