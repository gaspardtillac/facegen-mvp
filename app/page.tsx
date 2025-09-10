"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// ——— Types ———
type HistoryItem = {
  id: number;
  imageUrl: string;
  prompt: string;
  date: string;
};

type GenerateResponse = {
  imageUrl?: string;
  hasImage?: boolean;
  working?: boolean;
  message?: string;
  shouldRefund?: boolean;
  error?: string;
};

export default function FaceGenApp() {
  const { data: session } = useSession();
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(3);
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showFullImage, setShowFullImage] = useState<boolean>(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (session) {
      // Utilisateur connecté : lire depuis la DB (pas de gratuits illimités)
      fetchCreditsFromDB();
    } else {
      // Visiteur anonyme : FORCER 3 crédits (migration v2)
      try {
        const version = typeof window !== "undefined" ? localStorage.getItem("anon-credits-version") : null;
        const savedCredits = typeof window !== "undefined" ? localStorage.getItem("anonymous-credits") : null;

        if (version !== "v2") {
          // Réinitialise pour tous les anciens utilisateurs (ex: 79) → 3
          setCredits(3);
          if (typeof window !== "undefined") {
            localStorage.setItem("anonymous-credits", "3");
            localStorage.setItem("anon-credits-version", "v2");
          }
        } else {
          const parsed = parseInt(savedCredits ?? "3", 10);
          const normalized = Number.isFinite(parsed) ? Math.min(3, Math.max(0, parsed)) : 3;
          setCredits(normalized);
          if (typeof window !== "undefined") {
            localStorage.setItem("anonymous-credits", normalized.toString());
          }
        }
      } catch {
        setCredits(3);
        if (typeof window !== "undefined") {
          localStorage.setItem("anonymous-credits", "3");
          localStorage.setItem("anon-credits-version", "v2");
        }
      }
    }
    loadHistory();
  }, [session]);

  const fetchCreditsFromDB = async () => {
    try {
      const res = await fetch("/api/credits");
      if (!res.ok) throw new Error("Impossible de récupérer les crédits");
      const data = await res.json();
      setCredits(data.credits);
    } catch (error) {
      console.error("Erreur crédits:", error);
    }
  };

  const loadHistory = () => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("facegen-history") : null;
      if (saved) setHistory(JSON.parse(saved));
    } catch (error) {
      console.log("Erreur localStorage:", error);
    }
  };

  const saveToHistory = (imageUrl: string, prompt: string) => {
    try {
      const newItem: HistoryItem = {
        id: Date.now(),
        imageUrl,
        prompt,
        date: new Date().toLocaleDateString("fr-FR"),
      };
      const newHistory = [newItem, ...history].slice(0, 18);
      setHistory(newHistory);
      if (typeof window !== "undefined") localStorage.setItem("facegen-history", JSON.stringify(newHistory));
    } catch (error) {
      console.log("LocalStorage plein, on ignore:", error);
    }
  };

  const buyCredits = async (amount: number) => {
    if (!session) return setShowAuth(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: amount }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("Lien de paiement indisponible");
    } catch (error: any) {
      alert("Erreur paiement: " + (error?.message || "inconnue"));
    }
  };

  const upload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = (event.target?.result as string) || null;
      setImage(dataUrl);
      setPreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  // Remboursement (si génération KO)
  const ensureRefund = async () => {
    try {
      if (session) {
        const refundRes = await fetch("/api/credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "refund" }),
        });
        if (refundRes.ok) {
          const refundData = await refundRes.json();
          setCredits(refundData.remaining);
        }
      } else {
        // Anonyme : on rend 1 crédit (toujours borné à 3 max)
        const newCredits = Math.min(3, credits + 1);
        setCredits(newCredits);
        if (typeof window !== "undefined") localStorage.setItem("anonymous-credits", newCredits.toString());
      }
    } catch {
      console.warn("Remboursement non appliqué (silent)");
    }
  };

  // Débite 1 crédit avant la génération
  const chargeOneCredit = async () => {
    if (session) {
      const creditRes = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "use" }),
      });
      if (!creditRes.ok) throw new Error("Pas assez de crédits");
      const creditData = await creditRes.json();
      setCredits(creditData.remaining);
    } else {
      const newCredits = credits - 1;
      if (newCredits < 0) throw new Error("Pas assez de crédits");
      setCredits(newCredits);
      if (typeof window !== "undefined") localStorage.setItem("anonymous-credits", newCredits.toString());
    }
  };

  const generate = async () => {
    setUiError(null);
    setResult(null);

    if (!image) return setUiError("Merci d'uploader une photo claire (visage bien visible).");
    if (!prompt.trim()) return setUiError("Merci de décrire le style souhaité.");
    if (credits <= 0) return setShowPricing(true);

    setLoading(true);

    try {
      // 1) Débiter 1 crédit
      await chargeOneCredit();

      // 2) Appeler l'API de génération
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceImage: image, prompt }),
      });

      if (!res.ok) {
        await ensureRefund(); // on rembourse si erreur HTTP
        throw new Error(`Génération indisponible (code ${res.status})`);
      }

      const data: GenerateResponse = await res.json();

      // Succès si imageUrl présent (compat hasImage/working)
      const validImageUrl = typeof data.imageUrl === "string" && data.imageUrl.length > 0;
      const hasValidImage = validImageUrl || (!!data.hasImage && !!data.imageUrl) || (!!data.working && !!data.imageUrl);

      if (!hasValidImage) {
        if (data.shouldRefund !== false) await ensureRefund();
        setResult({
          hasImage: false,
          message: data.message || data.error || "La génération n'a pas abouti. Réessayez avec un autre prompt ou une photo plus nette.",
        });
        return;
      }

      // Succès
      saveToHistory(data.imageUrl!, prompt);
      setResult({ hasImage: true, imageUrl: data.imageUrl!, message: data.message || "Avatar généré avec succès !" });
    } catch (error: any) {
      console.error("Erreur generate():", error);
      setResult({ hasImage: false, message: error?.message || "Erreur lors de la génération" });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageUrl: string, filename: string | null = null) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename || `mon-avatar-ia-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateAccount = () => router.push("/auth");

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.9) 50%, rgba(55, 48, 163, 1) 100%)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", position: "relative", zIndex: 1 }}>
        {/* ——— Topbar ——— */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(15px)",
            padding: "15px 25px",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              margin: 0,
            }}
          >
            MonAvatarIA
          </h1>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => router.push("/exemples")}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "8px 16px",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Galerie
            </button>

            <button
              onClick={() => setShowHistory(true)}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "8px 16px",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Historique ({history.length})
            </button>

            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "8px 16px",
                borderRadius: "15px",
                color: "white",
                display: "flex",
                gap: "10px",
                alignItems: "center",
                fontSize: "0.9rem",
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {credits} crédit{credits > 1 ? "s" : ""}
                {credits === 3 && !session && (
                  <span style={{ fontSize: "0.7rem", opacity: 0.8 }}> gratuits</span>
                )}
              </span>
              <button
                onClick={() => setShowPricing(true)}
                style={{
                  background: "#48bb78",
                  color: "white",
                  border: "none",
                  padding: "4px 12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                +
              </button>
            </div>

            {session ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div
                  style={{
                    color: "white",
                    fontSize: "0.8rem",
                    background: "rgba(255,255,255,0.2)",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    maxWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {session.user?.name?.split(" ")[0] || session.user?.email?.split("@")[0]}
                </div>
                <button
                  onClick={() => signOut()}
                  style={{
                    background: "rgba(239, 68, 68, 0.3)",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  ↗
                </button>
              </div>
            ) : (
              <button
                onClick={handleCreateAccount}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "8px 16px",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                Compte
              </button>
            )}
          </div>
        </div>

        {/* ——— Modales ——— */}
        {showHistory && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(5px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "40px",
                borderRadius: "25px",
                maxWidth: "800px",
                width: "90%",
                maxHeight: "80vh",
                overflow: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h2 style={{ margin: 0 }}>Votre historique ({history.length})</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  style={{ background: "#f1f5f9", border: "none", padding: "8px 16px", borderRadius: "12px", cursor: "pointer", fontSize: "0.9rem" }}
                >
                  ✕
                </button>
              </div>

              {history.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
                  <p>Aucune génération dans votre historique</p>
                  <p style={{ fontSize: "0.9rem" }}>Vos avatars générés apparaîtront ici</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                  {history.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "15px",
                        padding: "20px",
                        display: "flex",
                        gap: "20px",
                        alignItems: "center",
                      }}
                    >
                      <img src={item.imageUrl} style={{ width: 80, height: 80, borderRadius: "12px", objectFit: "cover" }} alt="Avatar généré" />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, marginBottom: 8, color: "#1a202c" }}>
                          "{item.prompt}"
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>Généré le {item.date}</p>
                      </div>
                      <button
                        onClick={() => downloadImage(item.imageUrl, `avatar-${item.date}`)}
                        style={{ background: "#48bb78", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: "0.9rem" }}
                      >
                        ↓
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showFullImage && result?.imageUrl && (
          <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setShowFullImage(false)}
          >
            <div style={{ maxWidth: "90vw", maxHeight: "90vh", textAlign: "center" }}>
              <img src={result.imageUrl} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "12px" }} alt="Avatar généré" />
              <p style={{ color: "white", marginTop: 20 }}>Cliquez pour fermer</p>
            </div>
          </div>
        )}

        {showAuth && (
          <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <div style={{ background: "white", padding: 40, borderRadius: 25, maxWidth: 500, width: "90%", textAlign: "center" }}>
              <h2 style={{ marginBottom: 20 }}>Créer un compte pour acheter</h2>
              <p style={{ marginBottom: 30, color: "#64748b" }}>Pour acheter des crédits et sauvegarder votre historique, vous devez créer un compte gratuit.</p>
              <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
                <button onClick={handleCreateAccount} style={{ padding: "15px 30px", background: "#48bb78", color: "white", border: "none", borderRadius: 12, cursor: "pointer" }}>
                  Créer un compte
                </button>
                <button onClick={() => setShowAuth(false)} style={{ padding: "15px 30px", background: "#f1f5f9", border: "none", borderRadius: 12, cursor: "pointer" }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {showPricing && (
          <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <div style={{ background: "white", padding: 40, borderRadius: 25, maxWidth: 700, width: "90%" }}>
              <h2 style={{ textAlign: "center", marginBottom: 30 }}>Packs de crédits</h2>

              {!session && (
                <div style={{ background: "#fef3c7", padding: 20, borderRadius: 15, marginBottom: 25, textAlign: "center" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#92400e" }}>Créez un compte pour acheter des crédits</h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#92400e" }}>Les crédits achetés seront sauvegardés dans votre compte</p>
                </div>
              )}

              {credits === 0 && !session && (
                <div style={{ background: "#f0f9ff", padding: 20, borderRadius: 15, marginBottom: 25, textAlign: "center" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#0369a1" }}>Crédits gratuits épuisés</h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#0369a1" }}>
                    Vous avez utilisé vos 3 crédits gratuits. Achetez des crédits pour continuer à générer des avatars !
                  </p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                <div style={{ border: "2px solid #667eea", padding: 25, borderRadius: 18, textAlign: "center" }}>
                  <h3 style={{ margin: "0 0 10px 0" }}>Pack Starter</h3>
                  <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#667eea", margin: "10px 0" }}>2€</div>
                  <div style={{ marginBottom: 15 }}>10 crédits</div>
                  <button onClick={() => buyCredits(10)} style={{ width: "100%", padding: "12px 20px", background: "#667eea", color: "white", border: "none", borderRadius: 12, cursor: "pointer" }}>
                    Acheter
                  </button>
                </div>

                <div style={{ border: "2px solid #48bb78", padding: 25, borderRadius: 18, textAlign: "center", position: "relative" }}>
                  <div style={{ position: "absolute", top: -12, right: 15, background: "#48bb78", color: "white", padding: "8px 15px", borderRadius: 15, fontSize: "0.8rem" }}>POPULAIRE</div>
                  <h3 style={{ margin: "0 0 10px 0" }}>Pack Pro</h3>
                  <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#48bb78", margin: "10px 0" }}>5€</div>
                  <div style={{ marginBottom: 15 }}>30 crédits</div>
                  <button onClick={() => buyCredits(30)} style={{ width: "100%", padding: "12px 20px", background: "#48bb78", color: "white", border: "none", borderRadius: 12, cursor: "pointer" }}>
                    Acheter
                  </button>
                </div>

                <div style={{ border: "2px solid #8b5cf6", padding: 25, borderRadius: 18, textAlign: "center", position: "relative" }}>
                  <div style={{ position: "absolute", top: -12, right: 15, background: "#8b5cf6", color: "white", padding: "8px 15px", borderRadius: 15, fontSize: "0.8rem" }}>MEILLEURE VALEUR</div>
                  <h3 style={{ margin: "0 0 10px 0" }}>Pack Premium</h3>
                  <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#8b5cf6", margin: "10px 0" }}>10€</div>
                  <div style={{ marginBottom: 15 }}>70 crédits</div>
                  <button onClick={() => buyCredits(70)} style={{ width: "100%", padding: "12px 20px", background: "#8b5cf6", color: "white", border: "none", borderRadius: 12, cursor: "pointer" }}>
                    Acheter
                  </button>
                </div>
              </div>

              <button onClick={() => setShowPricing(false)} style={{ marginTop: 25, width: "100%", padding: 12, background: "#f1f5f9", border: "none", borderRadius: 12, cursor: "pointer" }}>
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ——— Grille principale ——— */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
          {/* ——— Colonne gauche : Exemple ——— */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 25,
              padding: 40,
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 600, color: "#1a202c", marginBottom: 10 }}>Exemple de transformation</h2>
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Découvrez ce que MonAvatarIA peut créer pour vous</p>
            </div>

            <div style={{ display: "flex", gap: 20, marginBottom: 25, alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: 10, fontWeight: 500 }}>Photo originale</p>
                <img
                  src="/images/example-original.jpg"
                  alt="Photo originale"
                  style={{ width: 100, height: 100, borderRadius: 15, objectFit: "cover", border: "2px solid #e2e8f0" }}
                />
              </div>
              <div style={{ fontSize: "1.5rem", color: "#48bb78", fontWeight: "bold" }}>→</div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: 10, fontWeight: 500 }}>Avatar généré</p>
                <img
                  src="/images/example-generated.jpg"
                  alt="Avatar généré dans un café parisien"
                  style={{ width: 100, height: 100, borderRadius: 15, objectFit: "cover", border: "2px solid #48bb78", boxShadow: "0 4px 12px rgba(72, 187, 120, 0.3)" }}
                />
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: 20, borderRadius: 15, border: "1px solid #e2e8f0", marginBottom: 20 }}>
              <p style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600, marginBottom: 8 }}>Prompt utilisé :</p>
              <p style={{ fontSize: "0.9rem", color: "#334155", fontStyle: "italic", lineHeight: 1.4, margin: 0 }}>
                "dans un café parisien, costume élégant, éclairage naturel, style professionnel"
              </p>
            </div>

            <button
              onClick={() => router.push("/exemples")}
              style={{ width: "100%", padding: 12, background: "linear-gradient(135deg, #667eea 0%, #5a67d8 100%)", color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 500 }}
            >
              Voir plus d'exemples
            </button>
          </div>

          {/* ——— Colonne droite : Génération ——— */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: 25,
              padding: 40,
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 600, color: "#1a202c", marginBottom: 10 }}>Créez votre avatar</h2>
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Uploadez votre photo et décrivez le style souhaité</p>
            </div>

            {credits === 3 && !session && (
              <div
                style={{
                  background: "#f0f9ff",
                  padding: 15,
                  borderRadius: 12,
                  marginBottom: 20,
                  textAlign: "center",
                  border: "1px solid #bfdbfe",
                }}
              >
                <p style={{ fontSize: "0.9rem", color: "#0369a1", fontWeight: 600, margin: 0 }}>🎉 3 crédits gratuits offerts ! Testez maintenant</p>
              </div>
            )}

            {uiError && (
              <div style={{ background: "#fef2f2", border: "2px solid #ef4444", color: "#7f1d1d", borderRadius: 12, padding: 12, marginBottom: 16 }}>
                {uiError}
              </div>
            )}

            <div style={{ marginBottom: 25 }}>
              <h3 style={{ marginBottom: 15, fontSize: "1.1rem" }}>Votre Photo</h3>
              <div
                onClick={() => ref.current?.click()}
                style={{
                  border: "3px dashed #e2e8f0",
                  borderRadius: 15,
                  padding: 30,
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: 180,
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {preview ? (
                  <img src={preview} style={{ maxHeight: 120, borderRadius: 12 }} alt="Prévisualisation" />
                ) : (
                  <div>
                    <div style={{ fontSize: "3rem", marginBottom: 10 }}>📸</div>
                    <p style={{ fontSize: "0.9rem" }}>Cliquez pour uploader</p>
                  </div>
                )}
              </div>
              <input ref={ref} type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
            </div>

            <div style={{ marginBottom: 25 }}>
              <h3 style={{ marginBottom: 15, fontSize: "1.1rem" }}>Description</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="dans un café parisien, en costume élégant..."
                style={{ width: "100%", height: 100, padding: 15, border: "2px solid #e2e8f0", borderRadius: 12, resize: "none", fontSize: "0.9rem" }}
              />
            </div>

            <button
              onClick={generate}
              disabled={!image || !prompt || loading}
              style={{
                width: "100%",
                padding: 15,
                fontSize: "1.1rem",
                background: loading ? "#a0aec0" : credits > 0 ? "#48bb78" : "#ef4444",
                color: "white",
                border: "none",
                borderRadius: 12,
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: 20,
                fontWeight: 600,
              }}
            >
              {loading
                ? "Création en cours..."
                : credits > 0
                ? `Créer mon avatar (${credits} crédit${credits > 1 ? "s" : ""} restant${credits > 1 ? "s" : ""})`
                : "Acheter des crédits"}
            </button>

            {credits === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  background: "#fef3c7",
                  border: "2px solid #f59e0b",
                  borderRadius: 15,
                  marginBottom: 20,
                }}
              >
                <h3 style={{ color: "#92400e", marginBottom: 10, fontSize: "1.1rem" }}>Plus de crédits !</h3>
                <p style={{ color: "#92400e", marginBottom: 15, fontSize: "0.9rem" }}>
                  Vous avez épuisé vos crédits gratuits. Achetez un pack pour continuer à créer des avatars incroyables !
                </p>
                <button onClick={() => setShowPricing(true)} style={{ padding: "10px 20px", background: "#f59e0b", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
                  Voir les offres
                </button>
              </div>
            )}

            {result && (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  background: result?.imageUrl ? "#f0fdf4" : "#fef2f2",
                  border: `2px solid ${result?.imageUrl ? "#48bb78" : "#ef4444"}`,
                  borderRadius: 15,
                }}
              >
                {result.imageUrl ? (
                  <div>
                    <h3 style={{ color: "#065f46", marginBottom: 15, fontSize: "1.2rem" }}>Avatar généré !</h3>
                    <div style={{ marginBottom: 15 }}>
                      <img
                        src={result.imageUrl}
                        style={{ maxWidth: 200, maxHeight: 200, borderRadius: 15, cursor: "pointer", transition: "all 0.3s ease" }}
                        onClick={() => setShowFullImage(true)}
                        alt="Avatar généré"
                      />
                      <p style={{ marginTop: 10, color: "#64748b", fontSize: "0.8rem" }}>Cliquez pour agrandir</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                      <button onClick={() => downloadImage(result.imageUrl!)} style={{ padding: "10px 20px", background: "#48bb78", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, fontSize: "0.9rem" }}>
                        Télécharger
                      </button>
                      <button onClick={() => setResult(null)} style={{ padding: "10px 20px", background: "#6b7280", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.9rem" }}>
                        Nouveau
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ color: "#dc2626", marginBottom: 15 }}>Génération échouée</h3>
                    <p style={{ color: "#7f1d1d", marginBottom: 15, fontSize: "0.9rem" }}>{result.message}</p>
                    <button onClick={() => setResult(null)} style={{ padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
                      Réessayer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
