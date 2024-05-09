const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supplierSchema = new mongoose.Schema({
  razonSocial: { type: String },
  nombreComercial: { type: String },
  tipoIdentificacion: { type: String },
  numeroIdentificacion: { type: String, unique: true },
  codigo: { type: String },
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
      detalle: { type: String },
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
      },
    },
  ],
});

module.exports = mongoose.model("Supplier", supplierSchema);
