const logger = require('../../config/logger');
const { OrderService } = require('../../services');

const orderResolver = {
  Mutation: {
    placeOrder: async (_, { customerId, products }) => {
      try {
        logger.info(`Placing order for customer: ${customerId}`);
        return await OrderService.placeOrder(customerId, products);
      } catch (error) {
        logger.error(`Error in placeOrder resolver: ${error.message}`);
        throw error;
      }
    },
  },
};

module.exports = orderResolver;
