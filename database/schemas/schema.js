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
    contactoCompras: Contact
    impresoras: [Printer]
    contactoPagos: Contact
  }

  type Supplier {
    id: ID!
    razonSocial: String!
    nombreComercial: String!
    tipoIdentificacion: String!
    numeroIdentificacion: String!
    codigo: String!
    correosElectronicos: [String]!
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
  }

  type Office {
    telefono: String
    provincia: String
    canton: String
    distrito: String
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

  input ClientInput {
    razonSocial: String
    nombreComercial: String
    tipoIdentificacion: String
    numeroIdentificacion: String
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
    contactoCompras: ContactInput
    impresoras: [PrinterInput]
    contactoPagos: ContactInput
  }

  input SupplierInput {
    razonSocial: String!
    nombreComercial: String!
    tipoIdentificacion: String!
    numeroIdentificacion: String!
    codigo: String!
    correosElectronicos: [String]!
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
  }
  input OfficeInput {
    telefono: String
    provincia: String
    canton: String
    distrito: String
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

  # Queries
  type Query {
    getMe(token: String!): User
    getClients: [Client]
    getClient(id: ID!): Client

    getSuppliers: [Supplier]
    getSupplier(id: ID!): Supplier
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
  }
`;

module.exports = typeDefs;
