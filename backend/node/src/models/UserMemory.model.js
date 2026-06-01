import mongoose from 'mongoose';

const userMemorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: ['preference', 'allergy', 'dislike', 'goal', 'habit', 'health', 'other'],
        default: 'other',
        index: true,
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.7,
    },
    sourceChatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        default: null,
    },
    active: {
        type: Boolean,
        default: true,
        index: true,
    },
}, { timestamps: true });

userMemorySchema.index({ userId: 1, active: 1, createdAt: -1 });

const UserMemory = mongoose.model('UserMemory', userMemorySchema);
export default UserMemory;
