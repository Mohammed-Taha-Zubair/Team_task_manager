import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

const TaskCard = ({ task, teamId }) => {
  return (
    <Link
      to={`/teams/${teamId}/tasks/${task._id}`}
      className="group block bg-white rounded-xl border border-gray-200/90 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {task.title}
        </h4>
        <StatusBadge status={task.status} className="flex-shrink-0" />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600">
            {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
          </div>
          <span className="truncate max-w-[140px]">
            {task.assignedTo?.name ? task.assignedTo.name : 'Unassigned'}
          </span>
        </div>

        <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
          Details
          <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default TaskCard;
