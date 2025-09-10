import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { credits } = await req.json();
    
    const priceMap = {
      10: 200,
      30: 500,
      70: 1000
    };

    return NextResponse.json({ 
      url: "https://checkout.stripe.com/test",
      message: "Stripe non configuré - mode test"
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
