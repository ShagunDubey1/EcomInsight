const logger = require('./logger');
const { Customer, Product, Order } = require('../models');

async function createIndexes() {
  try {
    logger.info('Creating MongoDB indexes...');

    await Customer.collection.createIndex(
      { email: 1 },
      { background: true }
    );
    logger.info('Created index on customers.email');

    await Product.collection.createIndex(
      { category: 1 },
      { background: true }
    );
    logger.info('Created index on products.category');

    await Promise.all([
      Order.collection.createIndex(
        { customerId: 1 },
        { background: true }
      ),
      Order.collection.createIndex(
        { orderDate: 1 },
        { background: true }
      ),
      Order.collection.createIndex(
        { status: 1 },
        { background: true }
      )
    ]);
    logger.info('Created indexes on orders collection');

    logger.info('All indexes created successfully');
  } catch (error) {
    logger.error('Error creating indexes:', error);
    throw error;
  }
}

module.exports = createIndexes;