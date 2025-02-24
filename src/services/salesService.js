// const Order = require('../models/Order');
const Product = require('../models/Product');
const logger = require('../config/logger');
const { Order } = require('../models');

class SalesService {
  static async getSalesAnalytics(startDate, endDate) {
    try {
      const dateRange = {
        orderDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        status: 'completed'
      };

      const [revenue, categoryBreakdown] = await Promise.all([
        // Get total revenue and completed orders
        Order.aggregate([
          { $match: dateRange },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
              completedOrders: { $sum: 1 }
            }
          }
        ]),

        // Get revenue breakdown by category
        Order.aggregate([
          { $match: dateRange },
          { $unwind: '$products' },
          {
            $lookup: {
              from: 'products',
              localField: 'products.productId',
              foreignField: '_id',
              as: 'productInfo'
            }
          },
          { $unwind: '$productInfo' },
          {
            $group: {
              _id: '$productInfo.category',
              revenue: {
                $sum: { $multiply: ['$products.quantity', '$products.priceAtPurchase'] }
              }
            }
          }
        ])
      ]);

      return {
        totalRevenue: revenue[0]?.totalRevenue || 0,
        completedOrders: revenue[0]?.completedOrders || 0,
        categoryBreakdown: categoryBreakdown.map(item => ({
          category: item._id,
          revenue: item.revenue
        }))
      };
    } catch (error) {
      logger.error(`Error in getSalesAnalytics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = { SalesService };