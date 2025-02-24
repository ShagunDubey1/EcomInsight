const { SalesService } = require('../../services/salesService');
const logger = require('../../config/logger');

const salesResolver = {
  Query: {
    getSalesAnalytics: async (_, { startDate, endDate }) => {
      try {
        logger.info(`Fetching sales analytics from ${startDate} to ${endDate}`);
        return await SalesService.getSalesAnalytics(startDate, endDate);
      } catch (error) {
        logger.error(`Error fetching sales analytics: ${error.message}`);
        throw error;
      }
    }
  }
};

module.exports = salesResolver;