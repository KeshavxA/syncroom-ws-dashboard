import React, { useMemo, useState } from 'react';

const ParticipantRow = React.memo(({ participant }) => {
  const { name, status, joinedAt, isSpeaking, role } = participant;

  const roleColors = {
    Engineering: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    Design: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    Product: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
    Marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
  };

  const initials = name ? name.charAt(0).toUpperCase() : '?';
  const isJoined = status === 'joined';

  const timeText = useMemo(() => {
    if (!joinedAt) return '';
    const diff = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 1000);
    if (diff < 60) return `joined ${diff} seconds ago`;
    return `joined ${Math.floor(diff / 60)} mins ago`;
  }, [joinedAt]);

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-300">
      <div className="relative">
        <div className={`w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${isSpeaking ? 'ring-2 ring-green-400 dark:ring-green-500 shadow-[0_0_12px_rgba(74,222,128,0.6)]' : ''}`}>
          {initials}
        </div>
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 transition-colors duration-300 ${isJoined ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      </div>

      <div className="flex-1 min-w-0 flex justify-between items-center pr-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate transition-colors duration-300">
              {name}
            </p>
            {role && (
              <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded shadow-sm ${roleColors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                {role}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize transition-colors duration-300">
            {status} {timeText && `• ${timeText}`}
          </p>
        </div>
        {participant.hasHandRaised && (
          <span title="Hand raised" className="text-base leading-none animate-bounce" role="img" aria-label="raised hand">✋</span>
        )}
      </div>
    </div>
  );
}, (prev, next) => {

  return prev.participant.status === next.participant.status &&
    prev.participant.userId === next.participant.userId &&
    prev.participant.hasHandRaised === next.participant.hasHandRaised &&
    prev.participant.isSpeaking === next.participant.isSpeaking &&
    prev.participant.role === next.participant.role;
});

ParticipantRow.displayName = 'ParticipantRow';

export const ParticipantList = React.memo(({ participants }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParticipants = useMemo(() => {
    if (!participants) return [];
    if (!searchQuery.trim()) return participants;
    
    const query = searchQuery.toLowerCase();
    return participants.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(query);
      const roleMatch = p.role?.toLowerCase().includes(query);
      return nameMatch || roleMatch;
    });
  }, [participants, searchQuery]);

  if (!participants || participants.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl transition-colors duration-300">
        Waiting for participants...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-96 transition-colors duration-300">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col gap-3 transition-colors duration-300">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
          Live Participants ({participants.length})
        </h3>
        <input
          type="text"
          placeholder="Search by name or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
        />
      </div>
      <div className="overflow-y-auto p-2">
        {filteredParticipants.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
            No participants found matching "{searchQuery}"
          </div>
        ) : (
          filteredParticipants.map(p => (
            <ParticipantRow key={p.userId} participant={p} />
          ))
        )}
      </div>
    </div>
  );
});

ParticipantList.displayName = 'ParticipantList';
