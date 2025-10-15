export const typeDefs = `#graphql
  type Query {
    products(
      filter: ProductFilterInput
      sort: ProductSortInput
      first: Int
      after: String
    ): ProductConnection!
    productBySlug(slug: String!): Product!
    collections: [Collection!]!
  }

  type ProductConnection {
    edges: [ProductEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ProductEdge {
    cursor: String!
    node: Product!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type Product {
    id: ID!
    slug: String!
    name: String!
    description: String!
    price: Money!
    imageUrl: String!
    energyTags: [String!]!
    isPublished: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Money {
    amount: Float!
    currency: String!
  }

  type Collection {
    id: ID!
    slug: String!
    title: String!
    productCount: Int!
  }

  input ProductFilterInput {
    search: String
    tags: [String!]
    minPrice: Float
    maxPrice: Float
    isPublished: Boolean
  }

  input ProductSortInput {
    field: ProductSortField = CREATED_AT
    direction: SortDirection = DESC
  }

  enum ProductSortField {
    PRICE
    NAME
    CREATED_AT
  }

  enum SortDirection {
    ASC
    DESC
  }
`;

export default typeDefs;
