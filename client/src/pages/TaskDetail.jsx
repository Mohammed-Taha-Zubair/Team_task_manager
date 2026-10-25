import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import TaskEditForm from '../components/task/TaskEditForm';
import TaskComments from '../components/task/TaskComments';

const TaskDetail = () => {
  const { id: routeTeamId, taskId } = useParams();

  const [task, setTask] = useState(null);
  const [team, setTeam] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Task and Comments
  const fetchTaskData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const taskRes = await api.get(`/tasks/${taskId}`);
      const taskData = await taskRes.json();

      if (!taskRes.ok) {
        setError(taskData.message || 'Failed to load task');
        setLoading(false);
        return;
      }

      setTask(taskData);

      // Determine team ID from route or task object
      const teamId = routeTeamId || taskData.team;
      if (teamId) {
        const teamRes = await api.get(`/teams/${teamId}`);
        const teamData = await teamRes.json();
        if (teamRes.ok) {
          setTeam(teamData);
        }
      }

      // Fetch comments for the task
      const commentsRes = await api.get(`/tasks/${taskId}/comments`);
      const commentsData = await commentsRes.json();
      if (commentsRes.ok) {
        setComments(commentsData);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading task');
    } finally {
      setLoading(false);
    }
  }, [taskId, routeTeamId]);

  useEffect(() => {
    fetchTaskData();
  }, [fetchTaskData]);

  const handleTaskUpdated = (updatedTask) => {
    setTask(updatedTask);
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  const effectiveTeamId = routeTeamId || task?.team;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-gray-200 rounded-2xl" />
            <div className="lg:col-span-5 h-96 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Task Unavailable</h2>
          <p className="text-sm text-gray-600 mb-6">{error || 'Task not found'}</p>
          <Link
            to={effectiveTeamId ? `/teams/${effectiveTeamId}` : '/dashboard'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            &larr; {effectiveTeamId ? 'Back to Team' : 'Back to Dashboard'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Navigation */}
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 transition">
          Dashboard
        </Link>
        <span>/</span>
        {effectiveTeamId && (
          <>
            <Link
              to={`/teams/${effectiveTeamId}`}
              className="text-indigo-600 hover:text-indigo-800 transition"
            >
              {team?.name || 'Team'}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 truncate max-w-xs">{task.title}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Link
          to={effectiveTeamId ? `/teams/${effectiveTeamId}` : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {team?.name ? team.name : 'Team'}
        </Link>
      </div>

      {/* Main Two-Column Layout (Task Edit Left, Comments Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Task Edit Form */}
        <div className="lg:col-span-7">
          <TaskEditForm
            task={task}
            teamMembers={team?.members || []}
            onTaskUpdated={handleTaskUpdated}
          />
        </div>

        {/* Right Column: Comments & Discussion */}
        <div className="lg:col-span-5">
          <TaskComments
            taskId={taskId}
            comments={comments}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
