# Groceries (Expo / React Native / Supabase)

Application Android de gestion de courses / ingrédients / recettes.

- **Frontend** : Expo + React Native + TypeScript
- **Navigation** : React Navigation (Stack)
- **Backend** : Supabase (Auth + Postgres + RLS), utilisé directement depuis l’app
- **CI** : Lint + Snyk + CodeQL + Build Android EAS + publication du lien APK en base

---

## Prérequis

- **Node.js 20+**
- **Git**
- Un compte **Expo** (si tu veux builder avec EAS)
- Un projet **Supabase** (si tu veux utiliser ta propre base)

Outils recommandés :

- VS Code
- Android Studio (émulateur Android)

---

## Structure du projet

Le code mobile est dans :

```
project/mobile/
  App.tsx
  src/
    api/
      supabase.ts
    screens/
    theme/
  app.json
  eas.json
  package.json
```

---

## Installation (setup local)

### 1) Cloner le repo

```bash
git clone <repo-url>
cd Groceries
```

### 2) Installer les dépendances

Toujours dans le dossier mobile :

```bash
cd project/mobile
npm ci
```

> `npm ci` est recommandé (reproductible).  
> Si tu n’as pas de `package-lock.json`, utilise `npm install`.

---

## Configuration Supabase (env)

Le projet utilise des variables Expo publiques pour se connecter à Supabase.

### 1) Créer un fichier `.env` (local uniquement)

Dans `project/mobile/`, crée un fichier `.env` :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Ces variables sont publiques (clé anon) et peuvent être embarquées dans l’app.  
Ne jamais mettre une clé `service_role` dans l’app mobile.

### 2) Vérifier que `.env` est ignoré par Git

Dans `.gitignore` :

```
.env
```

---

## Lancer l’app (dev)

Dans `project/mobile` :

```bash
npx expo start
```

Puis :

- `a` : lancer sur Android (émulateur)
- ou scanner le QR code avec Expo Go

---

## Linter (ESLint + Prettier)

### Vérifier le code

```bash
npm run lint
```

### Corriger automatiquement

```bash
npm run lint:fix
```

ou

```bash
npx eslint . --fix
```

---

## Formatage (Prettier)

```bash
npm run format
```

ou

```bash
npx prettier . --write
```

---

## Tests

```bash
npm test
```

---

## Build Android (EAS)

### Login Expo

```bash
npx expo login
```

### Build APK

```bash
npx eas build -p android --profile preview
```

---

## CI / Sécurité (GitHub Actions)

Le repo contient 2 workflows :

### 1) CI (sur Pull Request)

- ESLint
- Snyk (vulnérabilités dépendances)
- CodeQL (analyse sécurité du code)

### 2) Build Android (sur merge main)

- Build APK avec EAS
- Récupère URL du build
- Met à jour Supabase `AppConfig`

---

## Secrets GitHub requis

Repo → Settings → Secrets → Actions :

```
EXPO_TOKEN
SNYK_TOKEN
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

La clé `service_role` est utilisée uniquement côté CI, jamais dans l’app.

---

## Supabase : table AppConfig

La CI stocke les infos de build :

- android_apk_url_preview
- android_app_version
- android_version_code

Important : `name` doit être UNIQUE :

```sql
ALTER TABLE public."AppConfig"
ADD CONSTRAINT appconfig_name_unique UNIQUE ("name");
```

---

## Workflow de contribution

1. Créer une branche
2. Ouvrir une Pull Request
3. La CI vérifie le code
4. Merge → build automatique + lien APK en base

---

## Dépannage

### Invalid project root

Toujours être dans `project/mobile`

### Warning CRLF / LF (Windows)

Optionnel :

```bash
git config --global core.autocrlf input
```

---

## Licence

TBD
