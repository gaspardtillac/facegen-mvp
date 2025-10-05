"use client";
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [packages, setPackages] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPackages();
    }
  }, [isOpen]);

  const loadPackages = async () => {
    try {
      const response = await apiService.getPackages();
      setPackages(response.packages);
    } catch (error) {
      console.error('Erreur chargement forfaits:', error);
    }
  };

  const handlePurchase = async (packageType: string) => {
    setLoading(true);
    try {
      const response = await apiService.createCheckoutSession(packageType);
      if (response.success && response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Erreur création session:', error);
      alert('Erreur lors de la création de la session de paiement');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: "rgba(0,0,0,0.8)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      zIndex: 1000 
    }}>
      <div style={{ 
        background: "white", 
        padding: "40px", 
        borderRadius: "20px", 
        maxWidth: "800px", 
        width: "90%" 
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "30px" 
        }}>
          <h2>Choisissez votre forfait</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: "#f1f5f9", 
              border: "none", 
              padding: "10px 20px", 
              borderRadius: "8px", 
              cursor: "pointer" 
            }}
          >
            Fermer
          </button>
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "25px" 
        }}>
          {Object.entries(packages).map(([key, pkg]: [string, any]) => (
            <div 
              key={key}
              style={{ 
                border: pkg.popular ? "3px solid #48bb78" : "2px solid #e2e8f0",
                borderRadius: "15px", 
                padding: "30px", 
                textAlign: "center",
                position: "relative"
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#48bb78",
                  color: "white",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "600"
                }}>
                  POPULAIRE
                </div>
              )}
              
              <h3 style={{ fontSize: "1.4rem", marginBottom: "10px" }}>
                {pkg.name}
              </h3>
              
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#48bb78", marginBottom: "10px" }}>
                {pkg.price}€
              </div>
              
              <div style={{ fontSize: "1.1rem", marginBottom: "15px" }}>
                {pkg.credits} crédits
              </div>
              
              <p style={{ color: "#64748b", marginBottom: "25px" }}>
                {pkg.description}
              </p>
              
              <button 
                onClick={() => handlePurchase(key)}
                disabled={loading}
                style={{ 
                  width: "100%", 
                  padding: "15px", 
                  background: pkg.popular ? "#48bb78" : "#3b82f6", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "10px", 
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600"
                }}
              >
                {loading ? "Redirection..." : "Acheter"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
