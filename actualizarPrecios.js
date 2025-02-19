const xlsx = require("xlsx");
const Product = require("./models/ProductSchema");
const dbConnection = require("./config/database"); // Importar tu conexión a la base de datos
const mongoose = require("mongoose");

// Conectar a la base de datos
dbConnection();

// Cargar el archivo Excel
const workbook = xlsx.readFile("./productos.xlsx");
const sheet_name_list = workbook.SheetNames;

// Convertir la hoja de Excel a un array de objetos
const productosExcel = xlsx.utils.sheet_to_json(
  workbook.Sheets[sheet_name_list[0]]
);

// Función para detectar la moneda
const detectarMoneda = (precio) => {
  if (typeof precio === "string") {
    if (precio.includes("$")) {
      return {
        valor: parseFloat(precio.replace(/[^\d.-]/g, "")),
        moneda: "Dólares",
      };
    } else if (precio.includes("₡")) {
      return {
        valor: parseFloat(precio.replace(/[^\d.-]/g, "")),
        moneda: "Colones",
      };
    }
  }
  return { valor: parseFloat(precio), moneda: "Indefinido" };
};

// Función para actualizar precios
const actualizarPrecios = async () => {
  for (let producto of productosExcel) {
    try {
      const { CodigoCabys, codigo, Detalle } = producto;

      // Detectar moneda y obtener los valores numéricos
      const ventaInfo = detectarMoneda(Venta);
      const costoInfo = detectarMoneda(Costo);

      // Buscar el producto por su códigoCabys y actualizar el precio de venta, costo y monedas
      const updatedProduct = await Product.findOneAndUpdate(
        { codigoCabys: CodigoCabys },
        {
          $set: {
            venta: ventaInfo.valor,
            costo: costoInfo.valor,
            monedaVenta: ventaInfo.moneda,
            monedaCosto: costoInfo.moneda,
          },
        },
        { new: true } // Devolver el producto actualizado
      );

      if (updatedProduct) {
        console.log(`Producto ${CodigoCabys} actualizado con éxito`);
      } else {
        console.log(`Producto ${CodigoCabys} no encontrado`);
      }
    } catch (error) {
      console.error(
        `Error actualizando producto ${producto.CodigoCabys}:`,
        error
      );
    }
  }
};

// Ejecutar la función de actualización
actualizarPrecios()
  .then(() => {
    console.log("Actualización completa");
    mongoose.connection.close(); // Cerrar la conexión a MongoDB después de completar la actualización
  })
  .catch((error) => {
    console.error("Error en la actualización:", error);
    mongoose.connection.close();
  });
