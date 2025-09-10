import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ credits: 0 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('credits')
      .eq('email', session.user.email)
      .single();

    if (error || !user) {
      return NextResponse.json({ credits: 0 });
    }

    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json({ credits: 0 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === "use") {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('credits')
        .eq('email', session.user.email)
        .single();

      if (fetchError || !user || user.credits <= 0) {
        return NextResponse.json({ error: "Pas assez de crédits" }, { status: 400 });
      }

      const { data, error: updateError } = await supabase
        .from('users')
        .update({ credits: user.credits - 1 })
        .eq('email', session.user.email)
        .select('credits')
        .single();

      if (updateError) {
        return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
      }

      return NextResponse.json({ remaining: data.credits });
    }

    if (action === "refund") {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('credits')
        .eq('email', session.user.email)
        .single();

      if (fetchError || !user) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }

      const { data, error: updateError } = await supabase
        .from('users')
        .update({ credits: user.credits + 1 })
        .eq('email', session.user.email)
        .select('credits')
        .single();

      if (updateError) {
        return NextResponse.json({ error: "Erreur remboursement" }, { status: 500 });
      }

      return NextResponse.json({ remaining: data.credits });
    }

    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch (error) {
    console.error('Error managing credits:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
