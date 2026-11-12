import Redis from "ioredis";

let client = null;

function getClient() {
    if (!client) {
        client = new Redis(process.env.REDIS_URL, {
            family: 0,
            maxRetriesPerRequest: 2,
            retryStrategy: (times) => Math.min(times * 200, 3000),
        });
        client.on("connect", () => console.log("agent redis connected"));
        client.on("error", (error) => console.error("agent redis error:", error.message));
    }
    return client;
}

const redis = new Proxy({}, {
    get(_target, prop) {
        const instance = getClient();
        const value = instance[prop];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});

export default redis;
