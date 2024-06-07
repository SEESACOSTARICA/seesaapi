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

  type Client {
    id: ID!
    razonSocial: String
    nombreComercial: String
    tipoIdentificacion: String
    numeroIdentificacion: String
    detallesGenerales: String
    codigo: String
    correosElectronicos: [String]
    tipoDocumento: String
    correoEnvioFE: String
    destinatarioEnvioFE: String
    condicionVenta: String
    plazo: Int
    limiteCredito: Float
    moneda: String
    metodoPago: String
    formaEntrega: String
    transporte: String
    destino: String
    detalleObservacion: String
    cobrarEnvio: Boolean
    oficinas: [Office]
    exonerado: Boolean
    numeroAutorizacion: String
    fechaAutorizacion: String
    fechaVencimiento: String
    porcentajeExoneracion: Float
    institucionEmisora: String
    contactoCompras: Contact
    impresoras: [Printer]
    contactoPagos: Contact
    productosAsignados: [ProductoAsignado]
  }

  type ProductoAsignado {
    producto: Product!
    precioEspecial: Float
    detalles: DetallesProducto
  }

  type DetallesProducto {
    color: String
    material: String
    adhesivo: String
    columnas: Int
    embobinado: String
    cantidadPorRollo: Int
    core: String
    detalle: String
  }

  type Supplier {
    id: ID!
    razonSocial: String
    nombreComercial: String
    tipoIdentificacion: String
    numeroIdentificacion: String
    codigo: String
    correosElectronicos: [String]
    tipoDocumento: String
    condicionDeVenta: String
    plazo: Int
    limiteCredito: Float
    moneda: String
    metodoPago: String
    formaEntrega: String
    detalleObservacion: String
    oficinas: [Office]
    contactoVentas: Contact
    contactoCredito: Contact
    productosAsignados: [ProductoAsignado]
  }

  type Product {
    id: ID!
    codigo: String
    codigoCabys: String
    detalle: String
    venta: Float
    monedaVenta: String
    costo: Float
    monedaCosto: String
    proveedor: [Supplier]
    presentacion: String
    existencia: Int
    sugerido: Int
    ubicacion: String
    observacion: String
    clientes: [Client]
    categorias: String
  }

  type Office {
    telefono: String
    provincia: String
    canton: String
    distrito: String
    detalle: String
  }

  type Contact {
    nombre: String
    telefono: String
    celular: String
    correoElectronico: String
  }

  type Printer {
    marca: String
    modelo: String
  }

  type ProductCount {
    count: Int
  }

  type Invoice {
    id: ID!
    invoiceNumber: String!
    date: String!
    client: Client
    supplier: Supplier
    type: String!
    total: Float!
    products: [InvoiceProduct!]!
  }

  type InvoiceProduct {
    producto: ID!
    cantidad: Int!
    precioEspecial: Float!
    detalles: DetallesProducto
  }

  # Inputs

  input ClientInput {
    razonSocial: String
    nombreComercial: String
    tipoIdentificacion: String
    numeroIdentificacion: String
    detallesGenerales: String
    codigo: String
    correosElectronicos: [String]
    tipoDocumento: String
    correoEnvioFE: String
    destinatarioEnvioFE: String
    condicionVenta: String
    plazo: Int
    limiteCredito: Float
    moneda: String
    metodoPago: String
    formaEntrega: String
    transporte: String
    destino: String
    detalleObservacion: String
    cobrarEnvio: Boolean
    oficinas: [OfficeInput]
    exonerado: Boolean
    numeroAutorizacion: String
    fechaAutorizacion: String
    fechaVencimiento: String
    porcentajeExoneracion: Float
    institucionEmisora: String
    contactoCompras: ContactInput
    impresoras: [PrinterInput]
    contactoPagos: ContactInput
    productosAsignados: [ProductoAsignadoInput]
  }

  input ProductoAsignadoInput {
    producto: ID!
    precioEspecial: Float
    detalles: DetallesProductoInput
  }

  input DetallesProductoInput {
    color: String
    material: String
    adhesivo: String
    columnas: Int
    embobinado: String
    cantidadPorRollo: Int
    core: String
    detalle: String
  }

  input SupplierInput {
    razonSocial: String
    nombreComercial: String
    tipoIdentificacion: String
    numeroIdentificacion: String
    codigo: String
    correosElectronicos: [String]
    tipoDocumento: String
    condicionDeVenta: String
    plazo: Int
    limiteCredito: Float
    moneda: String
    metodoPago: String
    formaEntrega: String
    detalleObservacion: String
    oficinas: [OfficeInput]
    contactoVentas: ContactInput
    contactoCredito: ContactInput
    productosAsignados: [ProductoAsignadoInput]
  }

  input ProductInput {
    codigo: String
    codigoCabys: String
    detalle: String
    venta: Float
    monedaVenta: String
    costo: Float
    monedaCosto: String
    proveedor: [ID]
    presentacion: String
    existencia: Int
    sugerido: Int
    ubicacion: String
    observacion: String
    clientes: [ID]
    categorias: String
  }

  input OfficeInput {
    telefono: String
    provincia: String
    canton: String
    distrito: String
    detalle: String
  }

  input ContactInput {
    nombre: String
    telefono: String
    celular: String
    correoElectronico: String
  }

  input PrinterInput {
    marca: String
    modelo: String
  }

  input DetallesProductoInput {
    color: String
    material: String
    adhesivo: String
    columnas: Int
    embobinado: String
    cantidadPorRollo: Int
    core: String
    detalle: String
  }

  input InvoiceProductInput {
    producto: ID!
    cantidad: Int!
    precioEspecial: Float!
    detalles: DetallesProductoInput
  }
  input InvoiceInput {
    invoiceNumber: String!
    date: String!
    type: String!
    total: Float!
    products: [InvoiceProductInput!]
    client: ID
    supplier: ID
  }

  # Queries
  type Query {
    getMe(token: String!): User
    getClients: [Client]
    getClient(id: ID!): Client

    getSuppliers: [Supplier]
    getSupplier(id: ID!): Supplier

    getProducts: [Product]
    getProduct(id: ID!): Product

    getProductCountByCategory(category: String!): ProductCount

    getAllInvoices: [Invoice]
    getInvoiceById(id: ID!): Invoice
  }

  type Mutation {
    # Mutaciones para la creación de usuarios y autenticación
    createUser(input: CreateUserInput): AuthPayload
    login(input: LoginInput): AuthPayload
    createClient(input: ClientInput): Client
    updateClient(id: ID!, input: ClientInput): Client
    deleteClient(id: ID!): Client

    createSupplier(input: SupplierInput): Supplier
    updateSupplier(id: ID!, input: SupplierInput): Supplier
    deleteSupplier(id: ID!): Supplier

    createProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): Product

    createInvoice(invoiceInput: InvoiceInput): Invoice
    updateInvoice(id: ID!, invoiceInput: InvoiceInput): Invoice
    deleteInvoice(id: ID!): String
  }
`;

module.exports = typeDefs;
