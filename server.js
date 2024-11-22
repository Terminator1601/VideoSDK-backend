



// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json()); // Middleware to parse JSON body

// // Route to fetch all meetings
// app.get('/api/meetings', (req, res) => {
//     fs.readFile('./data/file.json', 'utf8', (err, data) => {
//         if (err) {
//             res.status(500).json({ error: 'Error reading file' });
//             return;
//         }
//         try {
//             const meetings = JSON.parse(data);
//             const meetingIds = meetings.map((meeting) => ({
//                 meetingId: meeting.meetingId,
//             }));
//             res.json(meetingIds);
//         } catch (parseError) {
//             res.status(500).json({ error: 'Error parsing data' });
//         }
//     });
// });

// // Route to fetch a meeting by ID
// app.get('/api/meetings/:meetingId', (req, res) => {
//     fs.readFile('./data/file.json', 'utf8', (err, data) => {
//         if (err) {
//             res.status(500).json({ error: 'Error reading file' });
//             return;
//         }
//         try {
//             const meetings = JSON.parse(data);
//             const meeting = meetings.find(
//                 (m) => m.meetingId === req.params.meetingId
//             );
//             if (meeting) {
//                 res.json(meeting);
//             } else {
//                 res.status(404).json({ error: 'Meeting not found' });
//             }
//         } catch (parseError) {
//             res.status(500).json({ error: 'Error parsing data' });
//         }
//     });
// });

// // Route to create a new meeting
// app.post('/api/meetings', (req, res) => {
//     const newMeeting = req.body;

//     if (!newMeeting.meetingId || !newMeeting.start || !newMeeting.end) {
//         res.status(400).json({ error: 'Invalid meeting data' });
//         return;
//     }

//     fs.readFile('./data/file.json', 'utf8', (err, data) => {
//         if (err) {
//             res.status(500).json({ error: 'Error reading file' });
//             return;
//         }

//         try {
//             const meetings = JSON.parse(data);
//             meetings.push(newMeeting);

//             fs.writeFile('./data/file.json', JSON.stringify(meetings, null, 2), (writeErr) => {
//                 if (writeErr) {
//                     res.status(500).json({ error: 'Error writing to file' });
//                 } else {
//                     res.status(201).json({ message: 'Meeting added successfully' });
//                 }
//             });
//         } catch (parseError) {
//             res.status(500).json({ error: 'Error parsing data' });
//         }
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });









const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

const DATA_FILE = path.join(__dirname, "./data/file.json");

// Ensure data directory exists
const ensureDataDirectoryExists = () => {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
};

// Utility function to read/write file.json
const readData = () => {
    ensureDataDirectoryExists();
    
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([])); // Initialize with empty array
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

const writeData = (data) => {
    ensureDataDirectoryExists();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API to start a session
app.post("/sessions/start", (req, res) => {
    const { meetingId, start } = req.body;

    if (!meetingId || !start) {
        return res.status(400).send({ message: "Meeting ID and start time are required." });
    }

    const data = readData();
    const session = { meetingId, start, end: null, uniqueParticipantsCount: 0, participantArray: [] };
    data.push(session);
    writeData(data);

    res.status(201).send(session);
});

// API to add participants to a session
app.post("/sessions/:meetingId/participants", (req, res) => {
    const { meetingId } = req.params;
    const { participantId, name } = req.body;

    if (!participantId || !name) {
        return res.status(400).send({ message: "Participant ID and name are required." });
    }

    const data = readData();
    const session = data.find((s) => s.meetingId === meetingId);

    if (!session) {
        return res.status(404).send({ message: "Session not found." });
    }

    const participant = {
        participantId,
        name,
        events: { mic: [], webcam: [], screenShare: [], screenShareAudio: [], errors: [] },
        timelog: [],
    };

    session.participantArray.push(participant);
    session.uniqueParticipantsCount = session.participantArray.length;
    writeData(data);

    res.status(201).send(participant);
});

// API to log events for a participant
app.post("/sessions/:meetingId/participants/:participantId/events", (req, res) => {
    const { meetingId, participantId } = req.params;
    const { eventType, eventData } = req.body;

    const data = readData();
    const session = data.find((s) => s.meetingId === meetingId);

    if (!session) {
        return res.status(404).send({ message: "Session not found." });
    }

    const participant = session.participantArray.find((p) => p.participantId === participantId);

    if (!participant) {
        return res.status(404).send({ message: "Participant not found." });
    }

    if (!participant.events[eventType]) {
        return res.status(400).send({ message: "Invalid event type." });
    }

    participant.events[eventType].push(eventData);
    writeData(data);

    res.status(201).send(participant.events[eventType]);
});

// API to end a session
app.post("/sessions/:meetingId/end", (req, res) => {
    const { meetingId } = req.params;
    const { end } = req.body;

    const data = readData();
    const session = data.find((s) => s.meetingId === meetingId);

    if (!session) {
        return res.status(404).send({ message: "Session not found." });
    }

    session.end = end;
    writeData(data);

    res.status(200).send(session);
});

// API to fetch all sessions with pagination
app.get("/sessions", (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const data = readData();
    const startIndex = (parsedPage - 1) * parsedLimit;
    const endIndex = parsedPage * parsedLimit;

    res.status(200).send({
        total: data.length,
        sessions: data.slice(startIndex, endIndex),
    });
});



// Add this to your existing Express server file

// Add this to your existing Express server file

app.get("/sessions/:meetingId", (req, res) => {
    const { meetingId } = req.params;

    const data = readData();
    const session = data.find((s) => s.meetingId === meetingId);

    if (!session) {
        return res.status(404).send({ message: "Session not found." });
    }

    res.status(200).send(session);
});



app.get("/session/:meetingId/participant/:participantId", (req, res) => {
    const { meetingId, participantId } = req.params;  // Correct way to access parameters
  
    // Read data (assuming this function returns the data you have provided)
    const data = readData();
  
    // Find the session based on meetingId
    const session = data.find((s) => s.meetingId === meetingId);
  
    // If session is not found, return 404
    if (!session) {
      return res.status(404).send({ message: "Session not found." });
    }
  
    // Find the participant within the session
    const participant = session.participantArray.find((p) => p.participantId === participantId);
  
    // If participant is not found, return 404
    if (!participant) {
      return res.status(404).send({ message: "Participant not found." });
    }
  
    // If participant found, return the participant data
    res.status(200).send(participant);
  });
  




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});