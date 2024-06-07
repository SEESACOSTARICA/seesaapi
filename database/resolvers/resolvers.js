const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/UserSchema");
const Client = require("../../models/ClientSchema");
const Supplier = require("../../models/SupplierSchema");
const Product = require("../../models/ProductSchema");
const Invoice = require("../../models/InvoiceSchema");
const mongoose = require("mongoose");

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

    //CLIENTS
    getClients: async () => {
      try {
        let clients = await Client.find().populate(
          "productosAsignados.producto"
        );
        clients = clients.map((client) => {
          client.productosAsignados = client.productosAsignados.map((pa) => {
            // Assuming the populated 'producto' document is directly accessible
            if (pa.producto && pa.producto._id) {
              pa.producto.id = pa.producto._id.toString(); // Convert ObjectId to string
            }
            return pa;
          });
          return client;
        });
        return clients;
      } catch (error) {
        throw new Error("Error fetching clients");
      }
    },

    getClient: async (_, { id }) => {
      try {
        let client = await Client.findById(id).populate(
          "productosAsignados.producto"
        );
        if (!client) {
          throw new Error("Client not found");
        }

        // Manually adjust populated fields if necessary
        client = client.toObject({ virtuals: true }); // Convert the Mongoose document to a plain JavaScript object, applying virtuals
        client.productosAsignados = client.productosAsignados.map((pa) => {
          if (pa.producto && pa.producto._id) {
            // Ensure any ObjectId is converted to string
            pa.producto.id = pa.producto._id.toString();
          }
          return pa;
        });

        return client;
      } catch (error) {
        console.error(error);
        throw new Error("Error fetching the client");
      }
    },
    //SUPPLIERS
    getSuppliers: async () => {
      // try {
      //   const suppliers = await Supplier.find();
      //   return suppliers;
      // } catch (error) {
      //   throw new Error("Error fetching suppliers");
      // }
      try {
        let suppliers = await Supplier.find().populate(
          "productosAsignados.producto"
        );
        suppliers = suppliers.map((supplier) => {
          supplier.productosAsignados = supplier.productosAsignados.map(
            (pa) => {
              // Assuming the populated 'producto' document is directly accessible
              if (pa.producto && pa.producto._id) {
                pa.producto.id = pa.producto._id.toString(); // Convert ObjectId to string
              }
              return pa;
            }
          );
          return supplier;
        });
        return suppliers;
      } catch (error) {
        throw new Error("Error fetching clients");
      }
    },
    // Resolver to get a single client by ID
    getSupplier: async (_, { id }) => {
      try {
        let supplier = await Supplier.findById(id).populate(
          "productosAsignados.producto"
        );
        if (!supplier) {
          throw new Error("Supplier not found");
        }

        // Manually adjust populated fields if necessary
        supplier = supplier.toObject({ virtuals: true }); // Convert the Mongoose document to a plain JavaScript object, applying virtuals
        supplier.productosAsignados = supplier.productosAsignados.map((pa) => {
          if (pa.producto && pa.producto._id) {
            // Ensure any ObjectId is converted to string
            pa.producto.id = pa.producto._id.toString();
          }
          return pa;
        });

        return supplier;
      } catch (error) {
        console.error(error);
        throw new Error("Error fetching the supplier");
      }
      // try {
      //   const supplier = await Supplier.findById(id);
      //   if (!supplier) {
      //     throw new Error("Supplier not found");
      //   }
      //   return supplier;
      // } catch (error) {
      //   throw new Error("Error fetching the supplier");
      // }
    },

    getProducts: async () => {
      try {
        const products = await Product.find()
          .populate("proveedor")
          .populate("clientes");
        return products;
      } catch (error) {
        throw new Error("Error fetching products");
      }
    },

    getProductCountByCategory: async (_, { category }) => {
      try {
        const count = await Product.countDocuments({ categorias: category });
        return { count };
      } catch (error) {
        throw new Error("Error fetching product count");
      }
    },

    getAllInvoices: async () => {
      return await Invoice.find({}).populate("products client supplier");
    },
    getInvoiceById: async (_, { id }) => {
      return await Invoice.findById(id).populate("products client supplier");
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

    //CLIENT
    // Resolver to create a new client
    createClient: async (_, { input }) => {
      try {
        const newClient = new Client(input);
        const result = await newClient.save();

        return result;
      } catch (error) {
        console.log(error);
        throw new Error("Error creating a new client");
      }
    },
    // Resolver to update an existing client
    updateClient: async (_, { id, input }) => {
      try {
        const client = await Client.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true }
        );

        console.log(client);
        if (!client) {
          throw new Error("Client not found");
        }
        return client;
      } catch (error) {
        throw new Error("Error updating the client");
      }
    },

    // deleteUser: async (_, { id }, ctx) => {
    //   // Check if the medical record exists
    //   let user = await User.findById(id);

    //   if (!user) {
    //     throw new Error("El usuario no existe");
    //   }

    //   // Delete inventory
    //   try {
    //     await User.findOneAndDelete({ _id: id });
    //     return "Usuario eliminado correctamente";
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },

    // Resolver to delete a client
    deleteClient: async (_, { id }) => {
      let client = await Client.findById(id);

      if (!client) {
        throw new Error("El usuario no existe");
      }
      try {
        await Client.findOneAndDelete({ _id: id });

        return client;
      } catch (error) {
        console.log(error);
        throw new Error("Error deleting the client");
      }
    },

    //SUPPLIER

    // Resolver to create a new supplier
    createSupplier: async (_, { input }) => {
      try {
        const newSupplier = new Supplier(input);
        const result = await newSupplier.save();
        return result;
      } catch (error) {
        console.log(error);
        throw new Error("Error creating a new supplier");
      }
    },
    // Resolver to update an existing client
    updateSupplier: async (_, { id, input }) => {
      try {
        const supplier = await Supplier.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true }
        );

        if (!supplier) {
          throw new Error("Supplier not found");
        }

        return supplier;
      } catch (error) {
        throw new Error("Error updating the supplier");
      }
    },
    // Resolver to delete a client
    deleteSupplier: async (_, { id }) => {
      try {
        const supplier = await Supplier.findByIdAndRemove(id);
        if (!supplier) {
          throw new Error("Supplier not found");
        }
        return supplier;
      } catch (error) {
        throw new Error("Error deleting the supplier");
      }
    },

    // Product

    createProduct: async (_, { input }) => {
      console.log(input);
      try {
        const newProduct = new Product(input);
        await newProduct.save();
        return newProduct;
      } catch (error) {
        console.log(error);
        throw new Error("Error al crear el producto");
      }
    },

    updateProduct: async (_, { id, input }) => {
      try {
        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true }
        )
          .populate("proveedor")
          .populate("clientes");
        console.log(updatedProduct);
        return updatedProduct;
      } catch (error) {
        console.log(error);
        throw new Error("Error al actualizar el producto");
      }
    },

    deleteProduct: async (_, { id }) => {
      try {
        const product = await Product.findById(id);
        if (!product) {
          throw new Error("Producto no encontrado o ya fue eliminado");
        }

        // Encuentra todos los clientes que tienen este producto asignado
        const clients = await Client.find({
          "productosAsignados.producto": product._id,
        });

        // Eliminar la referencia del producto en cada cliente encontrado
        const updates = clients.map((client) => {
          client.productosAsignados = client.productosAsignados.filter(
            (pa) => pa.producto.toString() !== product._id.toString()
          );
          return client.save(); // Guarda los cambios en la base de datos
        });

        // Espera a que todos los clientes sean actualizados antes de continuar
        await Promise.all(updates);

        // Ahora elimina el producto de la base de datos
        await Product.findByIdAndDelete(id);
        return product;
      } catch (error) {
        console.error("Error interno al eliminar el producto", error);
        throw new Error("Error interno al eliminar el producto");
      }
    },

    createInvoice: async (_, { invoiceInput }) => {
      let total = 0;
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        // Buscar el cliente o proveedor para verificar los productos asignados
        const target = invoiceInput.client
          ? await Client.findById(invoiceInput.client).session(session)
          : await Supplier.findById(invoiceInput.supplier).session(session);

        if (!target) {
          throw new Error("Cliente o Proveedor no encontrado");
        }

        const productUpdates = invoiceInput.products.map(async (item) => {
          // Verificar si el producto está en los productos asignados del cliente/proveedor
          const isAssignedProduct = target.productosAsignados.some(
            (p) => p.producto.toString() === item.producto.toString()
          );

          if (!isAssignedProduct) {
            throw new Error(
              `Producto no asignado al Cliente/Proveedor: ${item.producto}`
            );
          }

          const producto = await Product.findById(item.producto).session(
            session
          );
          if (!producto) {
            throw new Error("Producto no encontrado");
          }

          const productoConCodigo = {
            ...producto.toObject(),
            codigo: producto.codigo,
          };

          // Asumiendo que el precio especial podría estar definido en 'productosAsignados'
          const assignedProduct = target.productosAsignados.find(
            (p) => p.producto.toString() === item.producto.toString()
          );

          console.log(assignedProduct);
          const precioVenta =
            assignedProduct && assignedProduct.precioEspecial
              ? assignedProduct.precioEspecial
              : producto.venta;

          total += precioVenta * item.cantidad;

          if (invoiceInput.type === "Compra") {
            producto.existencia += item.cantidad;
          } else {
            producto.existencia -= item.cantidad;
          }
          // if (invoiceInput.type === "Compra") {
          //   producto.existencia += item.cantidad;
          // } else {
          //   // 'Venta'
          //   producto.existencia -= item.cantidad;
          //   if (producto.existencia < 0) {
          //     throw new Error(
          //       `Existencia insuficiente para el producto ${producto.id}`
          //     );
          //   }
          // }

          await producto.save({ session });
        });

        await Promise.all(productUpdates);

        const newInvoice = new Invoice({
          ...invoiceInput,
          total,
        });

        await newInvoice.save({ session });

        await session.commitTransaction();
        session.endSession();
        return newInvoice;
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    },

    // createInvoice: async (_, { invoiceInput }) => {
    //   let total = 0;
    //   const session = await mongoose.startSession();
    //   try {
    //     session.startTransaction();

    //     const productUpdates = invoiceInput.products.map(async (item) => {
    //       const producto = await Product.findById(item.product).session(
    //         session
    //       );
    //       if (!producto) {
    //         throw new Error("Producto no encontrado");
    //       }

    //       // Asumiendo que 'venta' es el precio de venta del producto
    //       total += producto.venta * item.cantidad;

    //       if (invoiceInput.type === "Compra") {
    //         producto.existencia += item.cantidad;
    //       } else {
    //         // 'Venta'
    //         producto.existencia -= item.cantidad;
    //         if (producto.existencia < 0) {
    //           throw new Error(
    //             `Existencia insuficiente para el producto ${producto.id}`
    //           );
    //         }
    //       }

    //       await producto.save({ session });
    //     });

    //     await Promise.all(productUpdates);

    //     const newInvoice = new Invoice({
    //       ...invoiceInput,
    //       total, // Asumiendo que queremos calcular el total automáticamente
    //     });

    //     await newInvoice.save({ session });

    //     await session.commitTransaction();
    //     session.endSession();
    //     return newInvoice.populate("products.product");
    //   } catch (error) {
    //     await session.abortTransaction();
    //     session.endSession();
    //     throw error;
    //   }
    // },

    updateInvoice: async (_, { id, invoiceInput }) => {
      return await Invoice.findByIdAndUpdate(id, invoiceInput, {
        new: true,
      }).populate("products client supplier");
    },
    deleteInvoice: async (_, { id }) => {
      await Invoice.findByIdAndDelete(id);
      return "Invoice deleted successfully";
    },
  },
};

module.exports = resolvers;
