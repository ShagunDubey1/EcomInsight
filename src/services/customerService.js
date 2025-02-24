const Customer = require('../models/Customer');
const Order = require('../models/Order');
const logger = require('../config/logger');

class CustomerService {
  static async getCustomerSpending(customerId) {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            customerId: mongoose.Types.ObjectId(customerId),
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

      return {
        customerId,
        totalSpent: result[0].totalSpent,
        averageOrderValue: result[0].averageOrderValue,
        lastOrderDate: result[0].lastOrderDate
      };
    } catch (error) {
      logger.error(`Error in getCustomerSpending: ${error.message}`);
      throw error;
    }
  }
}

module.exports = { CustomerService };