const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());

// Route to fetch all meetings
app.get('/api/meetings', (req, res) => { // Changed to GET
    fs.readFile('./data/file.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
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
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({ error: 'Error parsing data' });
        }
    });
});

// Route to fetch a meeting by ID
app.get('/api/meetings/:meetingId', (req, res) => {
    fs.readFile('./data/file.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
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
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({ error: 'Error parsing data' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
