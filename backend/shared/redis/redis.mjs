// import Redis from "ioredis"

// const redis = new Redis(process.env.REDIS_URL)

// redis.on("connect", ()=>{
//     console.log("redis connected");
// });

// export default redis;


import Redis from "ioredis";

let client = null;

function createClient() {
  const instance = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 200, 3000),
    reconnectOnError: (err) => err.message.includes("READONLY"),
  });

  instance.on("connect", () => console.log("redis connected"));
  instance.on("error", (err) => console.error("redis error:", err.message));

  return instance;
}

export function getRedis() {
  if (!client) client = createClient();
  return client;
}


export default new Proxy({}, {
  get(_, prop) {
    const redis = getRedis();
    const value = redis[prop];
    return typeof value === "function" ? value.bind(redis) : value;
  },
});