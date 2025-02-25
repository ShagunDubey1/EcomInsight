const { SalesService } = require("../../services/salesService");
const logger = require("../../config/logger");
const redis = require("../../config/redisClient");

const salesResolver = {
  Query: {
    getSalesAnalytics: async (_, { startDate, endDate }) => {
      const cacheKey = `salesAnalytics:${startDate}:${endDate}`;

      try {
        logger.info(`Fetching sales analytics from ${startDate} to ${endDate}`);

        // data from Redis
        if (redis.status === "ready") {
          const cachedData = await redis.get(cacheKey);
          if (cachedData) {
            logger.info("✅ Serving from cache");
            return JSON.parse(cachedData);
          }
        } else {
          logger.warn("⚠️ Redis is not available, falling back to database");
        }
      } catch (error) {
        logger.error(`⚠️ Redis Error: ${error.message}`);
      }

      try {
        logger.info("Fetching fresh analytics data from DB");
        const analyticsData = await SalesService.getSalesAnalytics(startDate, endDate);

        if (redis.status === "ready") {
          redis.setex(cacheKey, 600, JSON.stringify(analyticsData)).catch((err) =>
            logger.error(`⚠️ Failed to cache data: ${err.message}`)
          );
        }

        return analyticsData;
      } catch (error) {
        logger.error(`❌ Database Error: ${error.message}`);
        throw error;
      }
    },
  },
};

module.exports = salesResolver;
