import React from 'react';

export const ConnectionBanner = ({ status, error }) => {
  if (status === 'connected') {
    return (
      <div className="bg-emerald-500 text-white text-sm py-1 px-4 text-center animate-fade-out opacity-0 transition-opacity duration-1000">
        Connected to server
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-500 text-white text-sm py-2 px-4 text-center">
        Connection error: {error || 'Disconnected from server'}
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="bg-yellow-500 text-white text-sm py-2 px-4 text-center">
        Connecting to live meeting...
      </div>
    );
  }

  return (
    <div className="bg-gray-500 text-white text-sm py-2 px-4 text-center">
      Disconnected
    </div>
  );
};
