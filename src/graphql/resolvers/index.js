const customerResolver = require('./customerResolver');
const productResolver = require('./productResolver');
const salesResolver = require('./salesResolver');
const orderResolver = require("./orderResolver");

const resolvers = {
  Query: {
    ...customerResolver.Query,
    ...productResolver.Query,
    ...salesResolver.Query,
  },
   Mutation: {
    ...orderResolver.Mutation, 
  }
};

module.exports = resolvers;