const { CustomerService } = require('../../services/customerService');
const logger = require('../../config/logger');

const customerResolver = {
  Query: {
    getCustomerSpending: async (_, { customerId }) => {
      try {
        logger.info(`Fetching spending data for customer: ${customerId}`);
        return await CustomerService.getCustomerSpending(customerId);
      } catch (error) {
        logger.error(`Error fetching customer spending: ${error.message}`);
        throw error;
      }
    }
  }
};

module.exports = customerResolver;
