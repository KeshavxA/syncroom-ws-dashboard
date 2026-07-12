import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useWebSocket } from './hooks/useWebSocket';
import { useParticipants } from './hooks/useParticipants';
import { useBlockers } from './hooks/useBlockers';
import { ConnectionBanner } from './components/ConnectionBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ParticipantList } from './components/ParticipantList';
import { BlockerFeed } from './components/BlockerFeed';
import { MeetingCard } from './components/MeetingCard';
import { MeetingProgressBar } from './components/MeetingProgressBar';

const INITIAL_MEETINGS = [
  { meetingId: 'm-1', title: 'Daily Standup', status: 'live', participantCount: 0, startTime: new Date().toISOString() },
  { meetingId: 'm-2', title: 'Sprint Planning', status: 'upcoming', participantCount: 0, startTime: new Date(Date.now() + 3600000).toISOString() },
  { meetingId: 'm-3', title: 'Design Review', status: 'upcoming', participantCount: 0, startTime: new Date(Date.now() + 7200000).toISOString() },
];

export default function App() {
  const { status, subscribe, publish } = useWebSocket();
  const [selectedMeetingId, setSelectedMeetingId] = useState(INITIAL_MEETINGS[0].meetingId);
  const [meetingSearch, setMeetingSearch] = useState('');

  const selectedMeeting = INITIAL_MEETINGS.find(m => m.meetingId === selectedMeetingId) || INITIAL_MEETINGS[0];

  const participants = useParticipants({ subscribe, meetingId: selectedMeetingId });
  const { blockers, resolveBlocker } = useBlockers({ subscribe, meetingId: selectedMeetingId });

  const reportBlocker = (description, severity) => {
    publish(`/app/blockers`, {
      blockerId: `b-${Date.now()}`,
      reportedBy: 'You',
      description,
      meetingId: selectedMeetingId,
      severity
    });
  };

  const filteredMeetings = INITIAL_MEETINGS.filter(m => {
    if (!meetingSearch.trim()) return true;
    const query = meetingSearch.toLowerCase();
    return m.title.toLowerCase().includes(query) || m.status.toLowerCase().includes(query);
  });

  const handleCopyLink = () => {
    const link = `${window.location.origin}?meeting=${selectedMeetingId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Meeting link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      <ConnectionBanner status={status} />

      <div className="flex max-w-7xl mx-auto pt-8 px-4 gap-6 h-screen pb-6">
        <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden pr-2 pb-4">
          <h2 className="font-bold text-xl mb-3 text-gray-800 dark:text-gray-200 shrink-0">Meetings</h2>
          <div className="mb-4 shrink-0">
            <input
              type="text"
              placeholder="Search meetings..."
              value={meetingSearch}
              onChange={(e) => setMeetingSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300 shadow-sm"
            />
          </div>
          <div className="overflow-y-auto flex-1 pr-1 pb-16">
            {filteredMeetings.length === 0 ? (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                No meetings found.
              </div>
            ) : (
              filteredMeetings.map(meeting => (
                <MeetingCard
                  key={meeting.meetingId}
                  meeting={meeting}
                  isSelected={meeting.meetingId === selectedMeetingId}
                  onSelect={setSelectedMeetingId}
                  subscribe={subscribe}
                />
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 overflow-hidden pb-12">
          <ErrorBoundary>
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center shrink-0 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <h1 className="font-bold text-lg text-gray-800 dark:text-gray-100">{selectedMeeting.title} — Dashboard</h1>
                  <button
                    onClick={handleCopyLink}
                    title="Copy Meeting Link"
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/40 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  </button>
                </div>
              </div>
              <MeetingProgressBar startTime={selectedMeeting.startTime} durationMinutes={15} />
              <div className="flex-1 flex p-6 gap-6 overflow-hidden bg-gray-50/30 dark:bg-black/20 transition-colors duration-300">
                <div className="w-1/2 flex flex-col h-full overflow-hidden">
                  <ParticipantList participants={participants} />
                </div>
                <div className="w-1/2 flex flex-col h-full overflow-hidden">
                  <BlockerFeed blockers={blockers} resolveBlocker={resolveBlocker} reportBlocker={reportBlocker} />
                </div>
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </div>


    </div>
  );
}
