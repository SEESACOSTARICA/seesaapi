const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceProductSchema = new Schema({
  producto: {
    type: Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
  },
  precioEspecial: {
    type: Number,
  },
});

const invoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true },
  type: { type: String, enum: ["Compra", "Venta"], required: true },
  client: { type: Schema.Types.ObjectId, ref: "Client" },
  supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
  date: { type: Date, default: Date.now },
  products: [invoiceProductSchema],
  total: { type: Number, required: true },
  detalle: {
    type: String,
  },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
