const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const { Product, Order } = require('../models');

class OrderService {
  static async placeOrder(customerId, products) {
    try {
      let totalAmount = 0;
      let orderProducts = [];

      // Validate products and calculate total price
      for (const item of products) {
        const product = await Product.findById(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ${product.name}`);
        }

        const priceAtPurchase = product.price;
        totalAmount += priceAtPurchase * item.quantity;

        orderProducts.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase,
        });

        // Reduce stock
        product.stock -= item.quantity;
        await product.save();
      }

      // Create order
      const newOrder = new Order({
        _id: uuidv4(),
        customerId,
        products: orderProducts,
        totalAmount,
        orderDate: new Date(),
        status: "pending",
      });

      await newOrder.save();

      logger.info(`Order placed successfully: ${newOrder._id}`);
      return newOrder;
    } catch (error) {
      logger.error(`Error placing order: ${error.message}`);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  static async getOrdersByCustomer(customerId, skip, limit) {
  return await Order.find({ customerId })
    .sort({ orderDate: -1 }) 
    .skip(skip)
    .limit(limit);
  };

  static async getTotalOrdersByCustomer(customerId){
    return await Order.countDocuments({ customerId });
  };
}

module.exports = { OrderService };
