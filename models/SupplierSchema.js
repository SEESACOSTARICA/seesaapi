const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  razonSocial: { type: String, required: true },
  nombreComercial: { type: String, required: true },
  tipoIdentificacion: { type: String, required: true },
  numeroIdentificacion: { type: String, required: true, unique: true },
  codigo: { type: String, required: true },
  correosElectronicos: [{ type: String }],
  tipoDocumento: { type: String },
  condicionDeVenta: { type: String },
  plazo: { type: Number },
  limiteCredito: { type: Number },
  moneda: { type: String },
  metodoPago: { type: String },
  formaEntrega: { type: String },
  detalleObservacion: { type: String },
  oficinas: [
    {
      telefono: { type: String },
      provincia: { type: String },
      canton: { type: String },
      distrito: { type: String },
    },
  ],
  contactoVentas: {
    nombre: { type: String },
    telefono: { type: String },
    celular: { type: String },
    correoElectronico: { type: String },
  },
  contactoCredito: {
    nombre: { type: String },
    telefono: { type: String },
    celular: { type: String },
    correoElectronico: { type: String },
  },
});

module.exports = mongoose.model("Supplier", supplierSchema);
