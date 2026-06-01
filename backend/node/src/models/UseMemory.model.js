import {Schema} from 'mongoose'

const UserMemorySchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    content: {
        type:String,
    },
    category:{
        type: String,
        enum:['preference','allergy','dislike','goal','habit','health','other'],
    },
    sourceChatId:{
        type: mongoose.Type.Schema.ObjectId,
        ref: 'Chat'
    },
    sourceMessage:{
         type: mongoose.Type.Schema.ObjectId,
        ref: 'Message'
    },
    confidence:{
        type: Number,  
    },
    active:{
        type: Boolean,
        default: true
    },

},{timestamps: true})