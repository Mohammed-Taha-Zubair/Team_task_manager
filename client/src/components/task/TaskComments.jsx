import React, { useState } from 'react';
import api from '../../api';
import { formatRelativeTime } from '../../utils/date';

const TaskComments = ({ taskId, comments = [], onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setError('Comment text cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/tasks/${taskId}/comments`, {
        text: commentText.trim(),
      });
      const data = await res.json();

      if (res.ok) {
        setCommentText('');
        if (onCommentAdded) {
          onCommentAdded(data);
        }
      } else {
        setError(data.message || 'Failed to add comment');
      }
    } catch (err) {
      setError(err.message || 'Error adding comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>Discussion & Comments</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {comments.length}
          </span>
        </h3>
      </div>

      {/* Comments List */}
      <div className="mt-5 space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium text-gray-600">No comments yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Start the conversation by posting a comment below.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const authorName = comment.user?.name || 'Team Member';
            const timeAgo = formatRelativeTime(comment.createdAt);

            return (
              <div key={comment._id} className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900">{authorName}</span>
                  </div>
                  <span className="text-gray-400 text-[11px]" title={new Date(comment.createdAt).toLocaleString()}>
                    {timeAgo}
                  </span>
                </div>
                <p className="text-xs text-gray-700 whitespace-pre-wrap pl-8">
                  {comment.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="mt-6 pt-4 border-t border-gray-100 space-y-3">
        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Leave a Comment
          </label>
          <textarea
            rows={3}
            required
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              if (error) setError('');
            }}
            placeholder="Share an update, blockers, or questions..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Posting...</span>
              </>
            ) : (
              'Post Comment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskComments;
