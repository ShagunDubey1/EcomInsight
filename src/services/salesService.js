// const Order = require('../models/Order');
// const Product = require('../models/Product');
// const logger = require('../config/logger');

// class SalesService {
//   static async getSalesAnalytics(startDate, endDate) {
//     try {
//       logger.info(`Analytics requested for dates: ${startDate} to ${endDate}`);
      
//       const dateRange = {
//         orderDate: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate)
//         },
//         status: 'completed'
//       };

//       // First, get total revenue and completed orders
//       const revenueResult = await Order.aggregate([
//         { $match: dateRange },
//         {
//           $group: {
//             _id: null,
//             totalRevenue: { $sum: '$totalAmount' },
//             completedOrders: { $sum: 1 }
//           }
//         }
//       ]);
      
//       // Get all orders in date range
//       const orders = await Order.find(dateRange).lean();
//       logger.info(`Found ${orders.length} orders in date range`);
      
//       // Get all products (since we know there are only 10)
//       const allProducts = await Product.find().lean();
//       logger.info(`Found ${allProducts.length} products in database`);
      
//       // Create a product map for quick lookup
//       const productMap = {};
//       allProducts.forEach(product => {
//         productMap[product._id] = product;
//       });
      
//       // Calculate category revenue
//       const categoryRevenue = {};
//       let matchedProducts = 0;
//       let unmatchedProducts = 0;
      
//       orders.forEach(order => {
//         if (!order.products || !Array.isArray(order.products)) return;
        
//         order.products.forEach(item => {
//           if (!item.productId) return;
          
//           const product = productMap[item.productId];
//           if (!product) {
//             console.log(`Product not found for ID: ${item.productId} in order ${order._id}`);
//             unmatchedProducts++;
//             return;
//           }
          
//           matchedProducts++;
//           const category = product.category;
//           if (!category) return;
          
//           const itemRevenue = item.quantity * item.priceAtPurchase;
          
//           if (!categoryRevenue[category]) {
//             categoryRevenue[category] = 0;
//           }
          
//           categoryRevenue[category] += itemRevenue;
//         });
//       });
      
//       logger.info(`Matched ${matchedProducts} products, unmatched ${unmatchedProducts}`);
//       logger.info(`Category revenue:`, categoryRevenue);
      
//       // Convert to array format
//       const categoryBreakdown = Object.entries(categoryRevenue).map(([category, revenue]) => ({
//         category,
//         revenue
//       }));
      
//       // Sort by revenue (highest first)
//       categoryBreakdown.sort((a, b) => b.revenue - a.revenue);
      
//       return {
//         totalRevenue: revenueResult[0]?.totalRevenue || 0,
//         completedOrders: revenueResult[0]?.completedOrders || 0,
//         categoryBreakdown
//       };
//     } catch (error) {
//       logger.error(`Error in getSalesAnalytics:`, error);
//       throw error;
//     }
//   }
// }

const Order = require('../models/Order');
const Product = require('../models/Product');
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

      // Use $arrayElemAt instead of $unwind to avoid removing unmatched products
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

    // Get total revenue and completed orders count
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