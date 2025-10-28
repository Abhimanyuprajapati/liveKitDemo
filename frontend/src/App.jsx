// import {
//   ControlBar,
//   GridLayout,
//   ParticipantTile,
//   RoomAudioRenderer,
//   useTracks,
//   RoomContext,
// } from '@livekit/components-react';
// import { Room, Track } from 'livekit-client';
// import '@livekit/components-styles';
// import { useEffect, useState } from 'react';

// const serverUrl = 'wss://demoonlive-vk11czz1.livekit.cloud';
// const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6InF1aWNrc3RhcnQtcm9vbSJ9LCJpc3MiOiJBUElUQWJlNU45aXZBc1IiLCJleHAiOjE3NjE2NzkwNDUsIm5iZiI6MCwic3ViIjoicXVpY2tzdGFydC11c2VybmFtZSJ9.QdwFHC7Spt21fdlLKINgLvUglrek_lE2tVlw4VPWcyI';

// function App() {
//    const [room] = useState(() => new Room({
   
//     adaptiveStream: true,
//     dynacast: true,
//   }));


//   useEffect(() => {
//     let mounted = true;
    
//     const connect = async () => {
//       if (mounted) {
//         await room.connect(serverUrl, token);
//       }
//     };
//     connect();

//     return () => {
//       mounted = false;
//       room.disconnect();
//     };
//   }, [room]);

//   return (
//     <>
//     <RoomContext.Provider value={room}>
//       <div data-lk-theme="default" style={{ height: '100vh' }}>
//         <MyVideoConference />
     
//         <RoomAudioRenderer />
//         <ControlBar />
//       </div>
//     </RoomContext.Provider>
//     </>
//   )
// }

// export default App



// function MyVideoConference() {
//   const tracks = useTracks(
//     [
//       { source: Track.Source.Camera, withPlaceholder: true },
//       { source: Track.Source.ScreenShare, withPlaceholder: false },
//     ],
//     { onlySubscribed: false },
//   );
//   return (
//     <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
//       <ParticipantTile />
//     </GridLayout>
//   );
// }








import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';
import axios from 'axios';

const serverUrl = 'wss://demoonlive-vk11czz1.livekit.cloud';

function App() {
  const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
  const [connected, setConnected] = useState(false);

  // Get token from backend
  const fetchToken = async () => {
    const res = await axios.get('http://localhost:3000/getToken');
    console.log('Fetched token:', res.data);
    return res.data.token;
  };

  useEffect(() => {
    let active = true;

    const connectRoom = async () => {
      try {
        const token = await fetchToken();
        await room.connect(serverUrl, token);
        await room.localParticipant.enableCameraAndMicrophone();
        setConnected(true);
        console.log('Connected to room');
      } catch (err) {
        console.error('Connection error:', err);
      }
    };

    if (active) connectRoom();

    return () => {
      active = false;
      room.disconnect();
    };
  }, [room]);

  return (
    <RoomContext.Provider value={room}>
      <div data-lk-theme="default" style={{ height: '100vh' }}>
        {connected ? (
          <>
            <MyVideoConference />
            <RoomAudioRenderer />
            <ControlBar />
            <TalkToAgentButton room={room} />
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-lg font-medium">
            Connecting to LiveKit room...
          </div>
        )}
      </div>
    </RoomContext.Provider>
  );
}

export default App;

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}

function TalkToAgentButton({ room }) {
  const handleClick = async () => {
    try {
      // Option 1: Your agent auto-joins this room (best practice)
      alert('Your LiveKit Agent will join shortly!');

      // Option 2: Trigger backend to invite an agent dynamically (optional)
      // await fetch('http://localhost:3000/invite-agent', { method: 'POST' });

    } catch (error) {
      console.error('Error contacting agent:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{cursor: 'pointer'}}
      className="absolute bottom-24 right-10 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-lg"
    >
      🤖 Talk to LiveKit Agent
    </button>
  );
}





// const handleClick = async () => {
//   try {
//     const res = await fetch('http://localhost:3000/invite-agent', { method: 'POST' });
//     const data = await res.json();
//     alert(data.message || 'Agent invited!');
//   } catch (error) {
//     console.error('Error contacting agent:', error);
//   }
// };





import express from 'express';
import cors from 'cors';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const port = 3000;

// 🧩 Generate Token (same as before)
app.get('/getToken', async (req, res) => {
  try {
    const roomName = 'quickstart-room';
    const participantName = 'quickstart-username';

    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: participantName,
      ttl: '10m',
    });

    at.addGrant({ roomJoin: true, room: roomName });
    res.json({ token: await at.toJwt() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🤖 Invite Agent dynamically
app.post('/invite-agent', async (req, res) => {
  try {
    const roomService = new RoomServiceClient(
      'https://demoonlive-vk11czz1.livekit.cloud', // 👈 your LiveKit Cloud host
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );

    await roomService.startParticipant({
      room: 'quickstart-room',
      identity: 'livekit-agent',
      agentName: 'your-agent-name', // 👈 agent name from dashboard
    });

    res.json({ message: 'Agent invited!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to invite agent' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
