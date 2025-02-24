require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./graphql/schema/typeDefs');
const resolvers = require('./graphql/resolvers');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      logger
    };
  }
});

connectDB();

server.listen().then(({ url }) => {
  logger.info(`Server ready at ${url}`);
});