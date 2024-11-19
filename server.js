// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');

// const app = express();
// const PORT = 5000;

// app.use(cors());

// // Route to fetch all meetings
// app.get('/api/meetings', (req, res) => { // Changed to GET
//     fs.readFile('./data/file.json', 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
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
//             console.error('Error parsing JSON:', parseError);
//             res.status(500).json({ error: 'Error parsing data' });
//         }
//     });
// });

// // Route to fetch a meeting by ID
// app.get('/api/meetings/:meetingId', (req, res) => {
//     fs.readFile('./data/file.json', 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
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
//             console.error('Error parsing JSON:', parseError);
//             res.status(500).json({ error: 'Error parsing data' });
//         }
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });




const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON body

// Route to fetch all meetings
app.get('/api/meetings', (req, res) => {
    fs.readFile('./data/file.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading file' });
            return;
        }
        try {
            const meetings = JSON.parse(data);
            const meetingIds = meetings.map((meeting) => ({
                meetingId: meeting.meetingId,
            }));
            res.json(meetingIds);
        } catch (parseError) {
            res.status(500).json({ error: 'Error parsing data' });
        }
    });
});

// Route to fetch a meeting by ID
app.get('/api/meetings/:meetingId', (req, res) => {
    fs.readFile('./data/file.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading file' });
            return;
        }
        try {
            const meetings = JSON.parse(data);
            const meeting = meetings.find(
                (m) => m.meetingId === req.params.meetingId
            );
            if (meeting) {
                res.json(meeting);
            } else {
                res.status(404).json({ error: 'Meeting not found' });
            }
        } catch (parseError) {
            res.status(500).json({ error: 'Error parsing data' });
        }
    });
});

// Route to create a new meeting
app.post('/api/meetings', (req, res) => {
    const newMeeting = req.body;

    if (!newMeeting.meetingId || !newMeeting.start || !newMeeting.end) {
        res.status(400).json({ error: 'Invalid meeting data' });
        return;
    }

    fs.readFile('./data/file.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading file' });
            return;
        }

        try {
            const meetings = JSON.parse(data);
            meetings.push(newMeeting);

            fs.writeFile('./data/file.json', JSON.stringify(meetings, null, 2), (writeErr) => {
                if (writeErr) {
                    res.status(500).json({ error: 'Error writing to file' });
                } else {
                    res.status(201).json({ message: 'Meeting added successfully' });
                }
            });
        } catch (parseError) {
            res.status(500).json({ error: 'Error parsing data' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
