import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL as string,
});

(async () => await redis.connect())();

redis.on("error", async (err) => {
  console.log(err);
  await redis.quit();
  await redis.connect();
});

export default redis;
