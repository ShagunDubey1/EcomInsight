const Order = require('../models/Order');
const logger = require('../config/logger');

class SalesService {
  static async getSalesAnalytics(startDate, endDate) {
  try {
    logger.info(`Analytics requested for dates: ${startDate} to ${endDate}`);

    const dateRange = {
      orderDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: 'completed'
    };

    const results = await Order.aggregate([
      { $match: dateRange },

      { $unwind: '$products' },

      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },

      {
        $addFields: {
          productDetails: { $arrayElemAt: ['$productDetails', 0] }
        }
      },

      {
        $project: {
          totalAmount: 1,
          itemRevenue: {
            $cond: {
              if: { $and: [{ $gt: ['$products.quantity', 0] }, { $gt: ['$products.priceAtPurchase', 0] }] },
              then: { $multiply: ['$products.quantity', '$products.priceAtPurchase'] },
              else: 0
            }
          },
          category: { $ifNull: ['$productDetails.category', 'Uncategorized'] },
          productId: '$products.productId',
          foundProduct: { $cond: { if: '$productDetails', then: true, else: false } }
        }
      },

      {
        $group: {
          _id: '$category',
          categoryRevenue: { $sum: '$itemRevenue' },
          totalRevenue: { $sum: '$totalAmount' },
          productsFound: { $sum: { $cond: ['$foundProduct', 1, 0] } },
          productsNotFound: { $sum: { $cond: ['$foundProduct', 0, 1] } }
        }
      },

      {
        $project: {
          _id: 0,
          category: '$_id',
          revenue: '$categoryRevenue'
        }
      },

      { $sort: { revenue: -1 } }
    ]);

    const stats = await Order.aggregate([
      { $match: dateRange },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          completedOrders: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = stats[0]?.totalRevenue || 0;
    const completedOrders = stats[0]?.completedOrders || 0;
    const categoryBreakdown = results;

    logger.info(`Processed ${completedOrders} orders`);
    logger.info(`Total revenue: ${totalRevenue}`);
    logger.info(`Categories found: ${categoryBreakdown.length}`);
    logger.info('Category breakdown:', JSON.stringify(categoryBreakdown));

    // Debugging: Check for missing product mappings
    if (categoryBreakdown.some(cat => cat.category === 'Uncategorized')) {
      const unmatchedProducts = await Order.aggregate([
        { $match: dateRange },
        { $unwind: '$products' },
        {
          $lookup: {
            from: 'products',
            localField: 'products.productId',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $match: { productDetails: { $size: 0 } } },
        {
          $group: {
            _id: null,
            missingProducts: { $addToSet: '$products.productId' }
          }
        }
      ]);

      logger.warn('Missing Product IDs:', unmatchedProducts);
    }

    return {
      totalRevenue,
      completedOrders,
      categoryBreakdown
    };
  } catch (error) {
    logger.error(`Error in getSalesAnalytics:`, error);
    throw error;
  }
}
}

module.exports = { SalesService };