const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  
  // Convert outgoing Date to ISO String
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },

  // Convert incoming ISO String to Date
  parseValue(value) {
    return new Date(value);
  },

  // Convert hard-coded AST string to Date
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

module.exports = DateScalar;
