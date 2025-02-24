const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.UUID,
    ref: 'Customer'
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.UUID,
      ref: 'Product'
    },
    quantity: Number,
    priceAtPurchase: Number
  }],
  totalAmount: Number,
  orderDate: Date,
  status: String
});

module.exports = mongoose.model('Order', orderSchema);