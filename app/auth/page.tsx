"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false
        });

        if (result?.error) {
          setMessage("Email ou mot de passe incorrect");
        } else {
          window.location.href = "/";
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Compte créé ! Vérifiez votre email.");
        }
      }
    } catch (error) {
      setMessage("Une erreur est survenue");
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "20px", maxWidth: "400px", width: "90%" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
          {isLogin ? "Connexion" : "Inscription"}
        </h1>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                style={{ width: "100%", padding: "12px", border: "2px solid #e2e8f0", borderRadius: "8px" }}
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", border: "2px solid #e2e8f0", borderRadius: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", border: "2px solid #e2e8f0", borderRadius: "8px" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: loading ? "#a0aec0" : "#48bb78", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", marginBottom: "20px" }}
          >
            {loading ? "Chargement..." : (isLogin ? "Se connecter" : "S'inscrire")}
          </button>
        </form>

        {message && (
          <div style={{ padding: "10px", background: message.includes("erreur") ? "#fef2f2" : "#f0f8f0", borderRadius: "8px", marginBottom: "20px", textAlign: "center" }}>
            {message}
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer", textDecoration: "underline" }}
          >
            {isLogin ? "Créer un compte" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
