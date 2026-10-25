import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import TaskFilterTabs from '../components/team/TaskFilterTabs';
import TaskCard from '../components/team/TaskCard';
import NewTaskModal from '../components/team/NewTaskModal';
import TeamMembersList from '../components/team/TeamMembersList';
import ActivityTimeline from '../components/team/ActivityTimeline';

const TeamDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('');
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState('');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Fetch Team Details (members, name, description)
  const fetchTeam = useCallback(async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      const data = await res.json();
      if (res.ok) {
        setTeam(data);
      } else {
        setError(data.message || 'Failed to load team');
      }
    } catch (err) {
      setError(err.message || 'Error fetching team details');
    } finally {
      setLoadingTeam(false);
    }
  }, [id]);

  // Fetch Tasks with optional status filter
  const fetchTasks = useCallback(
    async (status = currentFilter) => {
      setLoadingTasks(true);
      try {
        const query = status ? `?status=${encodeURIComponent(status)}` : '';
        const res = await api.get(`/teams/${id}/tasks${query}`);
        const data = await res.json();
        if (res.ok) {
          setTasks(data);
        } else {
          setError(data.message || 'Failed to load tasks');
        }
      } catch (err) {
        setError(err.message || 'Error fetching tasks');
      } finally {
        setLoadingTasks(false);
      }
    },
    [id, currentFilter]
  );

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  useEffect(() => {
    fetchTasks(currentFilter);
  }, [fetchTasks, currentFilter]);

  const handleFilterChange = (status) => {
    setCurrentFilter(status);
  };

  const handleTaskCreated = (newTask) => {
    // If filter matches new task status or filter is all (''), add or refresh
    if (!currentFilter || currentFilter === newTask.status) {
      setTasks((prev) => [newTask, ...prev]);
    } else {
      fetchTasks(currentFilter);
    }
  };

  const handleMemberInvited = () => {
    fetchTeam();
  };

  const isAdmin = user?.role === 'admin';

  if (loadingTeam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-gray-200 rounded-2xl" />
            <div className="lg:col-span-5 h-96 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Team Not Available</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Navigation */}
      <div className="mb-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Team Top Header */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {team?.name}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {team?.members?.length || 0} {(team?.members?.length || 0) === 1 ? 'member' : 'members'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1.5 max-w-2xl">
              {team?.description || 'No description provided for this team workspace.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (Stacked on Mobile, 2 cols on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Task List + Members List */}
        <div className="lg:col-span-7 space-y-8">
          {/* Tasks Section */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Team Tasks</h2>
                <p className="text-xs text-gray-500 mt-0.5">Filter by status to review progress</p>
              </div>

              {/* Status Filter Tabs */}
              <TaskFilterTabs
                currentFilter={currentFilter}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Task list items */}
            <div className="mt-4">
              {loadingTasks ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-800">No tasks in this view</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {currentFilter
                      ? `There are currently no tasks with "${currentFilter}" status.`
                      : 'Get started by creating the first task for this team!'}
                  </p>
                  <button
                    onClick={() => setIsNewTaskModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                  >
                    + Create Task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard key={task._id} task={task} teamId={id} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Members List and Admin Invite Section */}
          <TeamMembersList
            members={team?.members || []}
            teamId={id}
            isAdmin={isAdmin}
            onMemberInvited={handleMemberInvited}
          />
        </div>

        {/* RIGHT COLUMN: Live Activity Timeline */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <ActivityTimeline teamId={id} />
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        teamId={id}
        members={team?.members || []}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default TeamDetail;
