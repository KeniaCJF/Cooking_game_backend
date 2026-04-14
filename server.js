import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 🔥 CORS (solución real)
app.use(cors({
  origin: [
    "https://online-shop-imh6.onrender.com"
  ],
  methods: ["GET","POST"],
}));

app.use(express.json());

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Mongo
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Mongo conectado"))
.catch(err=>console.log(err));

// Modelo
const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  stock: Number,
  categoria: String,
  img: String
});

const Producto = mongoose.model("Producto", productoSchema);

// 🔍 RUTA PRODUCTOS (con debug)
app.get("/productos", async (req,res)=>{
  console.log("Entró a /productos");

  try {
    const productos = await Producto.find();
    console.log("Productos:", productos);

    res.json(productos);
  } catch (error) {
    console.log(error);
    res.status(500).json({error: "Error en servidor"});
  }
});

// 💳 Stripe pago
app.post("/crear-pago", async (req,res)=>{
  try {
    const {items} = req.body;

    const line_items = items.map(item=>({
      price_data:{
        currency:"mxn",
        product_data:{name:item.nombre},
        unit_amount:item.precio * 100
      },
      quantity:item.cantidad
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types:["card"],
      line_items,
      mode:"payment",
      success_url:`${process.env.FRONTEND_URL}/success.html`,
      cancel_url:`${process.env.FRONTEND_URL}/cancel.html`
    });

    res.json({id:session.id});

  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Error en pago"});
  }
});

// Puerto (IMPORTANTE PARA RENDER)
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log("Servidor corriendo en puerto", PORT);
});