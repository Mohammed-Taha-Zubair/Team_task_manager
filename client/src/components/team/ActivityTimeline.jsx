import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { formatRelativeTime } from '../../utils/date';

const ActivityTimeline = ({ teamId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const isMountedRef = useRef(true);

  const fetchActivity = async (isInitial = false) => {
    try {
      const res = await api.get(`/teams/${teamId}/activity`);
      if (!isMountedRef.current) return;

      const data = await res.json();
      if (res.ok) {
        setActivities(data);
        setError('');
        setLastUpdated(new Date());
      } else {
        if (isInitial) {
          setError(data.message || 'Failed to fetch activity');
        }
      }
    } catch (err) {
      if (isInitial && isMountedRef.current) {
        setError(err.message || 'Network error fetching activity');
      }
    } finally {
      if (isInitial && isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    // Initial fetch
    fetchActivity(true);

    // Poll every 5 seconds
    const intervalId = setInterval(() => {
      fetchActivity(false);
    }, 5000);

    // Clear interval on unmount
    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [teamId]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm flex flex-col h-full">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-900">Activity Timeline</h3>
          <p className="text-xs text-gray-500 mt-0.5">Real-time team collaboration log</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live (5s)
          </span>

          <button
            onClick={() => fetchActivity(false)}
            title="Refresh now"
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Timeline entries list */}
      <div className="mt-4 flex-1 overflow-y-auto max-h-[620px] pr-1">
        {loading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <svg
              className="w-10 h-10 mx-auto text-gray-300 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700">No activity recorded yet</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Actions like creating tasks, status updates, and comments will show up here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {activities.map((activity, index) => {
              const relativeTime = formatRelativeTime(activity.createdAt);
              const isFirst = index === 0;

              return (
                <div key={activity._id || index} className="relative group">
                  {/* Timeline bullet dot */}
                  <div
                    className={`absolute -left-[19px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${
                      isFirst ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-gray-400'
                    }`}
                  />

                  <div className="bg-gray-50/70 hover:bg-gray-50 border border-gray-100 rounded-xl p-3 transition-colors">
                    <p className="text-xs font-medium text-gray-800 leading-relaxed">
                      {activity.message}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-400">
                      <span>{relativeTime}</span>
                      {activity.user?.name && (
                        <span className="text-gray-500 font-medium">by {activity.user.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 text-center">
        <span className="text-[11px] text-gray-400">
          Last polled: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ActivityTimeline;
