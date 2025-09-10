"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ExemplesPage() {
  const router = useRouter();

  const examples = [
    {
      id: 1,
      originalImage: "/examples/original.jpg",
      generatedImage: "/examples/avatar-adventurer.jpg",
      prompt: "tenue d'aventurier indiana jones dans une forêt tropicale naturel et réaliste",
      title: "Aventurier Indiana Jones",
      description: "Transformation en explorateur dans la jungle"
    },
    {
      id: 2,
      originalImage: "/examples/original.jpg", 
      generatedImage: "/examples/avatar-disco.jpg",
      prompt: "Le personnage porte des vêtements disco d'homme, il est dans un bar à paris",
      title: "Style Disco Parisien",
      description: "Ambiance rétro dans un bar parisien"
    },
    {
      id: 3,
      originalImage: "/examples/original.jpg",
      generatedImage: "/examples/avatar-businessman.jpg", 
      prompt: "costume d'homme d'affaires milliardaire à new york",
      title: "Businessman New York",
      description: "Look de milliardaire à Manhattan"
    }
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.9) 50%, rgba(55, 48, 163, 1) 100%)",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* EN-TÊTE */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "40px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(15px)",
          padding: "15px 25px",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: "900", 
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            margin: "0"
          }}>
            Galerie d'exemples
          </h1>
          
          <button 
            onClick={() => router.push("/")} 
            style={{ 
              background: "rgba(255,255,255,0.2)", 
              color: "white", 
              border: "1px solid rgba(255,255,255,0.3)", 
              padding: "10px 20px", 
              borderRadius: "15px", 
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500"
            }}
          >
            ← Retour
          </button>
        </div>

        {/* DESCRIPTION */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "50px",
          background: "rgba(255, 255, 255, 0.95)",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "600", color: "#1a202c", marginBottom: "15px" }}>
            Découvrez les possibilités infinies
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto" }}>
            Voici quelques exemples de transformations réalisées avec MonAvatarIA. 
            Même photo de base, résultats complètement différents selon votre imagination !
          </p>
        </div>

        {/* GRILLE D'EXEMPLES */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
          gap: "30px",
          marginBottom: "40px"
        }}>
          {examples.map((example) => (
            <div key={example.id} style={{ 
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "25px",
              padding: "30px",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
            >
              
              {/* TITRE */}
              <h3 style={{ 
                fontSize: "1.3rem", 
                fontWeight: "600", 
                color: "#1a202c", 
                marginBottom: "10px",
                textAlign: "center"
              }}>
                {example.title}
              </h3>
              
              <p style={{ 
                color: "#64748b", 
                fontSize: "0.9rem", 
                textAlign: "center",
                marginBottom: "25px"
              }}>
                {example.description}
              </p>

              {/* TRANSFORMATION */}
              <div style={{ 
                display: "flex", 
                gap: "15px", 
                alignItems: "center", 
                justifyContent: "center",
                marginBottom: "25px"
              }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "8px", fontWeight: "500" }}>
                    Original
                  </p>
                  <img 
                    src={example.originalImage} 
                    alt="Photo originale"
                    style={{ 
                      width: "80px", 
                      height: "80px", 
                      borderRadius: "12px", 
                      objectFit: "cover",
                      border: "2px solid #e2e8f0"
                    }} 
                  />
                </div>
                
                <div style={{ fontSize: "1.2rem", color: "#48bb78", fontWeight: "bold" }}>
                  →
                </div>
                
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "8px", fontWeight: "500" }}>
                    Généré
                  </p>
                  <img 
                    src={example.generatedImage} 
                    alt={`Avatar ${example.title}`}
                    style={{ 
                      width: "80px", 
                      height: "80px", 
                      borderRadius: "12px", 
                      objectFit: "cover",
                      border: "2px solid #48bb78",
                      boxShadow: "0 4px 12px rgba(72, 187, 120, 0.3)"
                    }} 
                  />
                </div>
              </div>

              {/* PROMPT */}
              <div style={{ 
                background: "#f8fafc", 
                padding: "15px", 
                borderRadius: "12px", 
                border: "1px solid #e2e8f0"
              }}>
                <p style={{ fontSize: "0.75rem", color: "#475569", fontWeight: "600", marginBottom: "5px" }}>
                  Prompt utilisé :
                </p>
                <p style={{ 
                  fontSize: "0.85rem", 
                  color: "#334155", 
                  fontStyle: "italic", 
                  lineHeight: "1.4", 
                  margin: "0"
                }}>
                  "{example.prompt}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CALL TO ACTION */}
        <div style={{ 
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.95)",
          padding: "40px",
          borderRadius: "25px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1a202c", marginBottom: "15px" }}>
            Prêt à créer votre avatar ?
          </h3>
          <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "25px" }}>
            Uploadez votre photo et laissez libre cours à votre imagination !
          </p>
          <button 
            onClick={() => router.push("/")}
            style={{ 
              background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)", 
              color: "white", 
              border: "none", 
              padding: "15px 30px", 
              borderRadius: "15px", 
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "600",
              boxShadow: "0 8px 20px rgba(72, 187, 120, 0.3)"
            }}
          >
            Commencer maintenant
          </button>
        </div>

      </div>
    </div>
  );
}
