const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/UserSchema");
const Client = require("../../models/ClientSchema");
const Supplier = require("../../models/SupplierSchema");
const Product = require("../../models/ProductSchema");
const Invoice = require("../../models/InvoiceSchema");
const mongoose = require("mongoose");
const { GraphQLUpload } = require("graphql-upload");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

require("dotenv").config({ path: ".env" });

const createToken = (user, JWT_SECRET, expiresIn = "24h") => {
  const { id, email, fullName } = user;

  return jwt.sign({ id, email, fullName }, JWT_SECRET, { expiresIn });
};

const resolvers = {
  Upload: GraphQLUpload,
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
      return await Invoice.find({})
        .populate({
          path: "products",
          populate: {
            path: "producto",
            model: "Producto",
          },
        })
        .populate("client supplier");
    },
    getInvoiceById: async (_, { id }) => {
      return await Invoice.findById(id)
        .populate({
          path: "products",
          populate: {
            path: "producto",
            model: "Producto",
          },
        })
        .populate("client supplier");
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

    async subirClientesDesdeExcel(_, { archivo }) {
      const { createReadStream, filename } = await archivo;

      if (!createReadStream) {
        throw new Error("El archivo no es válido o no contiene un stream");
      }

      const uploadDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);

      await new Promise((resolve, reject) => {
        const stream = createReadStream();
        const out = fs.createWriteStream(filePath);
        stream.pipe(out);
        out.on("finish", resolve);
        out.on("error", reject);
      });

      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const clientesExcel = XLSX.utils.sheet_to_json(sheet);

      const cedulas = clientesExcel.map((cliente) =>
        String(cliente.Cedula).trim()
      );

      // Busca los clientes existentes en la base de datos por sus cédulas
      const clientesExistentes = await Client.find({
        cedula: { $in: cedulas },
      });
      const cedulasExistentes = new Set(
        clientesExistentes.map((cliente) => cliente.cedula)
      );

      for (const clienteData of clientesExcel) {
        const cedula = String(clienteData.Cedula).trim();

        // Solo procede si la cédula no está en la base de datos
        if (!cedulasExistentes.has(cedula)) {
          try {
            const {
              Apellido1 = "",
              Apellido2 = "",
              Correo = "",
              Provincia = 0,
              Canton = 0,
              Distrito = 0,
              Barrio = 0,
              Direccion = "",
              Area = 0,
              Telefono = "",
              Copia = "",
              Nombre = "",
              razonSocial = "",
              nombreComercial = "",
              tipoIdentificacion = "",
              Cedula = "",
              Codigo = "",
              correosElectronicos = "",
              tipoDocumento = "",
              correoEnvioFE = "",
              destinatarioEnvioFE = "",
              detallesGenerales = "",
              condicionVenta = "",
              plazo = null,
              limiteCredito = null,
              moneda = "",
              metodoPago = "",
              formaEntrega = "",
              transporte = "",
              destino = "",
              detalleObservacion = "",
              cobrarEnvio = null,
              telefonoOficina1 = "",
              provinciaOficina1 = "",
              cantonOficina1 = "",
              distritoOficina1 = "",
              detalleOficina1 = "",
              exonerado = null,
              numeroAutorizacion = "",
              fechaAutorizacion = null,
              fechaVencimiento = null,
              porcentajeExoneracion = null,
              institucionEmisora = "",
              marcaImpresora1 = "",
              modeloImpresora1 = "",
              nombreContactoPagos = "",
              telefonoContactoPagos = "",
              celularContactoPagos = "",
              correoElectronicoContactoPagos = "",
              nombreContactoCompras = "",
              telefonoContactoCompras = "",
              celularContactoCompras = "",
              correoElectronicoContactoCompras = "",
            } = clienteData;

            const correosArray = correosElectronicos
              ? correosElectronicos.split(",")
              : [];
            const oficinasArray =
              telefonoOficina1 ||
              provinciaOficina1 ||
              cantonOficina1 ||
              distritoOficina1 ||
              detalleOficina1
                ? [
                    {
                      telefono: telefonoOficina1,
                      provincia: provinciaOficina1,
                      canton: cantonOficina1,
                      distrito: distritoOficina1,
                      detalle: detalleOficina1,
                    },
                  ]
                : [];
            const impresorasArray =
              marcaImpresora1 || modeloImpresora1
                ? [{ marca: marcaImpresora1, modelo: modeloImpresora1 }]
                : [];
            const contactoPagos = {
              nombre: nombreContactoPagos,
              telefono: telefonoContactoPagos,
              celular: celularContactoPagos,
              correoElectronico: correoElectronicoContactoPagos,
            };
            const contactoCompras = {
              nombre: nombreContactoCompras,
              telefono: telefonoContactoCompras,
              celular: celularContactoCompras,
              correoElectronico: correoElectronicoContactoCompras,
            };

            const nuevoCliente = new Client({
              Apellido1,
              Apellido2,
              Correo,
              Provincia,
              Canton,
              Distrito,
              Barrio,
              Direccion,
              Area,
              Telefono,
              Copia,
              Nombre,
              razonSocial,
              nombreComercial,
              tipoIdentificacion,
              Cedula,
              Codigo,
              correosElectronicos: correosArray,
              tipoDocumento,
              correoEnvioFE,
              destinatarioEnvioFE,
              detallesGenerales,
              condicionVenta,
              plazo,
              limiteCredito,
              moneda,
              metodoPago,
              formaEntrega,
              transporte,
              destino,
              detalleObservacion,
              cobrarEnvio,
              oficinas: oficinasArray,
              exonerado,
              numeroAutorizacion,
              fechaAutorizacion,
              fechaVencimiento,
              porcentajeExoneracion,
              institucionEmisora,
              impresoras: impresorasArray,
              contactoPagos,
              contactoCompras,
            });

            await nuevoCliente.save();
          } catch (error) {
            console.error("Error procesando cliente:", clienteData, error);
          }
        }
      }

      fs.unlinkSync(filePath);

      return "Clientes cargados exitosamente";
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

    async subirProveedoresDesdeExcel(_, { archivo }) {
      const { createReadStream, filename } = await archivo;

      // Verifica que el archivo sea válido
      if (!createReadStream) {
        throw new Error("El archivo no es válido o no contiene un stream");
      }

      // Asegurarse de que la carpeta 'uploads' exista
      const uploadDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Definir la ruta donde se guardará temporalmente el archivo
      const filePath = path.join(uploadDir, filename);

      // Guardar el archivo temporalmente en la carpeta 'uploads'
      await new Promise((resolve, reject) => {
        const stream = createReadStream();
        const out = fs.createWriteStream(filePath);
        stream.pipe(out);
        out.on("finish", resolve);
        out.on("error", reject);
      });

      // Leer el archivo Excel
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const proveedoresExcel = XLSX.utils.sheet_to_json(sheet);

      // Procesar cada proveedor de manera secuencial con async/await
      for (const proveedorData of proveedoresExcel) {
        console.log("Procesando proveedor:", proveedorData); // Depuración para ver los datos

        try {
          const {
            razonSocial = "",
            nombreComercial = "",
            tipoIdentificacion = "",
            Cedula = "",
            Codigo = "",
            correosElectronicos = "",
            tipoDocumento = "",
            condicionDeVenta = "",
            plazo = null,
            limiteCredito = null,
            moneda = "",
            metodoPago = "",
            formaEntrega = "",
            detalleObservacion = "",
            telefonoOficina1 = "",
            provinciaOficina1 = "",
            cantonOficina1 = "",
            distritoOficina1 = "",
            detalleOficina1 = "",
            nombreContactoVentas = "",
            telefonoContactoVentas = "",
            celularContactoVentas = "",
            correoElectronicoContactoVentas = "",
            nombreContactoCredito = "",
            telefonoContactoCredito = "",
            celularContactoCredito = "",
            correoElectronicoContactoCredito = "",
          } = proveedorData;

          // Convertir Cedula a string en caso de que sea un número
          const numeroIdentificacionStr = String(Cedula);

          // Procesar correos electrónicos separados por comas
          const correosArray = correosElectronicos
            ? correosElectronicos.split(",")
            : [];

          // Procesar oficinas
          const oficinasArray = [];
          if (
            telefonoOficina1 ||
            provinciaOficina1 ||
            cantonOficina1 ||
            distritoOficina1 ||
            detalleOficina1
          ) {
            oficinasArray.push({
              telefono: telefonoOficina1,
              provincia: provinciaOficina1,
              canton: cantonOficina1,
              distrito: distritoOficina1,
              detalle: detalleOficina1,
            });
          }

          // Procesar contactoVentas
          const contactoVentas = {
            nombre: nombreContactoVentas,
            telefono: telefonoContactoVentas,
            celular: celularContactoVentas,
            correoElectronico: correoElectronicoContactoVentas,
          };

          // Procesar contactoCredito
          const contactoCredito = {
            nombre: nombreContactoCredito,
            telefono: telefonoContactoCredito,
            celular: celularContactoCredito,
            correoElectronico: correoElectronicoContactoCredito,
          };

          // Busca si el proveedor ya existe en la base de datos por su número de identificación
          const proveedorExistente = await Supplier.findOne({
            Cedula: numeroIdentificacionStr,
          });

          if (proveedorExistente) {
            // Actualiza el proveedor existente
            Object.assign(proveedorExistente, {
              razonSocial,
              nombreComercial,
              tipoIdentificacion,
              Codigo,
              correosElectronicos: correosArray,
              tipoDocumento,
              condicionDeVenta,
              plazo,
              limiteCredito,
              moneda,
              metodoPago,
              formaEntrega,
              detalleObservacion,
              oficinas: oficinasArray,
              contactoVentas,
              contactoCredito,
            });

            await proveedorExistente.save();
          } else {
            // Crea un nuevo proveedor si no existe con todos los campos
            const nuevoProveedor = new Supplier({
              razonSocial,
              nombreComercial,
              tipoIdentificacion,
              Cedula: numeroIdentificacionStr,
              Codigo,
              correosElectronicos: correosArray,
              tipoDocumento,
              condicionDeVenta,
              plazo,
              limiteCredito,
              moneda,
              metodoPago,
              formaEntrega,
              detalleObservacion,
              oficinas: oficinasArray,
              contactoVentas,
              contactoCredito,
            });
            await nuevoProveedor.save();
          }
        } catch (error) {
          console.error("Error procesando proveedor:", proveedorData, error);
        }
      }

      // Elimina el archivo temporal
      fs.unlinkSync(filePath);

      return "Proveedores cargados exitosamente";
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

    async subirProductosDesdeExcel(_, { archivo }) {
      const { createReadStream, filename } = await archivo;
      // Guarda temporalmente el archivo subido
      const stream = createReadStream();
      const filePath = path.join(__dirname, `/uploads/${filename}`);
      await new Promise((resolve, reject) => {
        const out = fs.createWriteStream(filePath);
        stream.pipe(out);
        out.on("finish", resolve);
        out.on("error", reject);
      });

      // Lee el archivo Excel
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const productosExcel = XLSX.utils.sheet_to_json(sheet);

      // Procesa cada producto y guárdalo en la base de datos
      for (const productoData of productosExcel) {
        const {
          codigo,
          codigoCabys,
          detalle,
          venta,
          costo,
          monedaVenta,
          monedaCosto,
          proveedor,
          clientes,
          presentacion,
          existencia,
          sugerido,
          ubicacion,
          observacion,
          categorias,
        } = productoData;

        // Busca si el producto ya existe en la base de datos por su código
        const productoExistente = await Product.findOne({ codigo });

        if (productoExistente) {
          // Actualiza el producto existente
          productoExistente.codigoCabys =
            codigoCabys || productoExistente.codigoCabys;
          productoExistente.detalle = detalle || productoExistente.detalle;
          productoExistente.venta = venta || productoExistente.venta;
          productoExistente.costo = costo || productoExistente.costo;
          productoExistente.monedaVenta =
            monedaVenta || productoExistente.monedaVenta;
          productoExistente.monedaCosto =
            monedaCosto || productoExistente.monedaCosto;
          productoExistente.presentacion =
            presentacion || productoExistente.presentacion;
          productoExistente.existencia =
            existencia || productoExistente.existencia;
          productoExistente.sugerido = sugerido || productoExistente.sugerido;
          productoExistente.ubicacion =
            ubicacion || productoExistente.ubicacion;
          productoExistente.observacion =
            observacion || productoExistente.observacion;
          productoExistente.categorias =
            categorias || productoExistente.categorias;
          productoExistente.proveedor =
            proveedor || productoExistente.proveedor;
          productoExistente.clientes = clientes || productoExistente.clientes;

          await productoExistente.save();
        } else {
          // Crea un nuevo producto si no existe
          const nuevoProducto = new Product({
            codigo,
            codigoCabys,
            detalle,
            venta,
            costo,
            monedaVenta,
            monedaCosto,
            presentacion,
            existencia,
            sugerido,
            ubicacion,
            observacion,
            categorias,
            proveedor,
            clientes,
          });

          console.log("Productos cargados exitosamente", nuevoProducto);

          await nuevoProducto.save();
        }
      }

      // Elimina el archivo temporal
      // fs.unlinkSync(filePath);

      return "Productos cargados exitosamente";
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

    updateAllProductsExistence: async () => {
      try {
        const result = await Product.updateMany(
          {},
          { $set: { existencia: 0 } }
        );

        console.log(result);
        return {
          message: "Todos los productos han sido actualizados con existencia 0",
          modifiedCount: result.modifiedCount,
        };
      } catch (error) {
        console.log(error);
        throw new Error("Error al actualizar todos los productos");
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
          // if (!item.cantidad || isNaN(item.cantidad)) {
          //   throw new Error(
          //     `Cantidad inválida para el producto: ${item.producto}`
          //   );
          // }
          // Verificar si el producto está en los productos asignados del cliente/proveedor
          // const isAssignedProduct = target.productosAsignados.some(
          //   (p) => p.producto.toString() === item.producto.toString()
          // );

          // if (!isAssignedProduct) {
          //   throw new Error(
          //     `Producto no asignado al Cliente/Proveedor: ${item.producto}`
          //   );
          // }

          const producto = await Product.findById(item.producto).session(
            session
          );
          if (!producto) {
            throw new Error("Producto no encontrado");
          }

          // Asumiendo que el precio especial podría estar definido en 'productosAsignados'
          // const assignedProduct = target.productosAsignados.find(
          //   (p) => p.producto.toString() === item.producto.toString()
          // );

          console.log(invoiceInput);
          // console.log(assignedProduct);
          // const precioVenta = invoiceInput.total;
          // assignedProduct && assignedProduct.precioEspecial
          //   ? assignedProduct.precioEspecial
          //   : producto.venta;

          // total += precioVenta * item.cantidad;

          if (invoiceInput.type === "Compra") {
            producto.existencia += item.cantidad;
          } else {
            producto.existencia -= item.cantidad;
          }

          await producto.save({ session });
        });

        await Promise.all(productUpdates);

        const newInvoice = new Invoice({
          ...invoiceInput,
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
      try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(
          id,
          { $set: invoiceInput },
          {
            new: true,
          }
        )
          .populate("products")
          .populate("client")
          .populate("supplier");
        console.log(updatedInvoice);
        return updatedInvoice;
      } catch (error) {
        console.log(error);
        throw new Error("Error al actualizar la factura");
      }
    },
    deleteInvoice: async (_, { id }) => {
      await Invoice.findByIdAndDelete(id);
      return "Invoice deleted successfully";
    },
  },
};

module.exports = resolvers;
