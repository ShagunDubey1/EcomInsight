# Sales & Revenue Analytics API

A GraphQL API built with Node.js, MongoDB, and Apollo Server for analyzing sales data and customer behavior.

## Features

- Customer spending analysis
- Top-selling products tracking
- Sales analytics with category breakdown
- Customer can Place Order
- Get Customer Orders with Pagination
- Redis caching for analytics queries
- Winston logging integration
- Modular code structure
- Sample queries are provided in queries.grapghql file

## Prerequisites

- Node.js (v14+)
- MongoDB
- Redis (Docker setup provided)
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd sales-analytics-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/sales_analytics
```

4. Start the development server:
```bash
npm run dev
```

## Sample GraphQL Queries

### Get Customer Spending
```graphql
query GetCustomerSpending {
  getCustomerSpending(customerId: "adf96a4e-6987-4731-8798-09b109ff65c3") {
    customerId
    totalSpent
    averageOrderValue
    lastOrderDate
  }
}
```

### Get Top Selling Products
```graphql
query {
  getTopSellingProducts(limit: 5) {
    productId
    name
    totalSold
  }
}
```

### Get Sales Analytics
```graphql
query GetSalesAnalytics {
  getSalesAnalytics(
    startDate: "2024-12-01T00:00:00.000Z"
    endDate: "2025-12-31T23:59:59.999Z"
  ) {
    totalRevenue
    completedOrders
    categoryBreakdown {
      category
      revenue
    }
  }
}

```

### Place Order
```graphql
mutation {
  placeOrder(
    customerId: "7895595e-7f25-47fe-a6f8-94b31bfab736"
    products: [
      { productId: "5879d4ff-3b7c-4dc1-884d-8077f25af099", quantity: 2 }
    ]
  ) {
    _id
    customerId
    products {
      productId
      quantity
      priceAtPurchase
    }
    totalAmount
    orderDate
    status
  }
}
```

### Get Customer Order with pagination
```graphql
query {
  getCustomerOrders(customerId: "7895595e-7f25-47fe-a6f8-94b31bfab736", page: 1, limit: 5) {
    orders {
      _id
      totalAmount
      orderDate
      status
    }
    totalOrders
    totalPages
    currentPage
  }
}
```

### Docker Setup for Redis
- To run Redis locally using Docker, create a docker-compose.yml file:

  ### tart Redis:
  ```
    docker-compose up -d
  ```

  ### Verify Redis is running:
  ```
    docker ps
  ```

  ### Test Redis connection:
  ```
    docker exec -it redis_container redis-cli ping
  ```
  Expected response: PONG

## Logging

The application uses Winston for logging with the following configuration:
- Console logging for development
- File logging for production (error.log and combined.log)
- JSON format with timestamps

## Error Handling

All resolvers include proper error handling and logging. Errors are:
- Logged with appropriate context
- Propagated to the GraphQL layer
- Formatted for client consumption

## Performance Considerations

- MongoDB indexes for frequently queried fields
- Efficient aggregation pipelines
- Modular service structure for potential caching implementation

## Environment Variables

Create a `.env` file with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/sales_analytics
NODE_ENV=development
```
