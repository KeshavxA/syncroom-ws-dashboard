import React from 'react';

export const ParticipantList = ({ participants }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Participants ({participants.length})
      </h3>
      <div className="space-y-3">
        {participants.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No participants yet</p>
        ) : (
          participants.map(p => (
            <div key={p.id} className="flex items-center gap-3 group transition-colors hover:bg-gray-50 p-2 rounded-md -mx-2">
              <div className="relative">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  p.status === 'active' ? 'bg-green-500' : 
                  p.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                }`}></span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{p.name}</p>
                <p className="text-xs text-gray-500 capitalize">{p.status || 'Active'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
