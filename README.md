# SyncRoom WS Dashboard

A real-time meeting dashboard built to display live participants and blocker notifications across concurrent sessions. It connects to a WebSocket backend via STOMP, automatically handling exponential backoff reconnections, topic subscriptions, and high-performance UI updates.

## Tech Stack
- **Frontend Framework**: React 18 & Vite
- **Styling**: Tailwind CSS
- **WebSockets**: `@stomp/stompjs` + `sockjs-client`
- **State Management**: React Hooks (useReducer, custom hooks, React.memo)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Mock WebSocket Server**
   In one terminal window, spin up the local mock server to simulate the STOMP endpoint:
   ```bash
   npm run mock-ws
   ```

3. **Start the Dev Server**
   In a second terminal window, run the Vite development server:
   ```bash
   npm run dev
   ```

## Environment Variables

By default, the mock server runs on `localhost:8085`. You should create a `.env.local` file in the root of your project:

```env
# .env.local
VITE_WS_URL=ws://localhost:8085/ws
```

## Folder Structure

```
src/
├── components/           # UI Components (MeetingCard, BlockerFeed, etc.)
│   ├── ConnectionBanner.jsx  # Sticky top status bar
│   ├── ErrorBoundary.jsx     # Catches WS-related render crashes
│   ├── ParticipantList.jsx   # Live presence indicators
│   └── ...
├── hooks/                # Custom React hooks
│   ├── useBlockers.js        # Blocker notifications queue state
│   ├── useParticipants.js    # Participant presence derived state
│   └── useWebSocket.js       # WebSocket global connection state
├── services/
│   └── websocketService.js   # Singleton STOMP client, reconnect logic
├── utils/
│   └── messageParser.js      # Safe parsing of incoming WS payloads
├── App.jsx               # Main layout
└── main.jsx
```

## Connecting a Real Spring Boot STOMP Backend

To point this dashboard to a real Java/Spring Boot backend instead of the mock server:

1. In your `.env.local`, update the `VITE_WS_URL` to point to your Spring endpoint (e.g., `http://localhost:8080/ws-endpoint`). 
   *Note: If you use `http(s)://`, the service will automatically fallback to using SockJS.*
2. Ensure your Spring backend allows CORS for your frontend's host (`http://localhost:5173`).
3. Ensure your Spring backend configures a simple broker matching the topics: `/topic/meetings/...` and handles the `/app/...` app destinations.

## Known Limitations / TODO

- **Token Auth**: Authentication/JWT headers are not currently passed into the STOMP `CONNECT` frame.
- **Unsubscribe on meeting change**: The frontend doesn't aggressively clean up subscriptions if the meeting list is swapped completely (though it does clean up on component unmount).
- **Scale**: The UI currently maps out 3 hardcoded meetings. Real data needs a REST fetch on initial load to seed the `INITIAL_MEETINGS` list.
