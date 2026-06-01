import UserMemory from '../models/UserMemory.model.js';
import { success, notFound, serverError } from '../utils/response.utils.js';

// ── GET /memories ──────────────────────────────────────────
// Returns all active memories for the user, newest first.
const listMemories = async (req, res, next) => {
    try {
        const memories = await UserMemory.find({ userId: req.user._id, active: true })
            .sort({ createdAt: -1 })
            .select('content category confidence createdAt sourceChatId');
        return success(res, { memories });
    } catch (err) { next(err); }
};

// ── PATCH /memories/:id ────────────────────────────────────
// Edit the content of a memory.
const updateMemory = async (req, res, next) => {
    try {
        const { content, category } = req.body;
        if (!content?.trim()) return serverError(res, 'Content is required.');

        const memory = await UserMemory.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { content: content.trim(), ...(category && { category }) },
            { new: true }
        );
        if (!memory) return notFound(res, 'Memory not found.');
        return success(res, { memory });
    } catch (err) { next(err); }
};

// ── DELETE /memories/:id ───────────────────────────────────
// Soft-delete (active = false). Memory remains in DB for audit.
const deleteMemory = async (req, res, next) => {
    try {
        const memory = await UserMemory.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { active: false },
            { new: true }
        );
        if (!memory) return notFound(res, 'Memory not found.');
        return success(res, { message: 'Memory removed.' });
    } catch (err) { next(err); }
};

export default { listMemories, updateMemory, deleteMemory };
