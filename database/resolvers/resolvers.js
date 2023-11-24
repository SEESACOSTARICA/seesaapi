const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/UserSchema");
const Client = require("../../models/ClientSchema");

require("dotenv").config({ path: ".env" });

const createToken = (user, JWT_SECRET, expiresIn = "24h") => {
  const { id, email, fullName } = user;

  return jwt.sign({ id, email, fullName }, JWT_SECRET, { expiresIn });
};

const resolvers = {
  Query: {
    // Resolver para obtener el usuario autenticado
    getMe: async (_, __, { user }) => {
      if (!user) throw new Error("You must be logged in.");
      // Encuentra al usuario por su ID y devuelve la información relevante, excluyendo la contraseña
      const userInfo = await User.findById(user.id).select("-password");
      return userInfo;
    },
    getClients: async () => {
      try {
        const clients = await Client.find();
        return clients;
      } catch (error) {
        throw new Error("Error fetching clients");
      }
    },
    // Resolver to get a single client by ID
    getClient: async (_, { id }) => {
      try {
        const client = await Client.findById(id);
        if (!client) {
          throw new Error("Client not found");
        }
        return client;
      } catch (error) {
        throw new Error("Error fetching the client");
      }
    },
  },
  Mutation: {
    // Resolver para crear un nuevo usuario
    createUser: async (_, { input }) => {
      const { email, fullName, password } = input;

      // Verificar si ya existe un usuario con ese email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use");
      }

      // Crear y guardar el nuevo usuario
      const newUser = new User({ email, fullName, password });
      await newUser.save();

      // Crear un token JWT para el nuevo usuario
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

      return { token, user: newUser };
    },
    // Resolver para login
    login: async (_, { input }) => {
      const { email, password } = input;
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error("Invalid password");
      }

      return {
        token: createToken(user, process.env.JWT_SECRET),
        user,
      };
    },

    // Resolver to create a new client
    createClient: async (_, { input }) => {
      try {
        const newClient = new Client(input);
        const result = await newClient.save();
        return result;
      } catch (error) {
        throw new Error("Error creating a new client");
      }
    },
    // Resolver to update an existing client
    updateClient: async (_, { id, input }) => {
      try {
        const client = await Client.findByIdAndUpdate(id, input, {
          new: true,
        });
        if (!client) {
          throw new Error("Client not found");
        }
        return client;
      } catch (error) {
        throw new Error("Error updating the client");
      }
    },
    // Resolver to delete a client
    deleteClient: async (_, { id }) => {
      try {
        const client = await Client.findByIdAndRemove(id);
        if (!client) {
          throw new Error("Client not found");
        }
        return client;
      } catch (error) {
        throw new Error("Error deleting the client");
      }
    },
  },
};

module.exports = resolvers;
