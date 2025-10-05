"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.9) 50%, rgba(55, 48, 163, 1) 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "32px",
        maxWidth: "520px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 25px 50px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ marginBottom: "10px" }}>Compte</h1>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>
          La création de compte sera bientôt disponible sur MonAvatarIA.
        </p>
        <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "0.95rem" }}>
          En attendant, vous pouvez tester l’outil avec <strong>3 crédits gratuits</strong> en mode invité.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => router.push("/")}
            style={{ padding: "12px 20px", background: "#48bb78", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }}
          >
            ← Retour à l’accueil
          </button>
          <button
            onClick={() => router.push("/exemples")}
            style={{ padding: "12px 20px", background: "#667eea", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600 }}
          >
            Voir des exemples
          </button>
        </div>
      </div>
    </div>
  );
}
