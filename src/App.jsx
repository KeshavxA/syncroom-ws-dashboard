import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useWebSocket } from './hooks/useWebSocket';
import { useParticipants } from './hooks/useParticipants';
import { useBlockers } from './hooks/useBlockers';
import { ConnectionBanner } from './components/ConnectionBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ParticipantList } from './components/ParticipantList';
import { BlockerFeed } from './components/BlockerFeed';
import { MeetingCard } from './components/MeetingCard';

const INITIAL_MEETINGS = [
  { meetingId: 'm-1', title: 'Daily Standup', status: 'live', participantCount: 0, startTime: new Date().toISOString() },
  { meetingId: 'm-2', title: 'Sprint Planning', status: 'upcoming', participantCount: 0, startTime: new Date(Date.now() + 3600000).toISOString() },
  { meetingId: 'm-3', title: 'Design Review', status: 'upcoming', participantCount: 0, startTime: new Date(Date.now() + 7200000).toISOString() },
];

export default function App() {
  const { status, subscribe, publish } = useWebSocket();
  const [selectedMeetingId, setSelectedMeetingId] = useState(INITIAL_MEETINGS[0].meetingId);

  const selectedMeeting = INITIAL_MEETINGS.find(m => m.meetingId === selectedMeetingId) || INITIAL_MEETINGS[0];

  const participants = useParticipants({ subscribe, meetingId: selectedMeetingId });
  const { blockers, resolveBlocker } = useBlockers({ subscribe, meetingId: selectedMeetingId });

  const simulateBlocker = () => {
    publish(`/app/blockers`, {
      blockerId: `b-${Date.now()}`,
      reportedBy: 'Dev Simulate',
      description: 'The staging database is down!',
      meetingId: selectedMeetingId,
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      <ConnectionBanner status={status} />

      <div className="flex max-w-7xl mx-auto pt-8 px-4 gap-6 h-screen pb-6">
        <div className="w-72 flex-shrink-0 flex flex-col overflow-y-auto pr-2 pb-16">
          <h2 className="font-bold text-xl mb-4 text-gray-800">Meetings</h2>
          {INITIAL_MEETINGS.map(meeting => (
            <MeetingCard
              key={meeting.meetingId}
              meeting={meeting}
              isSelected={meeting.meetingId === selectedMeetingId}
              onSelect={setSelectedMeetingId}
              subscribe={subscribe}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-6 overflow-hidden pb-12">
          <ErrorBoundary>
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                <h1 className="font-bold text-lg text-gray-800">{selectedMeeting.title} — Dashboard</h1>
              </div>
              <div className="flex-1 flex p-6 gap-6 overflow-hidden bg-gray-50/30">
                <div className="w-1/2 flex flex-col h-full overflow-hidden">
                  <ParticipantList participants={participants} />
                </div>
                <div className="w-1/2 flex flex-col h-full overflow-hidden">
                  <BlockerFeed blockers={blockers} resolveBlocker={resolveBlocker} />
                </div>
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </div>

      {import.meta.env.DEV && (
        <button
          onClick={simulateBlocker}
          className="fixed bottom-6 right-6 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-full shadow-lg transition-all transform hover:scale-105 z-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Simulate Blocker
        </button>
      )}
    </div>
  );
}
