import React from 'react';

const TABS = [
  { id: 'all', label: 'All', queryValue: '' },
  { id: 'pending', label: 'Pending', queryValue: 'pending' },
  { id: 'in_progress', label: 'In Progress', queryValue: 'in_progress' },
  { id: 'done', label: 'Done', queryValue: 'done' },
];

const TaskFilterTabs = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = currentFilter === tab.queryValue;
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.queryValue)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TaskFilterTabs;
