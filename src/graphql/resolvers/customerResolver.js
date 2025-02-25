const logger = require('../../config/logger');
const { OrderService, CustomerService } = require('../../services');

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
    },
    getCustomerOrders: async (_, { customerId, page = 1, limit = 10 }) => {
      try {
        logger.info(`Fetching orders for customer: ${customerId}, Page: ${page}, Limit: ${limit}`);

        const skip = (page - 1) * limit;

        // Fetch orders from the database
        const orders = await OrderService.getOrdersByCustomer(customerId, skip, limit);
        const totalOrders = await OrderService.getTotalOrdersByCustomer(customerId);

        return {
          orders,
          totalOrders,
          totalPages: Math.ceil(totalOrders / limit),
          currentPage: page,
        };
      } catch (error) {
        logger.error(`Error in getCustomerOrders resolver: ${error.message}`);
        throw new Error('Failed to fetch customer orders');
      }
    },
  }
};

module.exports = customerResolver;
