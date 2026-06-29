import React from 'react';

export const BlockerFeed = ({ blockers }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Active Blockers
        </h3>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
          {blockers.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {blockers.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">
            No blockers reported!
          </div>
        ) : (
          blockers.map(blocker => (
            <div key={blocker.id} className="border-l-4 border-red-500 bg-red-50 p-3 rounded-r-md animate-slide-in">
              <p className="text-sm text-gray-800 mb-1">{blocker.text}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>By {blocker.author}</span>
                <span>{new Date(blocker.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
