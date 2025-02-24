const { ProductService } = require('../../services/productService');
const logger = require('../../config/logger');

const productResolver = {
  Query: {
    getTopSellingProducts: async (_, { limit }) => {
      try {
        logger.info(`Fetching top ${limit} selling products`);
        return await ProductService.getTopSellingProducts(limit);
      } catch (error) {
        logger.error(`Error fetching top selling products: ${error.message}`);
        throw error;
      }
    }
  }
};

module.exports = productResolver;