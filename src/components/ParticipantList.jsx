import React, { useMemo } from 'react';

const ParticipantRow = React.memo(({ participant }) => {
  const { name, status, joinedAt } = participant;

  const initials = name ? name.charAt(0).toUpperCase() : '?';
  const isJoined = status === 'joined';

  const timeText = useMemo(() => {
    if (!joinedAt) return '';
    const diff = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 1000);
    if (diff < 60) return `joined ${diff} seconds ago`;
    return `joined ${Math.floor(diff / 60)} mins ago`;
  }, [joinedAt]);

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="relative">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
          {initials}
        </div>
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isJoined ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {name}
        </p>
        <p className="text-xs text-gray-500 truncate capitalize">
          {status} {timeText && `• ${timeText}`}
        </p>
      </div>
    </div>
  );
});

ParticipantRow.displayName = 'ParticipantRow';

export const ParticipantList = React.memo(({ participants }) => {
  if (!participants || participants.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-xl">
        Waiting for participants...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-96">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-700 text-sm">
          Live Participants ({participants.length})
        </h3>
      </div>
      <div className="overflow-y-auto p-2">
        {participants.map(p => (
          <ParticipantRow key={p.userId} participant={p} />
        ))}
      </div>
    </div>
  );
});

ParticipantList.displayName = 'ParticipantList';
