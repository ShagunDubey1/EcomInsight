const Redis = require("ioredis");

let redis;
try {
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: () => null, 
  });

  redis.on("connect", () => console.log("✅ Connected to Redis"));
  redis.on("error", (err) => {
    console.error("Redis Error:", err.message);
    redis.disconnect(); 
  });
} catch (error) {
  console.error("Redis Initialization Failed:", error.message);
  redis = null; 
}

module.exports = redis;
