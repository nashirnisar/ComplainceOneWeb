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

  // Interactive Toast State
  const [toast, setToast] = useState<string | null>(null);

  // Selected News Bulletin Modal State
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

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

    const taskObj = tasks.find(t => t.id === taskId);
    const isCurrentlyCompleted = taskObj?.status === 'Completed';

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
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

    // Show custom flash toast on completion trigger
    if (!isCurrentlyCompleted) {
      setToast("✅ Sent to Advisor. We'll get back to you soon.");
      setTimeout(() => {
        setToast(null);
      }, 4000);
    }

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
      setToast("⚡ Compliance times synced & recalculated successfully.");
      setTimeout(() => {
        setToast(null);
      }, 4000);
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
              T
            </div>
            <div>
              <span className="text-xl font-extrabold font-sans text-slate-850 tracking-tight block leading-none group-hover:text-indigo-600 transition">
                TaxOne
              </span>
            </div>
          </div>

          {/* User profile tags & Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
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
              <span>Hi, {profile.personalInfo.name}</span>
              <Sparkles className="h-5.5 w-5.5 ml-2.5 text-indigo-500 animate-pulse" />
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Contact Your Advisor Button with subtle heatbeat pulse */}
            <motion.button
              id="dashboard-btn-contact-advisor"
              onClick={() => {
                setIsContactModalOpen(true);
                setCallbackRequested(false);
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-indigo-150 cursor-pointer shadow-xs shrink-0 active:scale-95"
              title="Speak or message your dedicated compliance advisor"
            >
              <MessageSquare className="h-3.5 w-3.5 text-indigo-650" />
              <span>Contact Advisor</span>
            </motion.button>

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
          <div className="flex items-center shrink-0 bg-slate-50 border-r border-slate-200/85 pr-4 mr-4 relative z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
            <span className="font-mono font-black text-xs text-indigo-700 tracking-wider uppercase">News</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10" />
            
            <div className="animate-marquee-custom whitespace-nowrap py-0.5">
              {[...NEWS_FEED_ITEMS, ...NEWS_FEED_ITEMS, ...NEWS_FEED_ITEMS].map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  className="inline-flex items-center space-x-2 cursor-pointer hover:text-indigo-600 transition"
                  onClick={() => setSelectedNews(item)}
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
        <div id="compliance-summary-section" className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          
          <div 
            onClick={() => setStatusFilter('All')}
            className={`cursor-pointer p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-xs transition hover:scale-[1.02] duration-150 border select-none ${
              statusFilter === 'All' 
                ? 'bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-500/20' 
                : 'bg-white border-slate-200 hover:border-indigo-300'
            }`}
            title="Show all tasks in ledger"
          >
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">Active Tasks</p>
            <div className="flex items-baseline">
              <p className="text-xl sm:text-2xl font-black text-slate-800 leading-none">{String(totalTasks).padStart(2, '0')}</p>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('Pending')}
            className={`cursor-pointer p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-xs transition hover:scale-[1.02] duration-150 border select-none ${
              statusFilter === 'Pending' 
                ? 'bg-amber-50/45 border-amber-500 ring-2 ring-amber-500/20' 
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
            title="Filter by Pending tasks"
          >
            <p className="text-[10px] sm:text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1 truncate">Upcoming</p>
            <div className="flex items-baseline">
              <p className="text-xl sm:text-2xl font-black text-amber-600 leading-none">{String(upcomingTasks).padStart(2, '0')}</p>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('Overdue')}
            className={`cursor-pointer p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-xs transition hover:scale-[1.02] duration-150 border select-none ${
              statusFilter === 'Overdue' 
                ? 'bg-rose-50/60 border-rose-400 ring-2 ring-rose-500/10' 
                : 'bg-rose-50 border-rose-100 hover:border-rose-300'
            }`}
            title="Filter by Overdue critical actions"
          >
            <p className="text-[10px] sm:text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1 truncate">Overdue Action</p>
            <div className="flex items-baseline">
              <p className="text-xl sm:text-2xl font-black text-rose-600 leading-none">{String(overdueTasks).padStart(2, '0')}</p>
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('Completed')}
            className={`cursor-pointer p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-xs transition hover:scale-[1.02] duration-150 border select-none ${
              statusFilter === 'Completed' 
                ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/10' 
                : 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'
            }`}
            title="Filter by Completed tasks"
          >
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1 truncate">Completed</p>
            <div className="flex items-baseline">
              <p className="text-xl sm:text-2xl font-black text-emerald-600 leading-none">{String(completedTasks).padStart(2, '0')}</p>
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
                  <p className="text-xs text-slate-400 mt-0.5">Filter tasks below by business category</p>
                </div>
              </div>

              {/* Tag Filters Category */}
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

      </main>

      {/* Dynamic Absolute Toast Success Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="toast-notification-success"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-6 md:left-auto md:right-6 md:bottom-6 z-55 bg-slate-900 border border-slate-850 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs sm:text-sm font-semibold max-w-xs sm:max-w-sm ring-1 ring-emerald-500/20"
          >
            <span className="text-emerald-500 font-bold">✨</span>
            <span className="text-slate-100">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. COMPLIANCE INFO DIALOG DRAWER MODAL OVERLAY */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggleComplete={() => handleToggleComplete(selectedTask.id)}
        />
      )}

      {/* 6.5. NEWS BULLETIN DETAILED MODAL OVERLAY */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-105 flex flex-col text-left"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-start relative">
                <div>
                  <span className={`inline-block px-2 sm:px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-2 ${
                    selectedNews.category === 'Tax' ? 'text-amber-450 bg-amber-500/20' :
                    selectedNews.category === 'Startup' ? 'text-emerald-450 bg-emerald-500/20' :
                    selectedNews.category === 'Regulation' ? 'text-purple-450 bg-purple-500/20' :
                    'text-blue-455 bg-blue-500/20'
                  }`}>
                    {selectedNews.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-white leading-normal pr-4">
                    {selectedNews.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-100 flex justify-between text-slate-450 font-mono text-[9px] sm:text-[10px]">
                  <span>Source: <strong className="text-slate-700">{selectedNews.source}</strong></span>
                  <span>Date: <strong className="text-slate-700">{selectedNews.date}</strong></span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">Advisory Briefing</h4>
                  <div className="bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-xl text-slate-650 text-xs sm:text-sm shadow-xs leading-relaxed">
                    {selectedNews.summary}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal pt-2 border-t border-slate-100/70">
                  This advisory alert is automatically synchronised to help your workspace track structural tax filing and corporate compliance directives seamlessly.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close Bulletin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-4 max-w-[calc(100vw-2rem)]">
        <AnimatePresence>
          {isAIChatOpen && (
            <motion.div
              id="floating-ai-chat-window"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="w-80 max-w-full sm:w-100 shadow-2xl rounded-3xl overflow-hidden border border-indigo-950 bg-[#1e1b4b]"
            >
              <div className="h-[550px] max-h-[70vh] flex flex-col">
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
              : 'bg-purple-600 hover:bg-purple-700 ring-4 ring-purple-500/25'
          }`}
          title="Consult TaxOne AI Assistant"
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
        <p className="font-semibold">TaxOne © 2026 • AI-Powered Obligations Platform</p>
        <p className="text-[10px] mt-1 text-slate-350">
          This system uses local context and Gemini model evaluations to summarize deadline protocols. Consult a certified legal CPA for critical filings.
        </p>
      </footer>
    </div>
  );
}
