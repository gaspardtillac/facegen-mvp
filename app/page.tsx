"use client";
import React, { useState, useRef, useEffect } from "react";
import { apiService } from "./services/apiService";
import PricingModal from "./components/PricingModal";

export default function FaceGenApp() {
  const [user, setUser] = useState(null);
  const [activeMode, setActiveMode] = useState("faceswap");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [textPrompt, setTextPrompt] = useState("");
  const [videoImage, setVideoImage] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authData, setAuthData] = useState({ email: "", password: "" });
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [history, setHistory] = useState([]);

  const ref = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    checkAuth();
  }, []);
useEffect(() => {
  if (showHistory && user) {
    loadHistory();
  }
}, [showHistory, user]);
  useEffect(() => {
    if (showHistory && user) {
      loadHistory();
    }
  }, [showHistory, user]);

  const checkAuth = async () => {
    try {
      const userData = await apiService.getProfile();
      setUser(userData.user);
    } catch (error) {
      console.log("Non connecté");
    }
  };

  const upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadVideo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setVideoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      let userData;
      if (authMode === "login") {
        userData = await apiService.login(authData.email, authData.password);
      } else {
        userData = await apiService.register(authData.email, authData.password);
      }
      setUser(userData.user);
      setShowAuth(false);
      setAuthData({ email: "", password: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setShowMenu(false);
  };

  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateFaceSwap = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const response = await apiService.generateImage(prompt, base64, image.type);
          
          setResult({
            hasImage: response.success,
            imageUrl: response.success ? response.imageUrl : null,
            message: response.message,
            type: 'faceswap'
          });
          
          if (response.success) {
            loadHistory();
          }
        } catch (error) {
          setResult({
            hasImage: false,
            imageUrl: null,
            message: error.message,
            type: 'faceswap'
          });
        }
        setLoading(false);
      };
      reader.readAsDataURL(image);
    } catch (error) {
      setResult({
        hasImage: false,
        imageUrl: null,
        message: "Erreur lors de la génération",
        type: 'faceswap'
      });
      setLoading(false);
    }
  };

  const generateTextToImage = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.generateTextToImage(textPrompt);
      
      setResult({
        hasImage: response.success,
        imageUrl: response.success ? response.imageUrl : null,
        message: response.message,
        type: 'texttoimage'
      });
      
      if (response.success) {
        loadHistory();
      }
    } catch (error) {
      setResult({
        hasImage: false,
        imageUrl: null,
        message: error.message,
        type: 'texttoimage'
      });
    }
    setLoading(false);
  };

  const generateImageToVideo = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const response = await apiService.generateImageToVideo(videoPrompt, base64, videoImage.type);
          
          setResult({
            hasImage: response.success,
            imageUrl: response.success ? response.videoUrl : null,
            message: response.message,
            type: 'imagetovideo'
          });
          
          if (response.success) {
            loadHistory();
          }
        } catch (error) {
          setResult({
            hasImage: false,
            imageUrl: null,
            message: error.message,
            type: 'imagetovideo'
          });
        }
        setLoading(false);
      };
      reader.readAsDataURL(videoImage);
    } catch (error) {
      setResult({
        hasImage: false,
        imageUrl: null,
        message: "Erreur lors de la génération vidéo",
        type: 'imagetovideo'
      });
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await apiService.getHistory();
      setHistory(response.history || []);
    } catch (error) {
      console.error("Erreur chargement historique:", error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", background: "rgba(255, 255, 255, 0.95)", borderRadius: "25px", padding: "20px 30px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
            MonAvatarIA
          </h1>
          
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            {user ? (
              <div style={{ position: "relative" }}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ background: "#48bb78", color: "white", border: "none", padding: "12px 20px", borderRadius: "12px", cursor: "pointer", fontSize: "1rem", fontWeight: "600" }}
                >
                  {user.email} ({user.credits || 0} crédits)
                </button>
                {showMenu && (
                  <div style={{ position: "absolute", top: "100%", right: 0, background: "white", border: "2px solid #e2e8f0", borderRadius: "12px", padding: "10px", zIndex: 1000, minWidth: "200px" }}>
                    <button onClick={() => setShowPricing(true)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px", cursor: "pointer", borderRadius: "8px" }}>
                      Acheter des crédits
                    </button>
                    <button onClick={() => { setShowHistory(true); setShowMenu(false); }} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px", cursor: "pointer", borderRadius: "8px" }}>
                      Mes générations
                    </button>
                    <button onClick={logout} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px", cursor: "pointer", borderRadius: "8px", color: "#ef4444" }}>
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                style={{ background: "#48bb78", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontSize: "1rem", fontWeight: "600" }}
              >
                Se connecter
              </button>
            )}
          </div>
        </div>

        {showMenu && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setShowMenu(false)} />
        )}

        <div style={{ 
          background: "rgba(255, 255, 255, 0.95)", 
          borderRadius: "25px", 
          padding: "30px",
          marginBottom: "40px"
        }}>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveMode("faceswap")}
              style={{
                padding: "15px 25px",
                borderRadius: "15px",
                border: "none",
                background: activeMode === "faceswap" ? "#48bb78" : "#f1f5f9",
                color: activeMode === "faceswap" ? "white" : "#64748b",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Avatar Personnalisé
            </button>
            <button
              onClick={() => setActiveMode("texttoimage")}
              style={{
                padding: "15px 25px",
                borderRadius: "15px",
                border: "none",
                background: activeMode === "texttoimage" ? "#48bb78" : "#f1f5f9",
                color: activeMode === "texttoimage" ? "white" : "#64748b",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Génération d'Images
            </button>
            <button
              onClick={() => setActiveMode("imagetovideo")}
              style={{
                padding: "15px 25px",
                borderRadius: "15px",
                border: "none",
                background: activeMode === "imagetovideo" ? "#48bb78" : "#f1f5f9",
                color: activeMode === "imagetovideo" ? "white" : "#64748b",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Génération de Vidéos
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
          
          {activeMode === "faceswap" && (
            <div style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "25px", padding: "40px" }}>
              <h2 style={{ fontSize: "1.6rem", textAlign: "center", marginBottom: "30px" }}>
                Créez votre avatar
              </h2>

              <div style={{ marginBottom: "25px" }}>
                <h3>Votre Photo</h3>
                <div onClick={() => ref.current?.click()} style={{ border: "3px dashed #e2e8f0", borderRadius: "15px", padding: "30px", textAlign: "center", cursor: "pointer", minHeight: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {preview ? (
                    <img src={preview} style={{ maxHeight: "120px", borderRadius: "12px" }} />
                  ) : (
                    <div>
                      <div style={{ fontSize: "3rem" }}>📸</div>
                      <p>Cliquez pour uploader</p>
                    </div>
                  )}
                </div>
                <input ref={ref} type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <h3>Description</h3>
                <textarea 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="dans un café parisien, en costume élégant..." 
                  style={{ width: "100%", height: "100px", padding: "15px", border: "2px solid #e2e8f0", borderRadius: "12px", resize: "none" }}
                />
              </div>
              
              <button 
                onClick={generateFaceSwap} 
                disabled={!image || !prompt || loading || !user} 
                style={{ 
                  width: "100%", 
                  padding: "15px", 
                  fontSize: "1.1rem", 
                  background: loading ? "#a0aec0" : !user ? "#ef4444" : "#48bb78", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "12px", 
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "600"
                }}
              >
                {loading ? "Création en cours..." : !user ? "Se connecter pour générer" : "Créer mon avatar (1 crédit)"}
              </button>
            </div>
          )}

          {activeMode === "texttoimage" && (
            <div style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "25px", padding: "40px" }}>
              <h2 style={{ fontSize: "1.6rem", textAlign: "center", marginBottom: "30px" }}>
                Générez n'importe quelle image
              </h2>

              <div style={{ marginBottom: "25px" }}>
                <h3>Description de l'image</h3>
                <textarea 
                  value={textPrompt} 
                  onChange={(e) => setTextPrompt(e.target.value)} 
                  placeholder="Un paysage de montagne au coucher du soleil..." 
                  style={{ width: "100%", height: "150px", padding: "15px", border: "2px solid #e2e8f0", borderRadius: "12px", resize: "none" }}
                />
                <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "10px" }}>
                  Exemples: "Un chat robot futuriste", "Une forêt magique la nuit", "Portrait d'un astronaute"
                </p>
              </div>
              
              <button 
                onClick={generateTextToImage} 
                disabled={!textPrompt || loading || !user} 
                style={{ 
                  width: "100%", 
                  padding: "15px", 
                  fontSize: "1.1rem", 
                  background: loading ? "#a0aec0" : !user ? "#ef4444" : "#48bb78", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "12px", 
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "600"
                }}
              >
                {loading ? "Génération en cours..." : !user ? "Se connecter pour générer" : "Générer l'image (1 crédit)"}
              </button>
            </div>
          )}

          {activeMode === "imagetovideo" && (
            <div style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "25px", padding: "40px" }}>
              <h2 style={{ fontSize: "1.6rem", textAlign: "center", marginBottom: "30px" }}>
                Transformez une image en vidéo
              </h2>

              <div style={{ marginBottom: "25px" }}>
                <h3>Image à animer</h3>
                <div onClick={() => videoRef.current?.click()} style={{ border: "3px dashed #e2e8f0", borderRadius: "15px", padding: "30px", textAlign: "center", cursor: "pointer", minHeight: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {videoPreview ? (
                    <img src={videoPreview} style={{ maxHeight: "120px", borderRadius: "12px" }} />
                  ) : (
                    <div>
                      <div style={{ fontSize: "3rem" }}>🎬</div>
                      <p>Cliquez pour uploader une image</p>
                    </div>
                  )}
                </div>
                <input ref={videoRef} type="file" accept="image/*" onChange={uploadVideo} style={{ display: "none" }} />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <h3>Description du mouvement</h3>
                <textarea 
                  value={videoPrompt} 
                  onChange={(e) => setVideoPrompt(e.target.value)} 
                  placeholder="La personne sourit et fait un clin d'œil..." 
                  style={{ width: "100%", height: "120px", padding: "15px", border: "2px solid #e2e8f0", borderRadius: "12px", resize: "none" }}
                />
                <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "10px" }}>
                  Exemples: "Les feuilles bougent dans le vent", "La personne tourne la tête", "L'eau coule"
                </p>
              </div>
              
              <button 
                onClick={generateImageToVideo} 
                disabled={!videoImage || !videoPrompt || loading || !user} 
                style={{ 
                  width: "100%", 
                  padding: "15px", 
                  fontSize: "1.1rem", 
                  background: loading ? "#a0aec0" : !user ? "#ef4444" : "#48bb78", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "12px", 
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "600"
                }}
              >
                {loading ? "Génération en cours..." : !user ? "Se connecter pour générer" : "Générer la vidéo (2 crédits)"}
              </button>
            </div>
          )}

          <div style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "25px", padding: "40px" }}>
            {result ? (
              <div style={{ textAlign: "center", padding: "20px", background: result.hasImage ? "#f0fdf4" : "#fef2f2", border: `2px solid ${result.hasImage ? "#48bb78" : "#ef4444"}`, borderRadius: "15px" }}>
                {result.hasImage && result.imageUrl ? (
                  <div>
                    <h3 style={{ color: "#065f46", marginBottom: "15px" }}>
                      {result.type === 'faceswap' ? 'Avatar généré !' : 
                       result.type === 'texttoimage' ? 'Image générée !' : 
                       'Vidéo générée !'}
                    </h3>
                    {result.type === 'imagetovideo' ? (
                      <video 
                        src={result.imageUrl} 
                        controls 
                        style={{ maxWidth: "200px", borderRadius: "15px", marginBottom: "15px" }}
                      />
                    ) : (
                      <img src={result.imageUrl} style={{ maxWidth: "200px", borderRadius: "15px", marginBottom: "15px" }} />
                    )}
                    <br />
                    <button onClick={() => downloadImage(result.imageUrl)} style={{ background: "#48bb78", color: "white", border: "none", padding: "12px 24px", borderRadius: "10px", cursor: "pointer", fontSize: "1rem", fontWeight: "600" }}>
                      Télécharger
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ color: "#dc2626", marginBottom: "15px" }}>Génération échouée</h3>
                    <p style={{ color: "#7f1d1d" }}>{result.message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "600", color: "#1a202c", marginBottom: "30px", textAlign: "center" }}>
                  {activeMode === "faceswap" ? "Comment ça marche" : 
                   activeMode === "texttoimage" ? "Conseils pour de meilleures images" :
                   "Conseils pour de meilleures vidéos"}
                </h2>
                
                {activeMode === "faceswap" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#48bb78", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>1</div>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1a202c" }}>Uploadez votre photo</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Une photo claire de votre visage</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#48bb78", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>2</div>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1a202c" }}>Décrivez le style</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Ex: "en costume dans un bureau moderne"</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#48bb78", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>3</div>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1a202c" }}>Obtenez votre avatar</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Image haute qualité générée par IA</p>
                      </div>
                    </div>
                  </div>
                ) : activeMode === "texttoimage" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#48bb78", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>✨</div>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1a202c" }}>Soyez précis</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Plus votre description est détaillée, meilleur sera le résultat</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#48bb78", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>🎨</div>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1a202c" }}>Mentionnez le style</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Photorealistic, cartoon, painting, etc.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#48bb78", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>💡</div>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1a202c" }}>Expérimentez</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Testez différents prompts pour des résultats variés</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#48bb78", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>🎬</div>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1a202c" }}>Image de qualité</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Utilisez une image nette et bien éclairée</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#48bb78", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>⚡</div>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1a202c" }}>Mouvement simple</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Décrivez des mouvements subtils et naturels</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#48bb78", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>⏱️</div>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#1a202c" }}>Patience</h4>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>La génération vidéo prend plus de temps</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAuth && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "20px", maxWidth: "400px", width: "90%" }}>
            <div style={{ display: "flex", marginBottom: "20px" }}>
              <button 
                onClick={() => setAuthMode("login")} 
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  border: "none", 
                  background: authMode === "login" ? "#48bb78" : "transparent",
                  color: authMode === "login" ? "white" : "#64748b",
                  borderRadius: "8px 0 0 8px",
                  cursor: "pointer"
                }}
              >
                Connexion
              </button>
              <button 
                onClick={() => setAuthMode("register")} 
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  border: "none", 
                  background: authMode === "register" ? "#48bb78" : "transparent",
                  color: authMode === "register" ? "white" : "#64748b",
                  borderRadius: "0 8px 8px 0",
                  cursor: "pointer"
                }}
              >
                Inscription
              </button>
            </div>
            
            <form onSubmit={handleAuth}>
              <input
                type="email"
                placeholder="Email"
                value={authData.email}
                onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                style={{ width: "100%", padding: "12px", marginBottom: "15px", border: "2px solid #e2e8f0", borderRadius: "8px" }}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={authData.password}
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                style={{ width: "100%", padding: "12px", marginBottom: "20px", border: "2px solid #e2e8f0", borderRadius: "8px" }}
                required
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ flex: 1, padding: "12px", background: "#48bb78", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                  {authMode === "login" ? "Se connecter" : "S'inscrire"}
                </button>
                <button type="button" onClick={() => setShowAuth(false)} style={{ flex: 1, padding: "12px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistory && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "20px", maxWidth: "900px", width: "90%", maxHeight: "80%", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <h2>Mes générations</h2>
              <button onClick={() => setShowHistory(false)} style={{ background: "#f1f5f9", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>
                Fermer
              </button>
            </div>
            
            {history.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "25px" }}>
                {history.map((item, index) => (
                  <div key={index} style={{ border: "2px solid #e2e8f0", borderRadius: "15px", padding: "20px", textAlign: "center" }}>
                    {item.imageUrl.includes('.mp4') ? (
                      <video src={item.imageUrl} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "12px", marginBottom: "15px" }} />
                    ) : (
                      <img src={item.imageUrl} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "12px", marginBottom: "15px" }} />
                    )}
                    <p style={{ fontSize: "0.85rem", margin: "10px 0" }}>
                      "{item.prompt.substring(0, 60)}..."
                    </p>
                    <button onClick={() => downloadImage(item.imageUrl)} style={{ background: "#48bb78", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎨</div>
                <h3>Aucune génération pour le moment</h3>
                <p>Créez votre première création pour la voir apparaître ici !</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showPricing && (
        <PricingModal 
          isOpen={showPricing} 
          onClose={() => setShowPricing(false)} 
        />
      )}
    </div>
  );
}
