const Product = require('../models/Product');
// const Order = require('../models/Order');
const logger = require('../config/logger');
const { Order } = require('../models');

class ProductService {
  static async getTopSellingProducts(limit) {
    try {
      const result = await Order.aggregate([
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.productId',
            totalSold: { $sum: '$products.quantity' }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        { $unwind: '$productInfo' }
      ]);

      return result.map(item => ({
        productId: item._id,
        name: item.productInfo.name,
        totalSold: item.totalSold
      }));
    } catch (error) {
      logger.error(`Error in getTopSellingProducts: ${error.message}`);
      throw error;
    }
  }
}

module.exports = { ProductService };
