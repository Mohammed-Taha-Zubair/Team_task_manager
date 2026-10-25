import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span>! You are logged in as{' '}
          <span className="font-semibold text-indigo-600 uppercase">{user?.role}</span>.
        </p>
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700">
          Placeholder for Team Task Tracker dashboard (teams, tasks, and activity feeds).
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
