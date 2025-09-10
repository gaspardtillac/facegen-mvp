import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Système simple de stockage (remplacer par une vraie DB en production)
let userCredits = {
  default: 3
};

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const credits = parseInt(session.metadata.credits);
    
    // Ajouter les crédits (en production, utiliser user ID)
    userCredits.default = (userCredits.default || 0) + credits;
    
    console.log(`Credits added: ${credits}. Total: ${userCredits.default}`);
  }

  return NextResponse.json({ received: true });
}
