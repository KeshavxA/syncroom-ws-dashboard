import React, { useState, useEffect, useRef } from 'react';
import { parseMeetingUpdate } from '../utils/messageParser';

const LiveTimer = React.memo(({ startTime }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!startTime) return;
    
    const start = new Date(startTime).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = now - start;
      if (diff < 0) {
        setElapsed('00:00');
        return;
      }
      
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const pad = (num) => num.toString().padStart(2, '0');
      
      if (hours > 0) {
        setElapsed(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      } else {
        setElapsed(`${pad(minutes)}:${pad(seconds)}`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 shadow-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
      {elapsed}
    </div>
  );
});

export const MeetingCard = React.memo(({ meeting, isSelected, onSelect, subscribe }) => {
  const [localMeeting, setLocalMeeting] = useState(meeting);
  const isMounted = useRef(true);

  useEffect(() => {
    setLocalMeeting(meeting);
  }, [meeting]);

  useEffect(() => {
    isMounted.current = true;
    if (!subscribe) return;
    
    const unsubscribe = subscribe(`/topic/meetings/${localMeeting.meetingId}`, (rawMsg) => {
      if (!isMounted.current) return;

      const update = parseMeetingUpdate(rawMsg);
      if (update) {
        setLocalMeeting((prev) => ({ ...prev, ...update }));
      }
    });

    return () => {
      isMounted.current = false;
      if (unsubscribe) unsubscribe();
    };
  }, [localMeeting.meetingId, subscribe]);

  const { title, status, participantCount, startTime } = localMeeting;

  const statusColors = {
    live: 'bg-green-100 text-green-800',
    upcoming: 'bg-blue-100 text-blue-800',
    ended: 'bg-gray-100 text-gray-800'
  };

  const statusLabel = status || 'upcoming';

  return (
    <div 
      onClick={() => onSelect(localMeeting.meetingId)}
      className={`p-4 mb-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'border-indigo-500 shadow-md bg-indigo-50/10' : 'border-transparent bg-white shadow-sm hover:border-gray-300'}`}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <h4 className="font-bold text-gray-800 text-base leading-tight">{title}</h4>
          {statusLabel === 'live' && <LiveTimer startTime={startTime} />}
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[statusLabel] || statusColors.ended}`}>
          {statusLabel}
        </span>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
        <div className={`flex items-center gap-1.5 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-sm border ${participantCount > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
          <svg className="w-3.5 h-3.5 opacity-75" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          {participantCount || 0}
        </div>
        <div className="font-medium">
          {startTime ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.meeting.meetingId === nextProps.meeting.meetingId &&
    prevProps.isSelected === nextProps.isSelected
  );
});

MeetingCard.displayName = 'MeetingCard';
