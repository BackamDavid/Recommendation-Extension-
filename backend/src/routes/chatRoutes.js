const express = require('express');
const router = express.Router();

// ✅ MUST be an object import
const chatController = require('../controllers/chatController');

// 🔍 DEBUG LOG (TEMPORARY)
console.log('chatController keys:', Object.keys(chatController));

// ✅ ROUTES
router.post('/message', chatController.processMessage);
router.get('/history/:userSessionId', chatController.getHistory);

module.exports = router;
