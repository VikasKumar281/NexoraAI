
// import mongoose from "mongoose";
// import dns from "node:dns";

// dns.setServers(["8.8.8.8", "1.1.1.1"]);

// const connectDb = async () => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URI);
//         console.log("db connected successfully");
//     } catch (error) {
//         console.error("db error:", error);
//     }
// };

// export default connectDb;





import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    };
}

const connectDb = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        })
        .then((mongooseInstance) => {
            console.log("db connected successfully");
            return mongooseInstance;
        })
        .catch((error) => {
            cached.promise = null;
            console.error("db error:", error);
            throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

export default connectDb;
