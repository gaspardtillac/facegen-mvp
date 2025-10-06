"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Video states
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoImage, setVideoImage] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  const generate = async () => {
    if (!image || !prompt) {
      alert("Veuillez uploader une image et entrer un prompt");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/generate`, 
{
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            faceImage: base64,
          }),
        });

        const data = await res.json();
        
        if (data.hasImage) {
          setResult(data.imageUrl);
        } else {
          alert(data.message || "Génération échouée");
        }
        
        setLoading(false);
      };
      reader.readAsDataURL(image);
    } catch (error: any) {
      alert("Erreur: " + error.message);
      setLoading(false);
    }
  };

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setVideoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!videoImage || !videoPrompt) {
      alert("Veuillez uploader une image et entrer un prompt");
      return;
    }

    setVideoLoading(true);
    setVideoResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

const res = await 
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/image-to-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: videoPrompt,
            image: base64,
          }),
        });

        const data = await res.json();
        
        if (data.success) {
          alert("Vidéo en cours de génération. Vérifiez vos notifications.");
        } else {
          alert(data.message || "Génération échouée");
        }
        
        setVideoLoading(false);
      };
      reader.readAsDataURL(videoImage);
    } catch (error: any) {
      alert("Erreur: " + error.message);
      setVideoLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">FaceGen MVP</h1>

      {/* Image Generation Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Génération d'Image</h2>
        
        <input
          type="file"
          accept="image/*"
          onChange={upload}
          className="mb-4 block"
        />

        {preview && (
          <img src={preview} alt="Preview" className="w-48 h-48 object-cover 
mb-4" />
        )}

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Décrivez la scène souhaitée..."
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={generate}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded 
disabled:bg-gray-400"
        >
          {loading ? "Génération..." : "Générer"}
        </button>

        {result && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Résultat :</h3>
            <img src={result} alt="Generated" className="max-w-full rounded 
shadow-lg" />
          </div>
        )}
      </div>

      {/* Video Generation Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">Génération de Vidéo</h2>
        
        <input
          type="file"
          accept="image/*"
          onChange={uploadVideo}
          className="mb-4 block"
        />

        {videoPreview && (
          <img src={videoPreview} alt="Preview" className="w-48 h-48 object-cover 
mb-4" />
        )}

        <input
          type="text"
          value={videoPrompt}
          onChange={(e) => setVideoPrompt(e.target.value)}
          placeholder="Décrivez l'animation souhaitée..."
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={generateVideo}
          disabled={videoLoading}
          className="bg-purple-500 text-white px-6 py-2 rounded 
disabled:bg-gray-400"
        >
          {videoLoading ? "Génération..." : "Générer Vidéo"}
        </button>

        {videoResult && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Vidéo générée :</h3>
            <video src={videoResult} controls className="max-w-full rounded 
shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
