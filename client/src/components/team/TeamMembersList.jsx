import React, { useState } from 'react';
import api from '../../api';

const TeamMembersList = ({ members = [], teamId, isAdmin, onMemberInvited }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await api.post(`/teams/${teamId}/invite`, {
        email: email.trim().toLowerCase(),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || `Invitation sent successfully to ${email}`);
        setEmail('');
        if (onMemberInvited) {
          onMemberInvited();
        }
      } else {
        setErrorMessage(data.message || 'Failed to invite user');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while inviting member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span>Team Members</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {members.length}
          </span>
        </h3>
      </div>

      {/* Members list */}
      <div className="mt-3 divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
        {members.map((member) => (
          <div key={member._id} className="py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{member.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{member.email}</p>
              </div>
            </div>
            <span
              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                member.role === 'admin'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              {member.role || 'member'}
            </span>
          </div>
        ))}
      </div>

      {/* Invite Member form (Admins only) */}
      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Invite New Member
          </h4>

          {successMessage && (
            <div className="mb-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage('');
                if (successMessage) setSuccessMessage('');
              }}
              className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition flex items-center gap-1.5 flex-shrink-0"
            >
              {loading ? (
                <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Invite'
              )}
            </button>
          </form>
          <p className="text-[11px] text-gray-400 mt-1.5">
            User must already be registered before joining the team.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamMembersList;
