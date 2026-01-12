const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars immediately
dotenv.config();

const connectDB = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');

// Connect to DB
connectDB();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('MovieBot API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Force restart
