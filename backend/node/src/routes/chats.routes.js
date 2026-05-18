import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import chatController from '../controllers/chat.controller.js';

const router = Router();

const {
  getPastChats,
  saveChat,
  getChatById,
  getChatMessages,
  sendMessage,
  streamMessage,
  deleteChat,
  updateChatTitle,
} = chatController;

router.route('/').get(protect, getPastChats);
router.route('/').post(protect, saveChat);

router.route('/:id').get(protect, getChatById);
router.route('/:id').patch(protect, updateChatTitle);
router.route('/:id').delete(protect, deleteChat);

router.route('/:id/messages').get(protect, getChatMessages);
router.route('/:id/messages').post(protect, sendMessage);
router.route('/:id/messages/stream').post(protect, streamMessage);

export default router;
