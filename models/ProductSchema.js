const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productoSchema = new Schema(
  {
    codigo: { type: String },
    codigoCabys: { type: String },
    detalle: { type: String },
    venta: { type: Number },
    costo: { type: Number },
    monedaVenta: { type: String },
    monedaCosto: { type: String },
    proveedor: [
      {
        type: Schema.Types.ObjectId,
        ref: "Supplier",
      },
    ],
    clientes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
    presentacion: String,
    existencia: { type: Number },
    sugerido: Number,
    ubicacion: String,
    observacion: String,
    categorias: {
      type: String,
      enum: ["R", "C", "O", "01", "02", "03", "04", "05", "06"],
    },
  },
  { timestamps: true }
);

const Producto = mongoose.model("Producto", productoSchema);

module.exports = Producto;

//Alertas al 50%
