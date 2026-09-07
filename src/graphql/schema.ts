export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Knowledge {
    id: ID!
    title: String!
    description: String!
    type: KnowledgeType!
    tags: [String!]!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  enum KnowledgeType {
    technology
    concept
    algorithm
    database
  }

  type Query {
    knowledge: [Knowledge!]!
    knowledgeById(id: ID!): Knowledge
  }
`