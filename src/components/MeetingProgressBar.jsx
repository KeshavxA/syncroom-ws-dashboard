import React, { useState, useEffect } from 'react';

export const MeetingProgressBar = ({ startTime, durationMinutes = 30 }) => {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    
    const start = new Date(startTime).getTime();
    
    const update = () => {
      setElapsedMs(Math.max(0, Date.now() - start));
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  const totalMs = durationMinutes * 60 * 1000;
  const isOvertime = elapsedMs > totalMs;
  
  // Calculate percentage (capped at 100% for the fill)
  const percentage = Math.min(100, (elapsedMs / totalMs) * 100);
  
  // Format MM:SS
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-3 shrink-0 flex items-center gap-4 transition-colors duration-300">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 w-12 text-right">
        {formatTime(elapsedMs)}
      </div>
      
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${isOvertime ? 'bg-red-500' : 'bg-indigo-500'}`}
          style={{ width: `${percentage}%` }}
        />
        {isOvertime && (
          <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
        )}
      </div>
      
      <div className={`text-xs font-bold w-20 ${isOvertime ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
        {isOvertime ? `+${formatTime(elapsedMs - totalMs)} OVER` : `${durationMinutes}:00`}
      </div>
    </div>
  );
};
