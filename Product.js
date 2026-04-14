// backend/models/Producto.js
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  categoria: { 
    type: String, 
    required: true, 
    enum: ['bebidas', 'postres', 'comidas', 'desayunos'] // Solo permite estas categorías
  },
  img: { type: String, required: true }, // URL de la imagen
  descripcion: { type: String },
  disponible: { type: Boolean, default: true }
});

module.exports = mongoose.model('Producto', productoSchema);