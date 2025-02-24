const customerResolver = require('./customerResolver');
const productResolver = require('./productResolver');
const salesResolver = require('./salesResolver');

const resolvers = {
  Query: {
    ...customerResolver.Query,
    ...productResolver.Query,
    ...salesResolver.Query
  }
};

module.exports = resolvers;