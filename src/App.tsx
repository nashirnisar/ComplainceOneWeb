import React, { useState, useEffect } from 'react';
import { UserProfile, ComplianceTask, ComplianceStatus } from './types';
import { generateCompliancesForUser } from './data/complianceTemplates';
import Onboarding from './components/Onboarding';
import TaskCard from './components/TaskCard';
import TaskDetail from './components/TaskDetail';
import AIAssistant from './components/AIAssistant';
import { NEWS_FEED_ITEMS } from './data/newsFeed';
import NotificationPanel from './components/NotificationPanel';
import { 
  Building, User, Briefcase, Shield, LogOut, Search, 
  Sparkles, CheckCircle, AlertTriangle, Calendar, RefreshCw, FileCheck,
  Mail, MessageSquare, PhoneCall, X, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ComplianceTask | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Overdue' | 'Completed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Contact Advisor States
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);

  // Floating AI Chat States
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Auto scroll to top on initial mount/profile loaded
  useEffect(() => {
    if (profile && profile.isOnboarded) {
      window.scrollTo(0, 0);
    }
  }, [profile]);

  // When selected task closes, reset scroll position so they return smoothly to the top of the timeline
  useEffect(() => {
    if (selectedTask === null) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedTask]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('compliancemate_user');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile) as UserProfile;
        setProfile(parsedProfile);
        
        // Load tasks
        const storedTasks = localStorage.getItem('compliancemate_tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks) as ComplianceTask[]);
        } else {
          // Generate initially
          const initialTasks = generateCompliancesForUser(parsedProfile);
          setTasks(initialTasks);
          localStorage.setItem('compliancemate_tasks', JSON.stringify(initialTasks));
        }
      }
    } catch (err) {
      console.error("Failed to restore session from local storage:", err);
    }
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('compliancemate_user', JSON.stringify(newProfile));
    
    // Generate fresh tasks based on profile data
    const newTasks = generateCompliancesForUser(newProfile);
    setTasks(newTasks);
    localStorage.setItem('compliancemate_tasks', JSON.stringify(newTasks));

    // Force scroll back to the very top upon login/onboarding entry
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 30);
  };

  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to log out and reconfigure your compliance settings? Your current completion checks will be reset.")) {
      localStorage.removeItem('compliancemate_user');
      localStorage.removeItem('compliancemate_tasks');
      setProfile(null);
      setTasks([]);
      setSelectedTask(null);
    }
  };

  const handleToggleComplete = (taskId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Avoid triggering open detail dialog when clicking complete button
    }

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const isCurrentlyCompleted = t.status === 'Completed';
        const updatedStatus: ComplianceStatus = isCurrentlyCompleted 
          ? (new Date(t.dueDate) < new Date() ? 'Overdue' : 'Pending')
          : 'Completed';

        return {
          ...t,
          status: updatedStatus,
          completedDate: updatedStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return t;
    });

    setTasks(updated);
    localStorage.setItem('compliancemate_tasks', JSON.stringify(updated));

    // Update opened detail task state instantly if open
    if (selectedTask && selectedTask.id === taskId) {
      const activeTaskInUpdated = updated.find(u => u.id === taskId);
      if (activeTaskInUpdated) {
        setSelectedTask(activeTaskInUpdated);
      }
    }
  };

  const handleSyncFreshTemplates = () => {
    if (profile) {
      const fresh = generateCompliancesForUser(profile);
      setTasks(fresh);
      localStorage.setItem('compliancemate_tasks', JSON.stringify(fresh));
      alert("Compliance timeline synced and recalculated successfully based on rules template database.");
    }
  };

  // Compute Task Calculations
  const totalTasks = tasks.length;
  const upcomingTasks = tasks.filter(t => t.status === 'Pending').length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  const categories = ['All', ...Array.from(new Set(tasks.map(t => t.category)))];

  // Filtering Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  }).sort((a, b) => {
    const weights: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return (weights[b.priority] || 0) - (weights[a.priority] || 0);
  });

  if (!profile || !profile.isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const getProfileIcon = () => {
    switch (profile.userType) {
      case 'Individual': return <User className="h-5 w-5 text-blue-600" />;
      case 'Freelancer': return <Briefcase className="h-5 w-5 text-amber-600" />;
      case 'Startup': return <Shield className="h-5 w-5 text-emerald-600" />;
      case 'Business': return <Building className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      {/* 1. APP HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo / Brand Home */}
          <div 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setPriorityFilter('All');
              setSelectedCategory('All');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="flex items-center space-x-3 cursor-pointer group"
            title="Return Home & Reset Layout scroll"
          >
            <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-md transition group-hover:scale-105 group-hover:bg-indigo-700">
              C
            </div>
            <div>
              <span className="text-xl font-extrabold font-sans text-slate-850 tracking-tight block leading-none group-hover:text-indigo-600 transition">
                ComplianceOne
              </span>
              <span className="text-[10px] text-indigo-600 font-mono tracking-wider">AI obligations engine</span>
            </div>
          </div>

          {/* User profile tags & Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Persistent Contact Your Advisor Button */}
            <button
              id="header-btn-contact-advisor"
              onClick={() => {
                setIsContactModalOpen(true);
                setCallbackRequested(false);
              }}
              className="px-3 sm:px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-indigo-150 cursor-pointer shadow-xs shrink-0 active:scale-95"
              title="Speak or message your dedicated compliance advisor"
            >
              <MessageSquare className="h-4 w-4 text-indigo-650" />
              <span className="hidden sm:inline">Contact Your Advisor</span>
              <span className="sm:hidden">Advisor</span>
            </button>
            
            {/* Quick configuration stats tag */}
            <div className="hidden md:flex items-center space-x-2.5 bg-slate-50/80 px-3.5 py-1.5 rounded-xl border border-slate-200">
              <div className="p-1 rounded bg-white border border-slate-200">
                {getProfileIcon()}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">{profile.userType} Tier</p>
                <p className="text-xs font-bold text-slate-750 max-w-[150px] truncate">
                  {profile.businessInfo?.companyName || profile.personalInfo.name}
                </p>
              </div>
            </div>

            {/* Notifications alerts system panel */}
            <NotificationPanel tasks={tasks} userEmail={profile.personalInfo.email} />

            {/* Logout re-configure profile button */}
            <button
              id="btn-logout"
              onClick={handleResetProfile}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
              title="Reset configuration / Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Simplified Welcome Area - No Card/Container Styling */}
        <div id="welcome-dashboard-area" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
              <span>Welcome Back, {profile.personalInfo.name}!</span>
              <Sparkles className="h-5.5 w-5.5 ml-2.5 text-indigo-500 animate-pulse" />
            </h1>
          </div>
          <button 
            id="btn-recalculate-timelines"
            type="button" 
            onClick={handleSyncFreshTemplates}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs border border-indigo-650"
          >
            <RefreshCw className="h-3.5 w-3.5 text-white" />
            <span>Recalculate Timelines</span>
          </button>
        </div>

        {/* Horizontal News Bulletin Strip */}
        <div id="news-bulletin-strip" className="bg-slate-50 border-y border-slate-200/80 py-2.5 px-4 flex items-center overflow-hidden text-xs relative select-none">
          <style>{`
            @keyframes marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-33.33%, 0, 0); }
            }
            .animate-marquee-custom {
              display: inline-flex;
              gap: 3rem;
              animation: marquee 45s linear infinite;
            }
            .animate-marquee-custom:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="flex items-center space-x-2 shrink-0 bg-slate-50 border-r border-slate-200/85 pr-4 mr-4 relative z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="font-mono font-black text-[10px] text-indigo-700 tracking-wider uppercase">LATEST BULLETIN</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10" />
            
            <div className="animate-marquee-custom whitespace-nowrap py-0.5">
              {[...NEWS_FEED_ITEMS, ...NEWS_FEED_ITEMS, ...NEWS_FEED_ITEMS].map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  className="inline-flex items-center space-x-2 cursor-pointer hover:text-indigo-600 transition"
                  onClick={() => alert(`[${item.category}] ${item.title}\nSource: ${item.source} (${item.date})\n\n${item.summary}`)}
                >
                  <span className={`font-mono font-extrabold text-[9px] px-1.5 py-0.5 rounded-sm uppercase ${
                    item.category === 'Tax' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                    item.category === 'Startup' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' :
                    item.category === 'Regulation' ? 'text-purple-700 bg-purple-50 border border-purple-200' :
                    'text-blue-700 bg-blue-50 border border-blue-200'
                  }`}>
                    {item.category}
                  </span>
                  <span className="font-semibold text-slate-755">{item.title}</span>
                  <span className="text-slate-400 text-[10px] font-mono">({item.date})</span>
                  <span className="text-slate-300 mx-1">|</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. CORE SUMMARY METRICS CARDS */}
        <div id="compliance-summary-section" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => setStatusFilter('All')}
            className={`cursor-pointer p-5 rounded-2xl shadow-sm transition hover:scale-[1.02] duration-150 border select-none ${
              statusFilter === 'All' 
                ? 'bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-500/20' 
                : 'bg-white border-slate-200 hover:border-indigo-300'
            }`}
            title="Show all tasks in ledger"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Active Tasks</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-black text-slate-800">{String(totalTasks).padStart(2, '0')}</p>
              <span className="text-xxs text-slate-400 font-medium">total listed</span>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('Pending')}
            className={`cursor-pointer p-5 rounded-2xl shadow-sm transition hover:scale-[1.02] duration-150 border select-none ${
              statusFilter === 'Pending' 
                ? 'bg-amber-50/45 border-amber-500 ring-2 ring-amber-500/20' 
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
            title="Filter by Pending tasks"
          >
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">Upcoming (Pending)</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-black text-amber-600">{String(upcomingTasks).padStart(2, '0')}</p>
              <span className="text-xxs text-amber-500 font-medium">due shortly</span>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('Overdue')}
            className={`cursor-pointer p-5 rounded-2xl shadow-sm transition hover:scale-[1.02] duration-150 border select-none ${
              statusFilter === 'Overdue' 
                ? 'bg-rose-50/60 border-rose-400 ring-2 ring-rose-500/10' 
                : 'bg-rose-50 border-rose-100 hover:border-rose-300'
            }`}
            title="Filter by Overdue critical actions"
          >
            <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1.5">Overdue Action</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-black text-rose-600">{String(overdueTasks).padStart(2, '0')}</p>
              {overdueTasks > 0 ? (
                <span className="text-xxs text-rose-500 font-bold animate-pulse">immediate action</span>
              ) : (
                <span className="text-xxs text-slate-400 font-medium">perfect cleared</span>
              )}
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('Completed')}
            className={`cursor-pointer p-5 rounded-2xl shadow-sm transition hover:scale-[1.02] duration-150 border select-none ${
              statusFilter === 'Completed' 
                ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/10' 
                : 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'
            }`}
            title="Filter by Completed tasks"
          >
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Completed</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-black text-emerald-600">{String(completedTasks).padStart(2, '0')}</p>
              <span className="text-xxs text-emerald-500 font-medium">safely filed</span>
            </div>
          </div>

        </div>

        {/* 4. MAIN LOBBY GRID */}
        <div className="w-full">
          
          {/* FULL WIDTH: COMPLIANCE DEADLINES OBLIGATIONS TRACKING */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6" id="upcoming-deadlines-section">
            
            {/* SEARCH & FILTERS CONTROLS MODULE */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Obligations Ledger</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Filter tasks below to manage current filing steps</p>
                </div>
                
                {/* Status Toggle filter */}
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                  {(['All', 'Pending', 'Overdue', 'Completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 text-xxs font-bold rounded-lg cursor-pointer transition ${
                        statusFilter === st 
                          ? 'bg-white text-slate-850 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search obligation profiles (GST, advance taxes, board meetings, ROC)..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-3 text-slate-350 text-xs font-bold hover:text-slate-500">
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Tag Filters Category and Priorities */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider mr-1">Category:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-xxs rounded-lg font-bold transition border cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white border-transparent'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                <div className="ml-auto flex items-center space-x-1.5 shrink-0">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
                  {(['All', 'High', 'Medium', 'Low'] as const).map((prio) => (
                    <button
                      key={prio}
                      onClick={() => setPriorityFilter(prio)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-lg cursor-pointer transition ${
                        priorityFilter === prio
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* OBLIGATIONS CARDS GRID STACK */}
            {filteredTasks.length === 0 ? (
              <div className="bg-slate-50 border border-slate-150 p-12 text-center rounded-2xl text-slate-400">
                <div className="flex justify-center mb-3">
                  <CheckCircle className="h-10 w-10 text-indigo-400/80 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Perfect Cleared State!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  No active or pending compliance tasks match your selected filter options.
                </p>
                {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' || selectedCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('All');
                      setPriorityFilter('All');
                      setSelectedCategory('All');
                    }}
                    className="text-indigo-600 font-bold hover:text-indigo-700 text-xs mt-4 underline"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelect={setSelectedTask}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* 5. ADDED BENTO BOTTOM ROW: DYNAMIC ADVISORY ALERT PANEL */}
        <div className="grid grid-cols-1 gap-6">
          {/* Dynamic Advisory Alert Panel (Emerald-600) */}
          <div className="bg-emerald-600 text-white rounded-3xl p-6 flex gap-4 shadow-sm relative overflow-hidden min-h-[120px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12 pointer-events-none" />
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1 text-white">Pro-Tip: Tax Deductions for {profile.userType}s</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                You can claim input tax credit (ITC) or business deductible expense write-offs on your office broadband internet, laptop equipment, and software subscriptions. Log receipt files early this month to maximize savings!
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* 6. COMPLIANCE INFO DIALOG DRAWER MODAL OVERLAY */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggleComplete={() => handleToggleComplete(selectedTask.id)}
        />
      )}

      {/* 7. CONTACT ADVISOR DIALOG MODAL */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100"
          >
            <button 
              onClick={() => {
                setIsContactModalOpen(false);
                setCallbackRequested(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-50 transition cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Your Expert Advisor</h3>
                <p className="text-[10px] text-indigo-600 font-mono tracking-wider font-bold">CPA CERTIFIED ADVOCATE</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed text-left">
              <p>
                Get live assistance regarding your tax filings, legal structures, deductions, or audit precautions. Contact our dedicated desk or request an instant callback.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2 text-slate-800 font-semibold select-all">
                  <Mail className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>advisor@compliancemate.ai</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-800 font-semibold select-all">
                  <PhoneCall className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>+1 (800) 555-MATE</span>
                </div>
              </div>

              {!callbackRequested ? (
                <div className="space-y-2 pt-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Request an Instant callback
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Enter phone number..."
                      defaultValue={profile?.personalInfo?.phone || "+1 (555) 123-4567"}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setCallbackRequested(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center shrink-0 cursor-pointer"
                    >
                      Call Me
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3.5 rounded-xl text-[11px] font-bold flex items-center space-x-2"
                >
                  <span>✓ Request logged! Your compliance specialist will call you shortly.</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* 8. FLOATING COMPLIANCE AI ASSISTANT FAB & DRAWER OVERLAY */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-4">
        <AnimatePresence>
          {isAIChatOpen && (
            <motion.div
              id="floating-ai-chat-window"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="w-80 sm:w-100 shadow-2xl rounded-3xl overflow-hidden border border-indigo-950 bg-[#1e1b4b]"
            >
              <div className="h-[550px] flex flex-col">
                <AIAssistant 
                  userProfile={profile} 
                  tasks={tasks} 
                  onClose={() => setIsAIChatOpen(false)} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="btn-floating-ai-fab"
          type="button"
          onClick={() => setIsAIChatOpen(!isAIChatOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-2xl transition cursor-pointer relative ${
            isAIChatOpen 
              ? 'bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-500/20' 
              : 'bg-indigo-650 hover:bg-indigo-700 ring-4 ring-indigo-550/25'
          }`}
          title="Consult Compliance AI Assistant"
        >
          {isAIChatOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <>
              <Bot className="h-6 w-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Footer credits bar */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-auto">
        <p className="font-semibold">ComplianceOne © 2026 • AI-Powered Obligations Platform</p>
        <p className="text-[10px] mt-1 text-slate-350">
          This system uses local context and Gemini model evaluations to summarize deadline protocols. Consult a certified legal CPA for critical filings.
        </p>
      </footer>
    </div>
  );
}
