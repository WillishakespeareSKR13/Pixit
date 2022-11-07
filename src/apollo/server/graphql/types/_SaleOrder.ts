import { gql } from 'apollo-server-micro';

const typeDefs = gql`
  #######################TYPES#######################

  type SaleOrder {
    id: ID
    stripeId: String
    secret: String
    number: String
    product: [Products]
    board: [BoardSelected]
    customer: User
    store: Store
    quantity: Int
    ticket: String
    total: Float
    currency: String
    sheets: Int
    typePayment: String
    status: String
    colorsaleorder: [ColorSaleOrder]
    createdAt: String
  }

  type ResponseEmail {
    message: String
  }

  #######################INPUT#######################
  input InputProductQuantity {
    id: ID
    quantity: Int
  }

  input InputSaleOrder {
    product: [String]
    board: [InputBoardSelected]
    store: String
    ticket: String
    customer: String
    sheets: Int
    typePayment: String
    colorsaleorder: [String]
    price: Float
    productQuantity: [InputProductQuantity]
  }

  input FilterSaleOrder {
    id: ID
    stripeId: String
    secret: String
    product: [String]
    board: [String]
    customer: String
    store: String
    quantity: Int
    total: Int
    currency: String
    status: String
    colorsaleorder: [String]
  }

  input SortSaleOrder {
    id: Int
    stripeId: Int
    secret: Int
    product: Int
    board: Int
    customer: Int
    store: Int
    quantity: Int
    total: Int
    currency: Int
    status: Int
    colorsaleorder: Int
    createdAt: Int
    updatedAt: Int
  }

  #######################QUERY#######################

  extend type Query {
    getSaleOrders(
      filter: FilterSaleOrder
      sort: SortSaleOrder
      limit: Int
    ): [SaleOrder]
    getSaleOrderById(id: ID!): SaleOrder
    paySaleOrder(id: ID!): SaleOrder
    paySaleOrderCash(id: ID!): SaleOrder
  }
  #####################MUTACION######################
  extend type Mutation {
    newSaleOrder(input: InputSaleOrder): SaleOrder
    newSaleOrderCash(input: InputSaleOrder): SaleOrder
    updateSaleOrder(id: ID!, input: InputSaleOrder): SaleOrder
    sendMailSaleOrder(id: ID!, email: String!): ResponseEmail
  }
`;

export default typeDefs;
