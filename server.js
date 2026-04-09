require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigin = process.env.FRONTEND_URL;

        if (!origin) return callback(null, true);
        if (allowedOrigin && origin === allowedOrigin) return callback(null, true);
        if (!isProduction) return callback(null, true);

        return callback(new Error('CORS origin not allowed'));
    },
    credentials: true
}));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// 🔗 MongoDB connection
let isDbConnected = false;

async function connectToMongo() {
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI is not defined. Set MONGO_URI in environment variables.');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        isDbConnected = true;
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        isDbConnected = false;
        console.error('❌ MongoDB connection failed:', err.message);
    }
}

mongoose.connection.on('error', (err) => {
    isDbConnected = false;
    console.error('❌ MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    isDbConnected = false;
    console.error('⚠️ MongoDB disconnected');
});

connectToMongo();

// 📦 Schema for player data
const playerSchema = new mongoose.Schema({
    playerId: String,
    moves: Number,
    playedAt: {
        type: Date,
        default: Date.now
    }
});

const Player = mongoose.model('Player', playerSchema);

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 📨 API to save player data
app.post('/save', async (req, res) => {
    const { playerId, moves } = req.body;

    if (!isDbConnected) {
        return res.status(503).json({ error: 'Database unavailable' });
    }

    if (typeof playerId !== 'string' || playerId.trim() === '') {
        return res.status(400).json({ error: 'Invalid playerId' });
    }

    const parsedMoves = Number(moves);
    if (!Number.isInteger(parsedMoves) || parsedMoves < 0) {
        return res.status(400).json({ error: 'Invalid moves' });
    }

    // ⬇️ Add this line to log the incoming data
    console.log('🔥 Received:', playerId, parsedMoves);

    try {
        const newPlayer = new Player({ playerId, moves: parsedMoves });
        await newPlayer.save();

        // ⬇️ Add this line to confirm saving
        console.log('✅ Saved to DB');

        res.status(200).json({ message: 'Data saved successfully' });
    } catch (err) {
        // ⬇️ Already here, shows error if saving fails
        console.error('❌ Save error:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// 🚀 Start the server
const PORT = process.env.PORT;

if (!PORT) {
    console.error('❌ PORT is not defined. Set PORT environment variable before starting the server.');
    process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
