const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8085, path: '/ws' });

const NULL_CHAR = '\0';

console.log('Mock WS (STOMP) server running on ws://localhost:8085/ws');

wss.on('connection', (ws) => {
  console.log('Client connected');
c 
  ws.subscriptions = new Map();

  ws.on('message', (message) => {
    const raw = message.toString();

    const frames = raw.split(NULL_CHAR).filter(Boolean);

    for (const frame of frames) {
      const lines = frame.split('\n');
      const command = lines[0];

      if (command === 'CONNECT' || command === 'STOMP') {
        ws.send(`CONNECTED\nversion:1.2\n\n${NULL_CHAR}`);
        console.log('Sent CONNECTED');
      } else if (command === 'SUBSCRIBE') {
        const idLine = lines.find(l => l.startsWith('id:'));
        const destLine = lines.find(l => l.startsWith('destination:'));

        if (idLine && destLine) {
          const id = idLine.split(':')[1].trim();
          const dest = destLine.split(':')[1].trim();
          ws.subscriptions.set(id, dest);
          console.log(`Subscribed: ${id} -> ${dest}`);
        }
      } else if (command === 'UNSUBSCRIBE') {
        const idLine = lines.find(l => l.startsWith('id:'));
        if (idLine) {
          const id = idLine.split(':')[1].trim();
          ws.subscriptions.delete(id);
          console.log(`Unsubscribed: ${id}`);
        }
      } else if (command === 'DISCONNECT') {
        ws.send(`RECEIPT\nreceipt-id:mock\n\n${NULL_CHAR}`);
        console.log('Sent RECEIPT for disconnect');
      } else if (command === 'SEND') {

        const destLine = lines.find(l => l.startsWith('destination:'));
        const bodyIndex = lines.findIndex(l => l === '');
        if (destLine && bodyIndex !== -1) {
          const dest = destLine.split(':')[1].trim();
          const body = lines.slice(bodyIndex + 1).join('\n').replace(NULL_CHAR, '');
          console.log(`Received client publish to ${dest}:`, body);

          try {
            const bodyObj = JSON.parse(body);

            if (dest === '/app/blockers') {
              broadcastMessage('/topic/meetings/m-1/blockers', bodyObj);
            }
          } catch (e) {

          }
        }
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function broadcastMessage(destination, bodyObj) {
  const body = JSON.stringify(bodyObj);

  for (const client of wss.clients) {
    if (client.readyState === 1 && client.subscriptions) {
      for (const [subId, subDest] of client.subscriptions.entries()) {
        if (subDest === destination) {
          const frame = `MESSAGE\nsubscription:${subId}\ndestination:${destination}\ncontent-type:application/json\n\n${body}${NULL_CHAR}`;
          client.send(frame);
        }
      }
    }
  }
}

setInterval(() => {
  const statuses = ['joined', 'left', 'idle'];
  const names = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank', 'Grace'];
  const name = names[Math.floor(Math.random() * names.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  broadcastMessage('/topic/meetings/m-1/participants', {
    userId: `u-${name.toLowerCase()}`,
    name: name,
    status: status,
    meetingId: 'm-1',
    joinedAt: new Date().toISOString(),
    hasHandRaised: Math.random() > 0.8,
    isSpeaking: Math.random() > 0.7
  });
}, 2000);

setInterval(() => {
  const severities = ['low', 'medium', 'high'];
  const severity = severities[Math.floor(Math.random() * severities.length)];

  broadcastMessage('/topic/meetings/m-1/blockers', {
    blockerId: `b-${Date.now()}`,
    reportedBy: 'System Auto-Mock',
    description: 'Auto-generated mock blocker for testing.',
    meetingId: 'm-1',
    severity: severity
  });
}, 5000);

setInterval(() => {
  broadcastMessage('/topic/meetings/m-1', {
    meetingId: 'm-1',
    title: 'Daily Standup (Live Data)',
    status: 'live',
    participantCount: Math.floor(Math.random() * 15) + 1,
    startTime: new Date().toISOString()
  });
}, 3000);
