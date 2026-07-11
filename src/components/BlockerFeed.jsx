import React, { useState, useEffect, useMemo, useCallback } from 'react';

const BlockerItem = React.memo(({ blocker, resolveBlocker }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { blockerId, reportedBy, description, severity, isResolved } = blocker;

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
      className={`relative p-4 mb-3 bg-white border border-gray-200 shadow-sm rounded-lg border-l-4 transition-all duration-300 transform ${
        isResolved ? 'border-gray-300' : borderColors[severity]
      } ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
    >
      <div className="flex items-start justify-between mb-1 pr-2">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={isResolved || false}
            onChange={() => resolveBlocker(blockerId)} 
            disabled={isResolved}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer focus:ring-indigo-500 disabled:opacity-50"
            title={isResolved ? 'Resolved' : 'Mark as resolved'}
          />
          <span className={`font-semibold text-sm ${isResolved ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{reportedBy}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isResolved ? 'bg-gray-100 text-gray-500' : badgeColors[severity]}`}>
          {severity}
        </span>
      </div>
      <p className={`text-sm mt-1 ${isResolved ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
    </div>
  );
}, (prev, next) => {
  return prev.blocker.blockerId === next.blocker.blockerId && prev.blocker.isResolved === next.blocker.isResolved;
});

BlockerItem.displayName = 'BlockerItem';

export const BlockerFeed = React.memo(({ blockers, resolveBlocker }) => {
  const [showResolved, setShowResolved] = useState(false);

  const { activeBlockers, resolvedBlockers } = useMemo(() => {
    if (!blockers) return { activeBlockers: [], resolvedBlockers: [] };
    
    const active = [];
    const resolved = [];
    
    blockers.forEach(b => {
      if (b.isResolved) resolved.push(b);
      else active.push(b);
    });

    const severityMap = { high: 3, medium: 2, low: 1 };
    
    active.sort((a, b) => {
      const valA = severityMap[a.severity] || 0;
      const valB = severityMap[b.severity] || 0;
      return valB - valA;
    });

    return { activeBlockers: active, resolvedBlockers: resolved };
  }, [blockers]);

  const handleExportCSV = useCallback(() => {
    if (!blockers || blockers.length === 0) return;

    const headers = ['ID', 'Reported By', 'Severity', 'Status', 'Description'];
    const rows = blockers.map(b => [
      b.blockerId,
      b.reportedBy,
      b.severity,
      b.isResolved ? 'Resolved' : 'Active',
      `"${(b.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `blockers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [blockers]);

  return (
    <div className="bg-gray-50/50 rounded-xl p-4 h-full flex flex-col gap-1 overflow-hidden">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h3 className="font-semibold text-gray-700 text-sm">
          Blockers Feed
        </h3>
        <button
          onClick={handleExportCSV}
          disabled={!blockers || blockers.length === 0}
          className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </button>
      </div>

      {!blockers || blockers.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-xl bg-white mt-2">
          No blockers reported — great meeting!
        </div>
      ) : (
        <>
          {activeBlockers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              All active blockers have been resolved!
            </div>
          ) : (
            <div className="overflow-y-auto pr-1 pb-2 flex-1 min-h-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-1">Active ({activeBlockers.length})</div>
              {activeBlockers.map(b => (
                <BlockerItem
                  key={b.blockerId}
                  blocker={b}
                  resolveBlocker={resolveBlocker}
                />
              ))}
            </div>
          )}

          {resolvedBlockers.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3 flex flex-col min-h-0">
              <button 
                onClick={() => setShowResolved(!showResolved)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors w-full text-left shrink-0"
              >
                <svg className={`w-4 h-4 transform transition-transform ${showResolved ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                Resolved Blockers ({resolvedBlockers.length})
              </button>
              
              {showResolved && (
                <div className="mt-3 overflow-y-auto pr-1 flex-1 min-h-0">
                  {resolvedBlockers.map(b => (
                    <BlockerItem
                      key={b.blockerId}
                      blocker={b}
                      resolveBlocker={resolveBlocker}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
});

BlockerFeed.displayName = 'BlockerFeed';
