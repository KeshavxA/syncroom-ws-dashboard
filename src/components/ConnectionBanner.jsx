import React, { useRef, useEffect, useState } from 'react';
import { websocketService } from '../services/websocketService';

export function ConnectionBanner({ status }) {
  // track attempt count internally with useRef counting how long we've been in 'reconnecting'
  const attemptCountRef = useRef(0);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (status === 'reconnecting') {
      attemptCountRef.current += 1;
      setDisplayCount(attemptCountRef.current);
    } else if (status === 'connected') {
      attemptCountRef.current = 0;
      setDisplayCount(0);
    }
  }, [status]);

  if (status === 'connected') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 h-1 flex items-center justify-center bg-transparent transition-all duration-500">
        <div className="absolute top-1 right-4 flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500 font-medium">Live</span>
        </div>
      </div>
    );
  }

  const handleReconnect = () => {
    websocketService.connect();
  };

  const getBannerContent = () => {
    switch (status) {
      case 'connecting':
        return {
          bg: 'bg-yellow-500',
          text: 'Connecting to server...',
          showButton: false
        };
      case 'reconnecting':
        return {
          bg: 'bg-orange-500',
          text: `Reconnecting... (attempt ${displayCount})`,
          showButton: false
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'Connection lost — ',
          showButton: true
        };
      case 'disconnected':
      default:
        return {
          bg: 'bg-gray-500',
          text: 'Disconnected',
          showButton: false
        };
    }
  };

  const { bg, text, showButton } = getBannerContent();

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 py-1 text-center text-white text-sm font-medium transition-all duration-300 ${bg}`}>
      <span>{text}</span>
      {showButton && (
        <button 
          onClick={handleReconnect}
          className="underline ml-1 hover:text-red-100 font-bold"
        >
          Reconnect
        </button>
      )}
    </div>
  );
}
