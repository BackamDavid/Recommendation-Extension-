const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    userSessionId: { type: String, required: true },
    messages: [
        {
            sender: { type: String, enum: ['user', 'bot'], required: true },
            text: { type: String, required: true },
            movies: [Object], // rapid access to recommended movies in this message
            timestamp: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', ChatSchema);
