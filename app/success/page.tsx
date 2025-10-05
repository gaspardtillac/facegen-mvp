"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Paiement réussi !</h1>
        <p className="text-gray-600">Vos crédits ont été ajoutés à votre 
compte.</p>
        {session_id && (
          <p className="text-sm text-gray-400 mt-4">Session: {session_id}</p>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
