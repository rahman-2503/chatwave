const express = require('express');
const { sendMessage, getHistory } = require('../controllers/messageController');

const router = express.Router();

router.post('/', sendMessage);
router.get('/history', getHistory);

module.exports = router;
