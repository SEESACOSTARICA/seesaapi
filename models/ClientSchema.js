const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new mongoose.Schema({
  razonSocial: { type: String },
  nombreComercial: { type: String },
  Apellido1: { type: String },
  Apellido2: { type: String },
  Correo: { type: String },
  Provincia: { type: Number },
  Canton: { type: Number },
  Distrito: { type: Number },
  Barrio: { type: Number },
  Direccion: { type: String },
  Area: { type: Number },
  Telefono: { type: String },
  Copia: { type: String },
  Nombre: { type: String },
  tipoCedula: { type: Number },
  tipoIdentificacion: { type: String },
  Cedula: { type: String },
  Codigo: { type: String },
  correosElectronicos: [{ type: String }],
  tipoDocumento: { type: String },
  correoEnvioFE: { type: String },
  destinatarioEnvioFE: { type: String },
  detallesGenerales: { type: String },
  condicionVenta: { type: String },
  plazo: { type: Number, default: null },
  limiteCredito: { type: Number, default: null },
  moneda: { type: String },
  metodoPago: { type: String },
  formaEntrega: { type: String },
  transporte: { type: String },
  destino: { type: String },
  detalleObservacion: { type: String },
  cobrarEnvio: { type: Boolean, default: null },
  oficinas: [
    {
      telefono: { type: String },
      provincia: { type: String },
      canton: { type: String },
      distrito: { type: String },
      detalle: { type: String },
    },
  ],
  exonerado: { type: Boolean, default: null },
  numeroAutorizacion: { type: String },
  fechaAutorizacion: { type: Date, default: null },
  fechaVencimiento: { type: Date, default: null },
  porcentajeExoneracion: { type: Number, default: null },
  institucionEmisora: { type: String },
  impresoras: [
    {
      marca: { type: String },
      modelo: { type: String },
    },
  ],
  contactoPagos: {
    nombre: { type: String },
    telefono: { type: String },
    celular: { type: String },
    correoElectronico: { type: String },
  },
  contactoCompras: {
    nombre: { type: String },
    telefono: { type: String },
    celular: { type: String },
    correoElectronico: { type: String },
  },
  productosAsignados: [
    {
      producto: {
        type: Schema.Types.ObjectId,
        ref: "Producto",
      },
      precioEspecial: {
        type: Number,
      },
      detalles: {
        color: String,
        material: String,
        adhesivo: String,
        columnas: Number,
        embobinado: String,
        cantidadPorRollo: Number,
        core: String,
        detalle: String,
      },
    },
  ],
});

module.exports = mongoose.model("Client", clientSchema);
