require('dotenv').config(); 
const mongoose = require('mongoose');
const csvParser = require('csv-parser');
const fs = require('fs');
const { Order, Product, Customer } = require('./models');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    // seedOrders();
    // seedProducts();
    seedCustomers();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

const seedOrders = () => {
  const orders = [];

  fs.createReadStream('src/data/orders.csv')
    .pipe(csvParser())
    .on('data', (row) => {

      if (row.products) {
        try {
          const products = JSON.parse(row.products.replace(/'/g, '"')); 

          const order = {
            _id: row._id,
            customerId: row.customerId,
            products: products, 
            totalAmount: parseFloat(row.totalAmount),
            orderDate: new Date(row.orderDate),
            status: row.status,
          };

          orders.push(order);
        } catch (err) {
          console.error(`Error parsing products for row with _id ${row._id}:`, err);
        }
      } else {
        console.warn(`Skipping row with _id ${row._id} due to missing products field.`);
      }
    })
    .on('end', async () => {
      try {
        if (orders.length > 0) {
          await Order.insertMany(orders);
          console.log('Orders successfully seeded!');
        } else {
          console.log('No orders to insert.');
        }
        mongoose.disconnect();
      } catch (err) {
        console.error('Error inserting orders:', err);
      }
    });
};

const seedCustomers = () => {
  const customers = [];

  fs.createReadStream('src/data/customers.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      const customer = {
        _id: row._id,
        name: row.name,
        email: row.email,
        age: row.age ? parseInt(row.age) : null,
        location: row.location,
        gender: row.gender,
      };

      customers.push(customer);
    })
    .on('end', async () => {
      try {
        if (customers.length > 0) {
          await Customer.insertMany(customers);
          console.log('Customers successfully seeded!');
        } else {
          console.log('No customers to insert.');
        }
        mongoose.disconnect(); 
      } catch (err) {
        console.error('Error inserting customers:', err);
      }
    });
};

const seedProducts = () => {
  const products = [];

  fs.createReadStream('src/data/products.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      const product = {
        _id: row._id,
        name: row.name,
        category: row.category,
        price: parseFloat(row.price),
        stock: row.stock ? parseInt(row.stock) : 0, 
      };

      products.push(product);
    })
    .on('end', async () => {
      try {
        if (products.length > 0) {
          await Product.insertMany(products);
          console.log('Products successfully seeded!');
        } else {
          console.log('No products to insert.');
        }
        mongoose.disconnect();
      } catch (err) {
        console.error('Error inserting products:', err);
      }
    });
};