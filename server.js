import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY no definida");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/create-payment-intent", async (req, res) => {
  try {

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // 👈 $1 MXN
      currency: "mxn",
      automatic_payment_methods: { enabled: true }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error("🔥 Stripe error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () =>
  console.log("✅ Backend Stripe listo en https://cooking-game-backend-hyq6.onrender.com")
);