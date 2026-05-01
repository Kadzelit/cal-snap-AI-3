# CLAUDE.md — CalSnap IA

> Ce fichier est ta source de vérité pour ce projet. Lis-le **entièrement** avant toute action. Mets-le à jour si une décision architecturale change.

---

## 1. Vue d'ensemble du projet

**CalSnap IA** est une PWA (Progressive Web App) de tracking calorique alimentée par l'IA. L'utilisateur photographie son repas, l'app détecte les aliments via une API de vision et logge automatiquement calories + macros (protéines, glucides, lipides) dans son journal quotidien.

**Public cible** : utilisateurs francophones cherchant à suivre leur nutrition sans la friction du tracking manuel (type Cal AI / MacroFactor).

**Différenciateur** : reconnaissance photo instantanée + interface premium minimaliste + multi-utilisateur sécurisé + ultra-rapide grâce à Groq + module de recettes personnalisées.

---

## 2. Stack technique (NON-NÉGOCIABLE)

| Couche | Tech | Version / Détail |
|---|---|---|
| Framework | Next.js | 14 (App Router) |
| Langage | TypeScript | strict mode |
| Styling | Tailwind CSS | v3 |
| UI Components | shadcn/ui | dernière version |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth | - |
| Storage | Supabase Storage | bucket `meal-photos` |
| **AI Vision (principal)** | **Groq API** | **Llama 3.2 90B Vision** |
| **AI Vision (fallback)** | abstraction prête pour OpenAI/Claude/Mistral | configurable via env |
| State management | Zustand (global) + React hooks (local) | - |
| Forms | react-hook-form + zod | - |
| Charts | Recharts | - |
| Date utils | date-fns | - |
| PWA | next-pwa | - |
| Deployment | Vercel | - |

**Ne propose JAMAIS** de remplacer un élément de cette stack sans demander explicitement.

---

## 3. Architecture IA — Abstraction Provider

**RÈGLE IMPORTANTE** : l'analyse d'image NE doit PAS être couplée directement à Groq. Tout passe par une **interface d'abstraction** dans `lib/ai/vision.ts`. Ça permet de switcher de provider sans réécrire le code applicatif.

### Structure attendue

```
lib/ai/
├── vision.ts              # Interface publique : analyzeMeal(imageUrl) → MealAnalysis
├── providers/
│   ├── groq.ts            # Implémentation Groq (par défaut)
│   ├── openai.ts          # Implémentation OpenAI (optionnelle)
│   ├── claude.ts          # Implémentation Anthropic (optionnelle)
│   └── mistral.ts         # Implémentation Mistral (optionnelle)
├── prompts.ts             # Prompts partagés entre providers
└── types.ts               # MealAnalysis, ProviderConfig, etc.
```

### Interface publique (TypeScript)

```typescript
// lib/ai/types.ts
export type MealAnalysis = {
  meal_name: string;
  items: Array<{
    name: string;
    estimated_grams: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }>;
  total: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  confidence: number;
};

export type VisionProvider = {
  name: string;
  analyzeMeal: (imageBase64OrUrl: string) => Promise<MealAnalysis>;
};
```

### Sélection du provider

```typescript
// lib/ai/vision.ts
import { groqProvider } from './providers/groq';

const providers = {
  groq: groqProvider,
  // openai: openaiProvider,
  // claude: claudeProvider,
};

const activeProvider = process.env.AI_VISION_PROVIDER || 'groq';
export const visionProvider = providers[activeProvider as keyof typeof providers];

export async function analyzeMeal(imageBase64OrUrl: string) {
  return visionProvider.analyzeMeal(imageBase64OrUrl);
}
```

→ Pour migrer un jour vers Claude ou GPT-4o, il suffit de changer `AI_VISION_PROVIDER` dans `.env.local`.

---

## 4. Configuration Groq

### Modèle utilisé
- **Principal** : `llama-3.2-90b-vision-preview` (qualité max)
- **Alternative low-cost** : `llama-3.2-11b-vision-preview` (plus rapide, légèrement moins précis)

⚠️ **Vérifier le catalogue actuel** sur [console.groq.com/docs/models](https://console.groq.com/docs/models) avant de coder — Groq fait évoluer ses modèles régulièrement. Si le modèle référencé ici n'existe plus, prendre le modèle vision le plus récent dispo et **mettre à jour ce fichier**.

### Limites du free tier (à respecter)
- ~30 requêtes/minute
- ~14 400 requêtes/jour selon le modèle
- Implémenter un **rate limiter côté serveur** (par utilisateur) pour ne pas exploser ces limites
- Implémenter une **gestion d'erreur 429** (rate limit) avec retry exponentiel

### Configuration API
- Endpoint : `https://api.groq.com/openai/v1/chat/completions`
- API compatible OpenAI → on peut utiliser le SDK officiel `groq-sdk` ou `openai` pointé vers Groq
- **Recommandation** : utiliser `groq-sdk` (npm install groq-sdk)

### Code de référence pour le provider Groq

```typescript
// lib/ai/providers/groq.ts
import Groq from 'groq-sdk';
import { MEAL_ANALYSIS_PROMPT } from '../prompts';
import type { VisionProvider, MealAnalysis } from '../types';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const groqProvider: VisionProvider = {
  name: 'groq',
  async analyzeMeal(imageInput: string): Promise<MealAnalysis> {
    const imageUrl = imageInput.startsWith('http')
      ? imageInput
      : `data:image/jpeg;base64,${imageInput}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: MEAL_ANALYSIS_PROMPT },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Réponse vide du modèle');

    const parsed = JSON.parse(content);
    if (parsed.error === 'not_food') {
      throw new Error('NOT_FOOD');
    }

    return parsed as MealAnalysis;
  },
};
```

---

## 5. Prompt d'analyse (adapté à Llama Vision)

```typescript
// lib/ai/prompts.ts
export const MEAL_ANALYSIS_PROMPT = `Tu es un nutritionniste expert. Analyse attentivement cette photo de repas et identifie tous les aliments visibles.

Tu DOIS répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans markdown.

Format attendu :
{
  "meal_name": "Nom du plat principal en français (court et descriptif)",
  "items": [
    {
      "name": "nom de l'aliment en français",
      "estimated_grams": 150,
      "calories": 250,
      "protein_g": 20,
      "carbs_g": 15,
      "fat_g": 10
    }
  ],
  "total": {
    "calories": 250,
    "protein_g": 20,
    "carbs_g": 15,
    "fat_g": 10
  },
  "confidence": 0.85
}

Règles :
- Estime les portions de manière réaliste en regardant les indices visuels (taille de l'assiette, ustensiles).
- Le champ "total" est la somme de tous les "items".
- "confidence" entre 0 et 1 reflète ta certitude sur l'identification.
- Si l'image n'est pas un repas ou est inutilisable, réponds : {"error": "not_food"}`;
```

⚠️ **Note importante sur Llama Vision** : les modèles Llama sont moins fiables que Claude/GPT pour le JSON strict. Toujours :
1. Valider la réponse avec `zod` avant utilisation
2. Gérer les cas où le modèle ajoute du markdown autour du JSON (extraire entre `{` et `}` si besoin)
3. Avoir un fallback UI permettant à l'utilisateur de corriger manuellement

---

## 6. Structure du projet

```
calsnap-ia/
├── app/
│   ├── (auth)/
│   │   ├── login/                   # Connexion
│   │   ├── signup/                  # Inscription
│   │   └── onboarding/
│   │       ├── welcome/             # Écran de bienvenue
│   │       ├── goal/                # Objectif (perdre/maintenir/gagner)
│   │       ├── info/                # Infos personnelles
│   │       ├── activity/            # Niveau d'activité
│   │       └── plan/                # Plan personnalisé généré
│   ├── (app)/
│   │   ├── dashboard/               # Tableau de bord principal
│   │   ├── dashboard-recipes/       # Tableau de bord vue recettes
│   │   ├── scan/                    # Caméra
│   │   ├── analyzing/               # Analyse en cours
│   │   ├── meal/[id]/               # Résultat / édition d'un repas
│   │   ├── recipes/
│   │   │   ├── new/                 # Création d'une recette
│   │   │   └── [id]/                # Détail / édition d'une recette
│   │   ├── stats/                   # Statistiques & graphiques
│   │   └── profile/                 # Profil utilisateur
│   ├── api/
│   │   ├── analyze-meal/            # POST → vision provider
│   │   └── auth/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── dashboard/                   # CalorieRing, MacroBars, MealCard
│   ├── scan/                        # CameraView, AnalyzingState, ResultEditor
│   ├── recipes/                     # RecipeForm, RecipeCard, IngredientList
│   ├── stats/                       # WeightChart, CalorieChart, StreakBadge
│   └── shared/                      # BottomNav, TopBar, Logo
├── lib/
│   ├── supabase/                    # client.ts, server.ts, middleware.ts
│   ├── ai/                          # vision.ts, providers/, prompts.ts, types.ts
│   ├── tdee.ts                      # Calculs Mifflin-St Jeor + macros
│   ├── utils.ts                     # cn(), formatters
│   ├── rate-limit.ts                # Rate limiter côté serveur
│   └── validators/                  # schémas zod
├── stores/                          # Zustand stores
├── types/                           # TypeScript types globaux
├── public/
│   └── designs/                     # Mockups Stitch (1 dossier par écran)
└── CLAUDE.md
```

---

## 7. Workflow de développement avec les mockups Stitch

**IMPORTANT** : les designs Google Stitch se trouvent dans `/public/designs/`. Chaque dossier correspond à UN écran de l'app et contient les exports Stitch (PNG, HTML, CSS, etc.).

### Procédure pour CHAQUE écran à implémenter

1. **Lis d'abord le contenu du dossier** correspondant dans `/public/designs/[nom_dossier]/`
2. **Analyse les fichiers** : PNG pour la référence visuelle, HTML/CSS pour les valeurs exactes (couleurs, espacements, polices)
3. **Identifie** : layout, hiérarchie typographique, composants réutilisables, états interactifs
4. **Reproduis fidèlement** avec Tailwind + shadcn/ui — pas d'interprétation libre
5. **Respecte le design system** défini ci-dessous (les mockups en sont la source de vérité visuelle)

### Mapping dossiers Stitch → routes (CRITIQUE)

| Dossier Stitch | Route de l'app | Description |
|---|---|---|
| `bienvenue_calsnap_ia/` | `/onboarding/welcome` | Écran de bienvenue / landing initial |
| `objectif_calsnap_ia/` | `/onboarding/goal` | Sélection de l'objectif (perdre / maintenir / gagner) |
| `infos_personnelles_calsnap_ia/` | `/onboarding/info` | Sexe, âge, taille, poids |
| `activit_calsnap_ia/` | `/onboarding/activity` | Niveau d'activité physique |
| `votre_plan_calsnap_ia/` | `/onboarding/plan` | Plan personnalisé généré (calories + macros cibles) |
| `tableau_de_bord_calsnap_ia/` | `/dashboard` | **Dashboard principal** (anneau calories + macros + repas du jour) |
| `tableau_de_bord_calsnap_ia_recettes/` | `/dashboard-recipes` | Variante du dashboard avec section recettes mise en avant |
| `scanner_calsnap_ia/` | `/scan` | Écran caméra pour photographier un repas |
| `analyse_en_cours_calsnap_ia/` | `/analyzing` | Loading state pendant l'analyse Groq |
| `r_sultat_de_l_analyse_calsnap_ia/` | `/meal/[id]` | Résultat de l'analyse, éditable, validation |
| `cr_er_une_recette_calsnap_ia/` | `/recipes/new` | Formulaire de création de recette personnalisée |
| `statistiques_calsnap_ia/` | `/stats` | Graphiques de progression (poids, calories, streak) |
| `profil_calsnap_ia/` | `/profile` | Profil utilisateur, paramètres, objectifs |
| `calsnap_ia/` | `/` (racine) | Probablement le logo / écran de splash / landing publique |

⚠️ **Avant de coder un écran**, ouvre le dossier correspondant et liste son contenu pour comprendre quels fichiers Stitch a fourni (PNG seul ? HTML+CSS ? les deux ?).

---

## 8. Module Recettes (nouveau scope)

Vu que Stitch a généré des mockups pour la création de recettes et un dashboard variante, on ajoute un module recettes au MVP. Concept :

- L'utilisateur peut **créer ses propres recettes** (ex: "Mon bowl du matin") avec une liste d'ingrédients et leurs quantités
- L'app calcule automatiquement calories + macros totaux
- Une fois sauvegardée, la recette peut être loggée en 1 clic dans le journal quotidien
- Les recettes sont **personnelles** (RLS Supabase)

### Tables additionnelles

```sql
-- recipes
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  servings INT DEFAULT 1,
  total_calories INT,
  total_protein_g NUMERIC(6,2),
  total_carbs_g NUMERIC(6,2),
  total_fat_g NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- recipe_ingredients
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity_g NUMERIC(6,2) NOT NULL,
  calories INT NOT NULL,
  protein_g NUMERIC(6,2) NOT NULL,
  carbs_g NUMERIC(6,2) NOT NULL,
  fat_g NUMERIC(6,2) NOT NULL,
  position INT DEFAULT 0
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own recipes" ON recipes 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own recipe ingredients" ON recipe_ingredients 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid())
  );
```

### Lien recette → repas
Quand un utilisateur logge une recette comme repas, on insère une ligne dans `meals` avec les totaux de la recette + une référence optionnelle.

```sql
ALTER TABLE meals ADD COLUMN recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL;
```

---

## 9. Design system (extrait des mockups)

⚠️ **Les valeurs ci-dessous sont des points de départ**. Avant de figer le design system, **extrais les valeurs exactes depuis le HTML/CSS exporté par Stitch** (notamment dans `tableau_de_bord_calsnap_ia/` qui est l'écran de référence visuelle).

### Couleurs (à confirmer depuis Stitch)
```css
--background: #FAFAF7;       /* Off-white */
--foreground: #1A1A1A;       /* Charcoal */
--primary: #00C853;          /* Vert vif (CTAs, succès) */
--accent: #FF9500;           /* Orange (warnings, macros) */
--muted: #F2F2EF;            /* Gris clair (cards) */
--muted-foreground: #6B6B6B; /* Texte secondaire */
--border: #E5E5E2;
```

### Typographie
- **Headings** : sans-serif rounded, bold, large (32-48px pour les chiffres clés)
- **Body** : sans-serif regular, 14-16px
- **Numbers** : toujours bold et oversized (calories, macros, poids)
- Police recommandée : `Inter` ou `Geist` via `next/font` (à confirmer depuis Stitch)

### Composants
- Cards : `rounded-2xl` (16px) à `rounded-3xl` (24px), `bg-muted`, padding généreux
- Buttons primaires : `rounded-full` (28px), `bg-primary`, `text-white`, hauteur min 56px
- Inputs : `rounded-xl`, `border`, focus ring vert
- Bottom nav : fixe, `bg-white`, ombre légère, FAB caméra centré et surélevé

### Animations
- Transitions : `transition-all duration-200 ease-out`
- Pas d'animation gratuite — uniquement loading states et micro-interactions

---

## 10. Schéma base de données (Supabase)

```sql
-- profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  height_cm INT,
  weight_kg NUMERIC(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'active', 'very_active')),
  goal TEXT CHECK (goal IN ('lose', 'maintain', 'gain')),
  daily_calorie_target INT,
  daily_protein_g INT,
  daily_carbs_g INT,
  daily_fat_g INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- meals
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INT NOT NULL,
  protein_g NUMERIC(6,2) NOT NULL,
  carbs_g NUMERIC(6,2) NOT NULL,
  fat_g NUMERIC(6,2) NOT NULL,
  portion_size NUMERIC(4,2) DEFAULT 1.0,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  ai_confidence NUMERIC(3,2),
  ai_provider TEXT,
  ai_raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- weight_logs
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL,
  logged_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, logged_at)
);

-- recipes (voir section 8 pour le détail)
-- recipe_ingredients (voir section 8 pour le détail)

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can CRUD own meals" ON meals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own weight logs" ON weight_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 11. Fonctionnalités à implémenter (ordre de priorité)

### Phase 1 — Foundation
1. Setup Next.js 14 + TypeScript + Tailwind + shadcn/ui
2. Configuration Supabase (client, server, middleware)
3. Variables d'env (`.env.local` template à créer)
4. Schéma DB + migrations + RLS (toutes les tables : profiles, meals, weight_logs, recipes, recipe_ingredients)
5. Layout principal + bottom navigation
6. **Extraction du design system** depuis le HTML/CSS de `tableau_de_bord_calsnap_ia/` (couleurs exactes, typo, espacements) → mise à jour de `tailwind.config.ts` et `globals.css`

### Phase 2 — Auth & Onboarding
7. Pages signup / login (email + password)
8. Flow onboarding (5 étapes basées sur les mockups) :
   - `/onboarding/welcome` ← `bienvenue_calsnap_ia/`
   - `/onboarding/goal` ← `objectif_calsnap_ia/`
   - `/onboarding/info` ← `infos_personnelles_calsnap_ia/`
   - `/onboarding/activity` ← `activit_calsnap_ia/`
   - `/onboarding/plan` ← `votre_plan_calsnap_ia/`
9. Calcul TDEE (Mifflin-St Jeor) + répartition macros (40/30/30 par défaut, ajusté selon goal)
10. Sauvegarde profil

### Phase 3 — Core feature : scan repas (Groq)
11. **Setup `lib/ai/`** avec abstraction provider (interface + implémentation Groq)
12. **Validateur zod** `MealAnalysisSchema` pour la réponse du modèle
13. Page `/scan` (← `scanner_calsnap_ia/`) avec accès caméra (`navigator.mediaDevices.getUserMedia`)
14. Capture photo → upload Supabase Storage
15. **API route `/api/analyze-meal`** : auth check, rate limit, appel `analyzeMeal()`, validation zod, gestion erreurs
16. Page `/analyzing` (← `analyse_en_cours_calsnap_ia/`) — loading state pendant l'analyse
17. Page `/meal/[id]` (← `r_sultat_de_l_analyse_calsnap_ia/`) — résultat éditable
18. Sauvegarde dans table `meals`

### Phase 4 — Dashboard
19. Page `/dashboard` (← `tableau_de_bord_calsnap_ia/`)
   - Calorie ring (SVG circular progress)
   - Macro bars (3 barres horizontales)
   - Liste des repas du jour groupés par type
   - Navigation jour précédent/suivant
20. Page `/dashboard-recipes` (← `tableau_de_bord_calsnap_ia_recettes/`) — variante avec section recettes

### Phase 5 — Module Recettes
21. Page `/recipes/new` (← `cr_er_une_recette_calsnap_ia/`) — création de recette
22. Liste des recettes de l'utilisateur (depuis dashboard ou page dédiée)
23. Logging d'une recette en repas (1 clic)

### Phase 6 — Stats & Profile
24. Page `/stats` (← `statistiques_calsnap_ia/`) — graphiques (poids, calories, streak)
25. Tracking du poids
26. Page `/profile` (← `profil_calsnap_ia/`) — édition profil & objectifs

### Phase 7 — PWA & Polish
27. Configuration `next-pwa` (manifest, service worker)
28. Icônes PWA
29. Empty states soignés partout
30. Gestion d'erreurs + toasts (sonner)

---

## 12. Conventions de code

- **TypeScript strict** : pas de `any`, utiliser `unknown` + type guards si besoin
- **Server Components par défaut** ; `'use client'` uniquement quand nécessaire (interactivité, hooks)
- **Naming** : camelCase pour variables/fonctions, PascalCase pour composants, kebab-case pour fichiers
- **Composants** : un composant = un fichier, exports nommés
- **Validation** : zod sur TOUTES les entrées utilisateur ET sur les réponses des modèles IA
- **Erreurs IA** : try/catch dédié pour les appels Groq, fallback UI permettant l'édition manuelle
- **Comments** : en français, courts, expliquer le POURQUOI pas le QUOI
- **Pas de console.log** en production (utiliser un logger conditionnel)

---

## 13. Variables d'environnement

À créer dans `.env.local` :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# IA Vision
AI_VISION_PROVIDER=groq          # groq | openai | claude | mistral
GROQ_API_KEY=
# OPENAI_API_KEY=                # Optionnel, fallback futur
# ANTHROPIC_API_KEY=             # Optionnel, fallback futur
# MISTRAL_API_KEY=               # Optionnel, fallback futur

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Crée un `.env.example` avec les clés mais sans les valeurs.

---

## 14. Rate limiting (important pour Groq free tier)

- **Par utilisateur** : 10 requêtes/minute, 100/jour sur `/api/analyze-meal`
- **Global** : ~25 requêtes/minute (marge de sécurité sous la limite Groq de 30/min)
- Utiliser une table Supabase `rate_limits` ou Upstash Redis si besoin de scaler
- Réponse HTTP 429 avec `Retry-After` header en cas de dépassement
- UI : message clair à l'utilisateur ("Trop de scans, réessaie dans une minute")

---

## 15. Règles de comportement pour Claude Code

### À FAIRE
- ✅ **Avant de coder un écran**, lire le contenu du dossier Stitch correspondant dans `/public/designs/`
- ✅ **Extraire les valeurs exactes** (couleurs, espacements, polices) depuis le HTML/CSS Stitch quand disponible
- ✅ Toujours passer par l'abstraction `lib/ai/vision.ts`, JAMAIS appeler Groq directement depuis un composant ou une route
- ✅ Valider chaque réponse IA avec zod avant utilisation
- ✅ Implémenter le rate limiting sur l'API d'analyse
- ✅ Demander confirmation avant toute migration DB destructive
- ✅ Tester chaque feature avant de passer à la suivante
- ✅ Commit sémantique (`feat:`, `fix:`, `chore:`, `refactor:`)
- ✅ Écrire le code en TypeScript strict
- ✅ Respecter le design system à la lettre
- ✅ Utiliser shadcn/ui au lieu de réinventer des composants
- ✅ Mettre à jour ce `CLAUDE.md` si une décision architecturale est prise

### À NE PAS FAIRE
- ❌ Coupler le code applicatif à Groq directement (toujours passer par l'abstraction)
- ❌ Inventer des couleurs/espacements qui ne sont pas dans les mockups Stitch
- ❌ Changer la stack technique sans demander
- ❌ Skipper la validation zod (surtout sur les réponses IA, c'est critique avec Llama)
- ❌ Désactiver RLS sur Supabase
- ❌ Hardcoder des secrets ou clés API
- ❌ Installer des dépendances non listées sans justification
- ❌ Utiliser `any` en TypeScript
- ❌ Faire des `git push --force` ou écraser des migrations existantes

---

## 16. Workflow recommandé étape par étape

Pour chaque nouvelle feature, procède comme suit :

1. **Annonce** : "Je vais implémenter [feature X]. Voici mon plan : [...]"
2. **Lis le dossier Stitch** correspondant (PNG + HTML/CSS s'ils existent)
3. **Crée/modifie** les types TypeScript nécessaires
4. **Implémente** la logique serveur (API route ou Server Action)
5. **Implémente** le composant UI en suivant le mockup
6. **Connecte** UI ↔ data
7. **Teste** manuellement et signale ce qu'il faut vérifier
8. **Résume** : "Feature [X] implémentée. Fichiers modifiés : [...]. À tester : [...]"

---

## 17. Tests & validation

Pour le MVP, focus sur les tests manuels. Ajouter :
- Validation zod robuste sur toutes les entrées ET sur les réponses Groq
- Tests manuels avec différents types de plats : simple, composé, liquide, packagé
- Gestion des erreurs Groq : timeout, JSON invalide, image non reconnue, rate limit 429
- États de loading partout où il y a un async
- Empty states pour : pas de repas du jour, pas de recettes, pas d'historique, etc.

---

## 18. Stratégie de scaling future (post-MVP)

Quand le free tier Groq ne suffira plus :

1. **Court terme** : passer en payant chez Groq (toujours moins cher que les autres)
2. **Moyen terme** : routing intelligent — Groq pour 90% des cas, Claude/GPT pour les images complexes
3. **Long terme** : freemium côté users (X scans gratuits/jour, illimité en premium)

L'abstraction provider (`lib/ai/`) rend ces transitions triviales.

---

## 19. Déploiement

- **Hosting** : Vercel
- **Database** : Supabase (project EU pour la latence FR)
- **Domain** : à définir
- **Monitoring** : Vercel Analytics + Supabase logs + tracking spécifique des erreurs IA

---

**Dernière mise à jour** : Mapping exact des 14 dossiers Stitch ajouté + module Recettes intégré au scope MVP.