import React, { useState, useEffect, useMemo } from 'react';

const BlockerItem = React.memo(({ blocker, dismissBlocker }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { blockerId, reportedBy, description, severity } = blocker;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const borderColors = {
    high: 'border-l-red-500',
    medium: 'border-l-orange-500',
    low: 'border-l-yellow-400'
  };

  const badgeColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-orange-100 text-orange-800',
    low: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div
      className={`relative p-4 mb-3 bg-white border border-gray-200 shadow-sm rounded-lg border-l-4 ${borderColors[severity]} transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
    >
      <button
        onClick={() => dismissBlocker(blockerId)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        &times;
      </button>
      <div className="flex items-start justify-between mb-1 pr-6">
        <span className="font-semibold text-sm text-gray-800">{reportedBy}</span>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badgeColors[severity]}`}>
          {severity}
        </span>
      </div>
      <p className="text-gray-600 text-sm mt-1">{description}</p>
    </div>
  );
}, (prev, next) => {

  return prev.blocker.blockerId === next.blocker.blockerId;
});

BlockerItem.displayName = 'BlockerItem';

export const BlockerFeed = React.memo(({ blockers, dismissBlocker }) => {
  const sortedBlockers = useMemo(() => {
    if (!blockers) return [];
    
    const severityMap = { high: 3, medium: 2, low: 1 };
    
    return [...blockers].sort((a, b) => {
      const valA = severityMap[a.severity] || 0;
      const valB = severityMap[b.severity] || 0;
      return valB - valA;
    });
  }, [blockers]);

  if (!sortedBlockers || sortedBlockers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        No blockers reported — great meeting!
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 rounded-xl p-4 overflow-y-auto h-full flex flex-col gap-1">
      <h3 className="font-semibold text-gray-700 text-sm mb-2 shrink-0">
        Active Blockers ({blockers.length})
      </h3>
      <div className="overflow-y-auto pr-1 pb-2">
        {sortedBlockers.map(b => (
          <BlockerItem
            key={b.blockerId}
            blocker={b}
            dismissBlocker={dismissBlocker}
          />
        ))}
      </div>
    </div>
  );
});

BlockerFeed.displayName = 'BlockerFeed';
