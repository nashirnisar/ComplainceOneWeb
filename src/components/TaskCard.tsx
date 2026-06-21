import React from 'react';
import { ComplianceTask } from '../types';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskCardProps {
  key?: string;
  task: ComplianceTask;
  onSelect: (task: ComplianceTask) => void;
  onToggleComplete: (taskId: string, e?: any) => void;
}

export default function TaskCard({ task, onSelect, onToggleComplete }: TaskCardProps) {
  // Format Date human status
  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dateStr);
    due.setHours(0,0,0,0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysRemaining(task.dueDate);

  const getStatusBadge = () => {
    if (task.status === 'Completed') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle className="h-3.5 w-3.5 mr-0.5" />
          <span>Completed</span>
        </span>
      );
    } else if (task.status === 'Overdue') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 animate-pulse">
          <AlertTriangle className="h-3.5 w-3.5 mr-0.5" />
          <span>Overdue</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <Clock className="h-3.5 w-3.5 mr-0.5" />
          <span>Pending</span>
        </span>
      );
    }
  };

  const getPriorityBadge = () => {
    const color = task.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-50 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider border ${color}`}>
        {task.priority} Priority
      </span>
    );
  };

  const getDateDisplay = () => {
    if (task.status === 'Completed') {
      return `Done on ${task.completedDate || task.dueDate}`;
    }
    if (daysLeft === 0) {
      return 'Due Today!';
    } else if (daysLeft === 1) {
      return 'Due Tomorrow!';
    } else if (daysLeft > 1) {
      return `Due in ${daysLeft} days`;
    } else {
      return `Overdue by ${Math.abs(daysLeft)} days`;
    }
  };

  const isOverdue = task.status === 'Overdue';

  const getBorderColor = () => {
    if (task.status === 'Completed') return 'border-l-4 border-l-emerald-400 border-slate-100 opacity-75';
    if (isOverdue) return 'border-l-4 border-l-red-500 border-rose-100 bg-rose-50/10';
    if (task.priority === 'High') return 'border-l-4 border-l-rose-500 border-slate-200';
    if (task.priority === 'Medium') return 'border-l-4 border-l-amber-500 border-slate-200';
    return 'border-l-4 border-l-indigo-300 border-slate-200';
  };

  return (
    <motion.div
      id={`task-card-${task.id}`}
      whileHover={{ y: -2, scale: 1.01 }}
      className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer ${getBorderColor()}`}
      onClick={() => onSelect(task)}
    >
      <div>
        <div className="flex justify-between items-start space-x-4 mb-2.5">
          <span className="text-xxs font-extrabold tracking-widest text-[#5d6088] uppercase bg-slate-100 px-2 py-0.5 rounded-md">
            {task.category}
          </span>
          <div className="flex items-center space-x-1.5 shrink-0">
            {getPriorityBadge()}
            {getStatusBadge()}
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug line-clamp-2 hover:text-[#4f46e5] transition-colors">
          {task.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1 lines-clamp-2 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
          <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`} />
          <span className={isOverdue ? 'text-red-650 font-bold' : ''}>{getDateDisplay()}</span>
        </div>

        <button
          id={`btn-complete-${task.id}`}
          onClick={(e) => onToggleComplete(task.id, e)}
          className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            task.status === 'Completed'
              ? 'bg-[#ecfdf5] hover:bg-emerald-100 text-[#047857] border border-emerald-250'
              : 'bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-150'
          }`}
        >
          {task.status === 'Completed' ? 'Sent to Advisor' : 'Send to Advisor'}
        </button>
      </div>
    </motion.div>
  );
}
