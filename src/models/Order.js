const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
   _id: { 
    type: String, 
    required: true 
  },
  customerId: {
    type: String,
    ref: 'Customer'
  },
  products: [{
    productId: {
      type: String,
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