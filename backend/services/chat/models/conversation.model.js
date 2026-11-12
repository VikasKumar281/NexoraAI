import mongoose from "mongoose";
import { connection } from "../config/db.js";

const conversationSchema = new mongoose.Schema({
    title:{
        type:String,
        default:"New Chat"
    },
    userId:{
        type:String
    }
},{
    timestamps:true
})


const Conversation = connection.model("Conversation", conversationSchema);
export default Conversation;