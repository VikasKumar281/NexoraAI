import mongoose from "mongoose";
import { connection } from "../config/db.js";

const fileSchema = new mongoose.Schema({
    name:String,
    content:String
},{
    _id:false
})

const artifactSchema = new mongoose.Schema({
    id:Number,
    type:String,
    title:String,
    files:[fileSchema],

},{
    _id:false
})

const messageSchema = new mongoose.Schema({
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation"
    },
    role:{
        type:String,
        enum:["user","assistant"]
    },
    content:String,
    images:[String],
    artifacts:[artifactSchema]
},{
    timestamps:true
})


const Message = connection.model("Message", messageSchema);
export default Message;