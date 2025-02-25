const logger = require('../config/logger');
const { Order } = require('../models');

class CustomerService {
  static async getCustomerSpending(customerId) {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            customerId: customerId,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: '$customerId',
            totalSpent: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' },
            lastOrderDate: { $max: '$orderDate' }
          }
        }
      ]);

      if (!result.length) {
        throw new Error('Customer not found or has no orders');
      }

      // Check if lastOrderDate is a valid Date object
      const lastOrderDate = new Date(result[0].lastOrderDate);

      if (isNaN(lastOrderDate)) {
        throw new Error('Invalid last order date');
      }

      return {
        customerId,
        totalSpent: result[0].totalSpent,
        averageOrderValue: result[0].averageOrderValue,
        lastOrderDate: lastOrderDate.toISOString()
      };
    } catch (error) {
      logger.error(`Error in getCustomerSpending: ${error.message}`);
      throw error;
    }
  }
}

module.exports = { CustomerService };