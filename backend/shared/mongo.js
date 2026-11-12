import mongoose from "mongoose";

export function createServiceDb(globalKey, uriEnvName, label) {
    if (!global[globalKey]) {
        global[globalKey] = {
            conn: mongoose.createConnection(),
            promise: null,
        };
    }

    const cached = global[globalKey];

    const connectDb = async () => {
        if (cached.conn.readyState === 1) {
            return cached.conn;
        }

        if (!cached.promise) {
            const uri = process.env[uriEnvName] || process.env.MONGODB_URI;
            if (!uri) {
                throw new Error(`${uriEnvName} is missing`);
            }

            cached.promise = cached.conn.openUri(uri, { bufferCommands: false })
                .then((conn) => {
                    console.log(`${label} db connected`);
                    return conn;
                })
                .catch((error) => {
                    cached.promise = null;
                    console.error(`${label} db error:`, error);
                    throw error;
                });
        }

        return cached.promise;
    };

    return {
        connection: cached.conn,
        connectDb,
    };
}
