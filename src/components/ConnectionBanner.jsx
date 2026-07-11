import React, { useRef, useEffect, useState } from 'react';
import { websocketService } from '../services/websocketService';

export function ConnectionBanner({ status }) {

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

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const darkModeToggle = (
    <button
      onClick={toggleDarkMode}
      className="fixed top-2 left-4 z-[60] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      title="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      )}
    </button>
  );

  if (status === 'connected') {
    return (
      <>
        {darkModeToggle}
        <div className="fixed top-0 left-0 right-0 z-50 h-1 flex items-center justify-center bg-transparent transition-all duration-500">
          <div className="absolute top-1 right-4 flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Live</span>
          </div>
        </div>
      </>
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
    <>
      {darkModeToggle}
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
    </>
  );
}
