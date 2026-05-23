#!/usr/bin/env bash
set -euo pipefail

echo "=== TERRAFORM Setup ==="
echo ""

# Check for Ollama
if ! command -v ollama &>/dev/null; then
  echo "WARNING: Ollama not found. Install it: https://ollama.ai"
  echo "  brew install ollama"
else
  echo "✓ Ollama found"
  # Pull recommended model
  if ollama list 2>/dev/null | grep -q "qwen2.5"; then
    echo "  → qwen2.5:14b already pulled"
  else
    echo "  → Pulling qwen2.5:14b (this may take a while)..."
    ollama pull qwen2.5:14b
  fi
fi

# Backend setup
echo ""
echo "=== Backend ==="
cd backend
python3 -m venv venv 2>/dev/null || python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "✓ Backend dependencies installed"
cd ..

# Frontend setup
echo ""
echo "=== Frontend ==="
cd frontend
npm install
echo "✓ Frontend dependencies installed"
cd ..

echo ""
echo "=== TERRAFORM Ready ==="
echo ""
echo "Start the backend:"
echo "  cd backend && source venv/bin/activate && python -m terraform.app"
echo ""
echo "Start the frontend (in another terminal):"
echo "  cd frontend && npm run dev"
echo ""
echo "Open http://localhost:3000"
