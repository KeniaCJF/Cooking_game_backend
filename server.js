import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// --- CONFIGURACIÓN ---

// 1. CORS: Es mejor no dejar la barra "/" al final de la URL
app.use(cors({
  origin: ["https://online-shop-imh6.onrender.com"],
  methods: ["GET", "POST"],
}));

app.use(express.json());

// 2. Stripe: Validación de la Key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ ERROR: STRIPE_SECRET_KEY no está definida en las variables de entorno.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 3. MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo conectado"))
  .catch(err => console.error("❌ Error Mongo:", err));

// --- MODELO ---
const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  stock: Number,
  categoria: String,
  img: String
});

const Producto = mongoose.model("Producto", productoSchema, "Items");

// --- RUTAS ---

// 🔍 Obtener productos
app.get("/productos", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    console.error("Error productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// 💳 Crear pago mejorado
app.post("/crear-pago", async (req, res) => {
  try {
    const { items } = req.body;

    // Validación: Si no hay items, no molestamos a Stripe
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío o el formato es incorrecta" });
    }

    // Solución al problema de la URL: 
    // Usamos la variable de entorno, pero si no existe, usamos la URL directa por seguridad.
    const frontendUrl = process.env.FRONTEND_URL || "https://online-shop-imh6.onrender.com";

    const line_items = items.map(item => ({
      price_data: {
        currency: "mxn",
        product_data: { 
          name: item.nombre || "Producto" 
        },
        unit_amount: 1000 // $1.00 MXN (Stripe usa centavos)
      },
      quantity: item.cantidad || 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${frontendUrl}/success.html`,
      cancel_url: `${frontendUrl}/cancel.html`,
    });

    console.log("✅ Sesión de Stripe creada:", session.id);
    res.json({ id: session.id });

  } catch (error) {
    // Log detallado para que veas el error real en la consola de Render
    console.error("❌ ERROR DE STRIPE:", error.message);
    res.status(500).json({ 
      error: "Error al procesar el pago", 
      detalle: error.message 
    });
  }
});

// --- LANZAMIENTO ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});