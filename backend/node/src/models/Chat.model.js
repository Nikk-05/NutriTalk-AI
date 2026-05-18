import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
        index: true
    },
    title:{
        type: String,
        required: true
    },
    summary:{
        type: String,
        default: null
    },
    lastMessageAt:{
        type: Date,
        default: Date.now
    },
    threadId:{
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true })

const Chat = mongoose.model('Chat', chatSchema)
export default Chat