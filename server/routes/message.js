import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/', sendMessage);
router.get('/:conversationId', getMessages);

export default router;
