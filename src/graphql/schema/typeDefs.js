const { gql } = require('apollo-server');

const typeDefs = gql`
  scalar Date

  type CustomerSpending {
    customerId: ID!
    totalSpent: Float!
    averageOrderValue: Float!
    lastOrderDate: Date
  }

  type TopProduct {
    productId: ID!
    name: String!
    totalSold: Int!
  }

  type CategoryBreakdown {
    category: String!
    revenue: Float!
  }

  type SalesAnalytics {
    totalRevenue: Float!
    completedOrders: Int!
    categoryBreakdown: [CategoryBreakdown!]!
  }

  type ProductOrder {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }

  type Order {
    _id: ID!
    customerId: ID!
    products: [ProductOrder!]!
    totalAmount: Float!
    orderDate: Date!
    status: String!
  }

  input OrderProductInput {
    productId: ID!
    quantity: Int!
  }

  type PaginatedOrders {
    orders: [Order!]!
    totalOrders: Int!
    totalPages: Int!
    currentPage: Int!
  }

  type Mutation {
    placeOrder(customerId: ID!, products: [OrderProductInput!]!): Order!
  }

  type Query {
    getCustomerSpending(customerId: ID!): CustomerSpending!
    getTopSellingProducts(limit: Int!): [TopProduct!]!
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics!
    getCustomerOrders(customerId: ID!, page: Int!, limit: Int!): PaginatedOrders!
  }
`;

module.exports = typeDefs;