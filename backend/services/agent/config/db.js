
import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("db connected successfully");
    } catch (error) {
        console.error("db error:", error);
    }
};

export default connectDb;
