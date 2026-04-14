import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Usar variables del .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Mongo conectado"))
.catch(err=>console.log(err));

const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  stock: Number,
  categoria: String,
  img: String
});

const Producto = mongoose.model("Producto", productoSchema);

// Obtener productos
app.get("/productos", async (req,res)=>{
  const productos = await Producto.find();
  res.json(productos);
});

// Stripe pago
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
    success_url:"https://tu-frontend.onrender.com/success.html",
    cancel_url:"https://tu-frontend.onrender.com/cancel.html"
  });

  res.json({id:session.id});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Servidor en puerto ${PORT}`));