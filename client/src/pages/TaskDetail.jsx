import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TaskDetail = () => {
  const { id, taskId } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-4">
          <Link to={id ? `/teams/${id}` : '/dashboard'} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; {id ? 'Back to Team' : 'Back to Dashboard'}
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
        <div className="mt-2 text-gray-600 space-y-1">
          <p>
            Team ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{id}</span>
          </p>
          <p>
            Task ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{taskId}</span>
          </p>
        </div>
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          Placeholder for Task detail page (status editing, comments timeline).
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
