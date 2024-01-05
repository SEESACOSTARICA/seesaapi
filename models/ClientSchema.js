const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  razonSocial: { type: String },
  nombreComercial: { type: String },
  tipoIdentificacion: { type: String },
  numeroIdentificacion: { type: String, unique: true },
  codigo: { type: String },
  correosElectronicos: [{ type: String }],
  tipoDocumento: { type: String },
  correoEnvioFE: { type: String },
  destinatarioEnvioFE: { type: String },

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
});

module.exports = mongoose.model("Client", clientSchema);
