import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MeetingCard } from './components/MeetingCard';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <MeetingCard />
      </div>
    </ErrorBoundary>
  );
}

export default App;
