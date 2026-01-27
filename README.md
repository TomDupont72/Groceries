# Retro Trader — FastAPI + React (Vite)

Outil local, minimaliste (noir & blanc) pour tester des idées de portefeuille et calculer des stats à partir de CSV.

---

## Prérequis
- **Python** ≥ 3.10
- **Node.js** ≥ 18 (avec **npm**)
- Vos CSV dans `provider/data/{category}/daily/{name}.csv` (colonnes : au minimum `Date`, `Close`).

---

## Installation

### Backend (FastAPI)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1    # Windows
# source .venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
```

### Frontend (React + Vite)
```powershell
cd ../frontend
npm install
```

---

## Lancement (développement)

### 1) Démarrer l’API FastAPI
> À lancer depuis la **racine du projet** (le dossier qui contient `backend/` et `frontend/`).
```powershell
uvicorn backend.main:app --reload --port 8000
```
API disponible sur : `http://127.0.0.1:8000`

### 2) Démarrer le front React
```powershell
cd frontend
npm run dev
```
Front disponible sur : `http://127.0.0.1:5173`

> En dev, le proxy Vite redirige les requêtes **/api** vers `http://127.0.0.1:8000`.

---

## Données attendues (rapide)
- Chemin : `provider/data/{category}/daily/{name}.csv`
- Colonnes : `Date` (YYYY-MM-DD), `Close` (et éventuellement `Open, High, Low, Volume`).
- Exemple : `provider/data/EU/daily/Air Liquide.csv`

---

## URLs utiles
- Accueil (front) : `http://127.0.0.1:5173`
- Santé API : `http://127.0.0.1:8000/api/health`
- Stats exemple : `http://127.0.0.1:8000/api/stats?name=Air%20Liquide&category=EU`

---

Bon hack ! 🖤

