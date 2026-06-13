import { useState, useEffect } from 'react';
import { ComplianceTask, NotificationItem } from '../types';
import { Bell, Mail, AlertTriangle, Check, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationPanelProps {
  tasks: ComplianceTask[];
  userEmail: string;
}

export default function NotificationPanel({ tasks, userEmail }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Generate dynamic reminders based on task due date gaps
  useEffect(() => {
    const alerts: NotificationItem[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    tasks.forEach((task) => {
      if (task.status === 'Completed') return;

      const due = new Date(task.dueDate);
      due.setHours(0,0,0,0);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Trigger alerts specifically for 30, 15, 7, and 1 days (or standard ranges)
      if (diffDays === 30) {
        alerts.push({
          id: `notif_30_${task.id}`,
          taskId: task.id,
          title: `30-Day Reminder: ${task.name}`,
          message: `Your ${task.category} filing is due in exactly 30 days. Estimated penalty for missing this is ${task.penalty}. A warning email has been scheduled for ${userEmail}.`,
          timestamp: 'Just now',
          read: false,
          type: 'alert'
        });
      } else if (diffDays === 15) {
        alerts.push({
          id: `notif_15_${task.id}`,
          taskId: task.id,
          title: `15-Day Reminder: ${task.name}`,
          message: `Your business ROC or Tax filing deadline is coming up in 15 days (${task.dueDate}). Form checklist logs are open inside. Reminders has been dispatched.`,
          timestamp: 'Just now',
          read: false,
          type: 'alert'
        });
      } else if (diffDays <= 7 && diffDays > 1) {
        alerts.push({
          id: `notif_7_${task.id}`,
          taskId: task.id,
          title: `Critical 7-Day Alert: ${task.name}`,
          message: `Only direct 1 week left to file your ${task.category} declaration online. Click for step-by-step guidance. Confirm details immediately.`,
          timestamp: 'Immediate urgency',
          read: false,
          type: 'alert'
        });
      } else if (diffDays === 1) {
        alerts.push({
          id: `notif_1_${task.id}`,
          taskId: task.id,
          title: `CRITICAL 24h ALERT: ${task.name} Due Tomorrow!`,
          message: `ComplianceOne action required! Filing must be finalized and uploaded on portal within 24 hours to avoid instant ${task.penalty} late penalties.`,
          timestamp: 'EXTREME URGENCY',
          read: false,
          type: 'alert'
        });
      } else if (diffDays < 0) {
        // Overdue reminders
        alerts.push({
          id: `notif_overdue_${task.id}`,
          taskId: task.id,
          title: `🚨 OVERDUE WARNING: ${task.name}`,
          message: `This filing has passed its original due date. Accumulated fines are tracking on your business account. Please resolve this immediately manually or ask our AI assistant.`,
          timestamp: 'Overdue state',
          read: false,
          type: 'alert'
        });
      } else {
        // general informational notification
        alerts.push({
          id: `notif_gen_${task.id}`,
          taskId: task.id,
          title: `Track Scheduled: ${task.name}`,
          message: `System is auditing your scheduled deadline due on ${task.dueDate}. No immediate action required yet. Reminders are configured.`,
          timestamp: 'Today',
          read: true,
          type: 'system'
        });
      }
    });

    // Add a system welcome notification
    alerts.unshift({
      id: 'notif_welcome',
      title: 'ComplianceOne Sync Active',
      message: `Successfully connected database to user registry. Automated notification triggers now tracking on email: ${userEmail}.`,
      timestamp: 'Today',
      read: false,
      type: 'system'
    });

    setNotifications(alerts);
  }, [tasks, userEmail]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const notifyUserOfEmailSimulation = (title: string) => {
    alert(`[EMAIL SIMULATOR]\nFrom: alerts@compliancemate.gov\nTo: ${userEmail}\nSubject: DOCKED COMPLIANCE OBLIGATION - "${title}"\n\nCompliance Mate has dispatched a reminder to your inbox. Let's finish your filing steps on time to avoid fines.`);
  };

  return (
    <div className="relative inline-block text-left" id="notification-center">
      <button
        id="btn-bell-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        title="Check Trigger Logs"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-[9px] font-black text-white rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop target */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[500px]"
            >
              {/* Notif Header */}
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center bg-radial">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-emerald-400" />
                  <span className="text-xs font-bold font-sans">Reminders & Email Dispatcher</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded transition cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Feed lists */}
              <div className="overflow-y-auto p-2 space-y-2 flex-1 max-h-[380px] bg-slate-50">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No active compliance deadlines. Great job!
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-xl border transition-all hover:bg-white flex flex-col space-y-1.5 cursor-pointer relative ${
                        notif.read ? 'bg-white/40 border-slate-100 opacity-70' : 'bg-white border-emerald-100 shadow-sm'
                      }`}
                      onClick={() => toggleRead(notif.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {notif.id.includes('overdue') || notif.id.includes('notif_1') ? (
                            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          )}
                          <span className={`text-xs font-bold leading-tight ${notif.read ? 'text-slate-550' : 'text-slate-805'}`}>
                            {notif.title}
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-450 font-medium font-mono shrink-0 uppercase">
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-xxs uppercase leading-relaxed text-slate-500">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-50/50">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            notifyUserOfEmailSimulation(notif.title);
                          }}
                          className="text-[9px] text-emerald-605 hover:text-emerald-700 font-bold flex items-center"
                        >
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          <span>Simulate Email Alert</span>
                        </button>
                        {!notif.read && (
                          <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Notif Footer */}
              <div className="p-3 bg-slate-100 text-center border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                Scanning thresholds: Every 30, 15, 7, and 1 days before due.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
