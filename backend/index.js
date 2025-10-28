import express from 'express';
import cors from 'cors';
import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

// ✅ Enable CORS for your frontend origin
app.use(cors({
  origin: 'http://localhost:5173', // React app origin
  credentials: true,
}));

// Create token function
const createToken = async () => {
  const roomName = 'quickstart-room';
  const participantName = 'quickstart-username';

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
      ttl: '10m',
    }
  );

  at.addGrant({ roomJoin: true, room: roomName });
  return await at.toJwt();
};

// Token route
app.get('/getToken', async (req, res) => {
  try {
    const token = await createToken();
    res.status(200).json({ token });
  } catch (error) {
    console.error('Token generation failed:', error);
    res.status(500).json({ error: 'Failed to create token' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});










// import express from 'express';
// import { AccessToken } from 'livekit-server-sdk';
// import dotenv from 'dotenv'
// dotenv.config()

// const createToken = async () => {
//   // If this room doesn't exist, it'll be automatically created when the first
//   // participant joins
//   const roomName = 'quickstart-room';
//   // Identifier to be used for participant.
//   // It's available as LocalParticipant.identity with livekit-client SDK
//   const participantName = 'quickstart-username';

//   const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
//     identity: participantName,
//     // Token to expire after 10 minutes
//     ttl: '10m',
//   });
//   at.addGrant({ roomJoin: true, room: roomName });

//   return await at.toJwt();
// };

// const app = express();
// const port = 3000;

// app.get('/getToken', async (req, res) => {
//   res.send(await createToken());
// });

// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });




// import express from 'express';
// import { AccessToken } from 'livekit-server-sdk';
// import dotenv from 'dotenv';
// dotenv.config();

// const createToken = async () => {
//   const roomName = 'quickstart-room';
//   const participantName = 'quickstart-username';

//   const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
//     identity: participantName,
//     ttl: '10m',
//   });
//   at.addGrant({ roomJoin: true, room: roomName });

//   return await at.toJwt();
// };

// const app = express();
// const port = 3000;

// app.get('/getToken', async (req, res) => {
//   res.send(await createToken());
// });

// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
