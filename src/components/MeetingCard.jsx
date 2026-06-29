import React from 'react';
import { ParticipantList } from './ParticipantList';
import { BlockerFeed } from './BlockerFeed';
import { ConnectionBanner } from './ConnectionBanner';
import { useWebSocket } from '../hooks/useWebSocket';
import { useParticipants } from '../hooks/useParticipants';
import { useBlockers } from '../hooks/useBlockers';

const WS_URL = 'http://localhost:8080/ws'; // Adjust based on your backend

export const MeetingCard = () => {
  const { status, error, subscribe, publish } = useWebSocket(WS_URL);
  const isConnected = status === 'connected';
  
  const participants = useParticipants(subscribe, isConnected);
  const blockers = useBlockers(subscribe, isConnected);

  const handleReportBlocker = () => {
    // A little dev test action to simulate pushing a blocker
    const newBlocker = {
      id: Date.now().toString(),
      text: "Simulated blocker from UI",
      author: "Local Dev",
      timestamp: new Date().toISOString(),
      resolved: false
    };
    // If backend is ready it expects this to go to a specific endpoint, like /app/blocker.report
    publish('/app/blocker.report', newBlocker);
  };

  return (
    <>
      <ConnectionBanner status={status} error={error} />
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Syncroom Live</h1>
          <p className="text-gray-500 mt-1">Daily Standup Dashboard</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Main Stage / Board Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[500px] flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 to-white">
               <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-inner">
                     <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                     </svg>
                  </div>
                  <h2 className="text-xl font-medium text-gray-800">Meeting in progress</h2>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {isConnected 
                      ? "Real-time updates are flowing. Waiting for presenter..." 
                      : "Connecting to real-time service..."}
                  </p>
                  {isConnected && (
                    <button 
                      onClick={handleReportBlocker}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Test Blocker Report
                    </button>
                  )}
               </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-6 h-[500px]">
            <div className="flex-1 min-h-0">
              <ParticipantList participants={participants} />
            </div>
            <div className="flex-1 min-h-0">
              <BlockerFeed blockers={blockers} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
