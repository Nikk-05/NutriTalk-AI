import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import memoriesController from '../controllers/memories.controller.js';

const router = Router();
const { listMemories, updateMemory, deleteMemory } = memoriesController;

router.route('/').get(protect, listMemories);
router.route('/:id').patch(protect, updateMemory);
router.route('/:id').delete(protect, deleteMemory);

export default router;
