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
      className={`relative p-4 mb-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg border-l-4 transition-all duration-300 transform ${
        isResolved ? 'border-gray-300 dark:border-gray-600 opacity-60' : borderColors[severity]
      } ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
    >
      <div className="flex items-start justify-between mb-1 pr-2">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={isResolved || false}
            onChange={() => resolveBlocker(blockerId)} 
            disabled={isResolved}
            className="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 rounded cursor-pointer focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-300"
            title={isResolved ? 'Resolved' : 'Mark as resolved'}
          />
          <span className={`font-semibold text-sm transition-colors duration-300 ${isResolved ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'}`}>{reportedBy}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full transition-colors duration-300 ${isResolved ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400' : badgeColors[severity]}`}>
          {severity}
        </span>
      </div>
      <p className={`text-sm mt-1 transition-colors duration-300 ${isResolved ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>{description}</p>
    </div>
  );
}, (prev, next) => {
  return prev.blocker.blockerId === next.blocker.blockerId && prev.blocker.isResolved === next.blocker.isResolved;
});

BlockerItem.displayName = 'BlockerItem';

export const BlockerFeed = React.memo(({ blockers, resolveBlocker, reportBlocker }) => {
  const [showResolved, setShowResolved] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportDesc, setReportDesc] = useState('');
  const [reportSeverity, setReportSeverity] = useState('medium');

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;
    if (reportBlocker) reportBlocker(reportDesc.trim(), reportSeverity);
    setReportDesc('');
    setReportSeverity('medium');
    setIsReporting(false);
  };

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
    <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-xl p-4 h-full flex flex-col gap-1 overflow-hidden transition-colors duration-300">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm transition-colors duration-300">
          Blockers Feed
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsReporting(!isReporting)}
            className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-md transition-colors shadow-sm flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Report Blocker
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!blockers || blockers.length === 0}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export CSV
          </button>
        </div>
      </div>

      {isReporting && (
        <form onSubmit={handleSubmitReport} className="mb-3 p-3 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg shadow-sm shrink-0 transition-colors duration-300">
          <textarea
            autoFocus
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
            placeholder="What's blocking you?"
            className="w-full text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 mb-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-gray-100 transition-colors duration-300 placeholder-gray-500 dark:placeholder-gray-400"
            rows={2}
          />
          <div className="flex justify-between items-center">
            <select
              value={reportSeverity}
              onChange={(e) => setReportSeverity(e.target.value)}
              className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-300 cursor-pointer"
            >
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="high">High Severity</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsReporting(false)}
                className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-3 py-1 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reportDesc.trim()}
                className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 px-3 py-1 rounded-md transition-colors duration-300"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      )}

      {!blockers || blockers.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 mt-2 transition-colors duration-300">
          No blockers reported — great meeting!
        </div>
      ) : (
        <>
          {activeBlockers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
              All active blockers have been resolved!
            </div>
          ) : (
            <div className="overflow-y-auto pr-1 pb-2 flex-1 min-h-0">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 mt-1 transition-colors duration-300">Active ({activeBlockers.length})</div>
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
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-col min-h-0 transition-colors duration-300">
              <button 
                onClick={() => setShowResolved(!showResolved)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors w-full text-left shrink-0"
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
