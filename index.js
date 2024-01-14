const { ApolloServer, AuthenticationError } = require("apollo-server-express");
const typeDefs = require("./database/schemas/schema");
const resolvers = require("./database/resolvers/resolvers");
const dbConnection = require("./config/database");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");

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

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || "";

      const token = authHeader.split(" ")[1];

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

  app.use(cors());

  try {
    await server.start();
    server.applyMiddleware({ app, path: "/api/graphql" });

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  } catch (error) {
    console.error("Error starting the server:");
    console.error(error);
  }
};

startServer();
