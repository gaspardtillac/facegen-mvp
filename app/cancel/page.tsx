"use client";

export default function CancelPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "25px", padding: "60px", textAlign: "center", maxWidth: "500px" }}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>❌</div>
        <h1 style={{ color: "#dc2626", marginBottom: "20px" }}>Paiement annulé</h1>
        <p style={{ marginBottom: "30px", color: "#64748b" }}>
          Votre paiement a été annulé. Aucun montant n'a été débité.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ background: "#48bb78", color: "white", border: "none", padding: "15px 30px", borderRadius: "12px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "600" }}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
