#!/bin/bash

echo "=== Test Backend MonAvatarIA ==="

# Test 1: Inscription
echo "1. Test d'inscription..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

echo "Réponse inscription: $REGISTER_RESPONSE"

# Extraire le token (basique, fonctionne si tout va bien)
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "Token reçu: ${TOKEN:0:20}..."
    
    # Test 2: Profil
    echo "2. Test de récupération du profil..."
    curl -s -X GET http://localhost:5000/api/auth/profile \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json"
    echo ""
    
    echo "3. Le backend fonctionne !"
    echo "Token à utiliser pour les tests: $TOKEN"
else
    echo "Erreur lors de l'inscription"
fi
