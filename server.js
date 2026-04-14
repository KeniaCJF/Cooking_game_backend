// server.js (Backend)
import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Conexión a Mongo
mongoose.connect(process.env.MONGO_URI).then(() => console.log("BD Conectada"));

// Modelo de Producto
const Producto = mongoose.model("Producto", new mongoose.Schema({
  nombre: String, precio: Number, categoria: String, img: String
}));

// Ruta para obtener productos
app.get("/api/productos", async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

// --- RUTA PARA COBRO REAL CON REDIRECCIÓN ---
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    // Formateamos los productos para Stripe
    const line_items = items.map(item => ({
      price_data: {
        currency: 'mxn',
        product_data: { name: item.nombre },
        unit_amount: item.precio * 100, // Centavos
      },
      quantity: item.cantidad,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      // Cambia estas URLs por las de tu frontend en Vercel o Netlify
      success_url: 'http://localhost:5173/success', 
      cancel_url: 'http://localhost:5173/',
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));