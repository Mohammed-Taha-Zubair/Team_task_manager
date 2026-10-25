import React from 'react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/20',
    dot: 'bg-amber-400',
  },
  in_progress: {
    label: 'In Progress',
    classes: 'bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-500/20',
    dot: 'bg-blue-500',
  },
  done: {
    label: 'Done',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/20',
    dot: 'bg-emerald-500',
  },
};

const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    classes: 'bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/20',
    dot: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
