// backend/models/Producto.js
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  // Añadimos el campo stock que aparece en tu Compass
  stock: { type: Number, default: 0 }, 
  categoria: { 
    type: String, 
    required: true, 
    // Asegúrate de que los nombres aquí coincidan con lo que escribas en la BD
    enum: ['bebidas', 'postres', 'comidas', 'desayunos'] 
  },
  img: { type: String, required: true }, 
  descripcion: { type: String },
  disponible: { type: Boolean, default: true }
}, { 
  // ESTO ES CLAVE: 
  // Por defecto Mongoose busca la colección "productos" (en plural).
  // En tu imagen de Compass veo que se llama "Items". 
  // Con esto le decimos que use esa tabla exactamente.
  collection: 'Items' 
});

module.exports = mongoose.model('Producto', productoSchema);