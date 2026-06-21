import { useState, useEffect } from 'react';
import { ComplianceTask } from '../types';
import { X, AlertCircle, FileText, CheckCircle2, ChevronRight, History } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskDetailProps {
  task: ComplianceTask;
  onClose: () => void;
  onToggleComplete: () => void;
}

export default function TaskDetail({ task, onClose, onToggleComplete }: TaskDetailProps) {
  // Save step checkmarks locally in React state so they can interactively complete filing guides
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Reset checkboxes when the task changes
  useEffect(() => {
    setCheckedSteps({});
  }, [task.id]);

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const completedStepsCount = Object.values(checkedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / task.guidanceSteps.length) * 100);

  return (
    <div id="detail-modal-bg" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header section */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-start relative">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="text-xxs uppercase tracking-wider bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                {task.category}
              </span>
              <span className={`text-xxs px-1.5 py-0.5 rounded font-bold uppercase ${
                task.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                task.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/25 text-slate-300'
              }`}>
                {task.priority} Priority
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-snug">{task.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5.5 w-5.5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Timeline & Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xxs text-slate-400 uppercase tracking-wider font-semibold">Filing Deadline</p>
              <p className="text-sm font-bold text-slate-800 mt-1 flex items-center">
                <span>{task.dueDate}</span>
                {task.status === 'Overdue' && (
                  <span className="ml-2 font-bold text-xxs text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                    OVERDUE
                  </span>
                )}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xxs text-slate-400 uppercase tracking-wider font-semibold">Obligation Status</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm font-bold ${
                  task.status === 'Completed' ? 'text-emerald-600' :
                  task.status === 'Overdue' ? 'text-red-500 font-bold animate-pulse' : 'text-blue-600'
                }`}>
                  {task.status}
                </span>
                {task.status === 'Completed' && task.completedDate && (
                  <span className="ml-2 text-xxs text-slate-400 font-medium">({task.completedDate})</span>
                )}
              </div>
            </div>
          </div>

          {/* Core Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-1.5 text-slate-400" />
              <span>Obligation Overview</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-blue-50/20 p-3.5 rounded-lg border border-blue-50/50">
              {task.description}
            </p>
          </div>

          {/* Consequences / Deadlines */}
          <div className="bg-rose-50/30 p-4.5 rounded-xl border border-rose-100/50 space-y-3">
            <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center">
              <AlertCircle className="h-4 w-4 mr-1.5 text-rose-600" />
              <span>Consequences of Delay</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-semibold">
              <span className="text-rose-700 font-bold">Estimated Penalty: </span>
              {task.penalty}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-600">Audit & Regulatory Risks: </span>
              {task.risks}
            </p>
          </div>

          {/* Interactive Guided Preparation Builder */}
          <div id="interactive-guidance-steps" className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
                <span>Interactive Filing Guide</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700">
                {progressPercent}% Prepared
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              {task.guidanceSteps.map((stepText, index) => (
                <div
                  key={index}
                  onClick={() => toggleStep(index)}
                  className={`flex items-start text-left p-3.5 border rounded-xl hover:bg-slate-50/40 cursor-pointer transition-all ${
                    checkedSteps[index]
                      ? 'border-emerald-200 bg-emerald-50/15'
                      : 'border-slate-100'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 mr-3">
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center transition-all border ${
                      checkedSteps[index]
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white'
                    }`}>
                      {checkedSteps[index] && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                  </div>
                  <div className="text-xs leading-relaxed text-slate-650">
                    <span className="font-bold text-slate-700 mr-1.5">Step {index + 1}:</span>
                    <span className={checkedSteps[index] ? 'line-through text-slate-400' : 'text-slate-605'}>
                      {stepText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xxs text-slate-400 text-center sm:text-left flex items-center">
            <History className="h-3.5 w-3.5 mr-1" />
            <span>Consult our AI Assistant built into the lobby for complex filing doubts.</span>
          </p>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-605 font-bold text-sm rounded-lg transition text-center cursor-pointer"
            >
              Close Info
            </button>
            <button
              id="btn-modal-complete-toggle"
              onClick={onToggleComplete}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-5 py-2 rounded-lg font-bold text-sm shadow transition duration-150 cursor-pointer ${
                task.status === 'Completed'
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>{task.status === 'Completed' ? 'Resend to Advisor' : 'Send to Advisor'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
