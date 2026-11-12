import mongoose from "mongoose";
import { connection } from "../config/db.js";

const conversationSchema = new mongoose.Schema({
    title:{
        type:String,
        default:"New Chat"
    },
    userId:{
        type:String
    },
    pinned:{
        type:Boolean,
        default:false
    },
    pinnedAt:{
        type:Date,
        default:null
    },
    archived:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})


const Conversation = connection.model("Conversation", conversationSchema);
export default Conversation;