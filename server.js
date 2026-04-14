import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

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

// Rutas
app.get("/productos", async (req,res)=>{
  const productos = await Producto.find();
  res.json(productos);
});

// Pago
app.post("/crear-pago", async (req,res)=>{
  const {items} = req.body;

  const line_items = items.map(item=>({
    price_data:{
      currency:"mxn",
      product_data:{name:item.nombre},
      unit_amount:item.precio*100
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log("Servidor corriendo"));