import mongoose from "mongoose";
import { connection } from "../config/db.js";


const userSchema=new mongoose.Schema({
    firebaseUid:{
        type:String,
        unique:true
    },
    name:String,
    email:String,
    avatar:String,
    plan:{
        type:String,
        default:"free"
    },
    credits:{
        type:Number,
        default:100
    },
    totalCredits:{
        type:Number,
        default:100
    },
    planExpiresAt:Date
},{
    timestamps:true
});

const User = connection.model("User", userSchema);

export default User;