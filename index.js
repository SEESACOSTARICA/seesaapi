const { ApolloServer, AuthenticationError } = require("apollo-server");
const typeDefs = require("./database/schemas/schema");
const resolvers = require("./database/resolvers/resolvers");
const dbConnection = require("./config/database");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: "./config/.env" });

dbConnection();

const getUserFromToken = async (token, JWT_SECRET) => {
  try {
    if (token) {
      return jwt.verify(token, JWT_SECRET);
    }
    return null;
  } catch (error) {
    throw new AuthenticationError("Session invalid or expired");
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.split(" ")[1]; // Asume que el formato es Bearer <token>

    if (token) {
      const user = await getUserFromToken(token, process.env.JWT_SECRET);
      return { user };
    }
    return {};
  },
  introspection: true, // Modo introspección, desactivar en producción
  formatError: (error) => {
    // Formato de errores personalizado
    return error;
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
