const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  date: { type: Date, default: Date.now },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  type: { type: String, enum: ["Compra", "Venta"], required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Producto" },
      cantidad: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  notes: { type: String },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
