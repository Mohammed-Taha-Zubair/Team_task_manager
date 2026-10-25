import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TeamDetail = () => {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-4">
          <Link to="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Back to Dashboard
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Team Details</h1>
        <p className="text-gray-600 mt-2">
          Viewing team with ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{id}</span>
        </p>
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          Placeholder for Team page (member management, team tasks, and activity feed).
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
