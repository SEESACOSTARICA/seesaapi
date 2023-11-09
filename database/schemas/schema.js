const { gql } = require("apollo-server");

const typeDefs = gql`
  type Token {
    token: String
  }
  # El tipo User define la estructura de un usuario en el sistema
  type User {
    id: ID!
    email: String!
    fullName: String!
    password: String!
  }

  # Las entradas para crear y autenticar usuarios
  input CreateUserInput {
    email: String!
    fullName: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
  # Queries
  type Query {
    getMe(token: String!): User
  }

  type Mutation {
    # Mutaciones para la creación de usuarios y autenticación
    createUser(input: CreateUserInput): AuthPayload
    login(input: LoginInput): AuthPayload
  }
`;

module.exports = typeDefs;
