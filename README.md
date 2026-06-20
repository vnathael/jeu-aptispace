# SURGE.io — Reactor Charge Arena

SURGE.io est un jeu web multijoueur temps réel original fondé sur un système de charge et décharge d'énergie. Les joueurs pilotent de petits réacteurs (orbes) qui se déplacent continuellement dans la direction de leur curseur. L'objectif est d'absorber des cellules d'énergie pour accumuler du score et remplir une jauge de charge afin de pouvoir déclencher une ruée dévastatrice (Surge Dash) pour étourdir ses adversaires et drainer leur énergie.

## Membres du groupe
- [Prénom NOM des membres du groupe]

## Liens de Déploiement
- **URL de production (Client)** : disponible après le premier déploiement automatique, voir l'onglet Actions/Pages du dépôt GitHub.
- **URL du serveur** : Déployé séparément sur Render (ex: `https://surge-io-server.onrender.com`).

---

## 1. Concept du jeu & Règles

- **Déplacement** : Vitesse constante, le réacteur suit l'orientation du curseur/doigt.
- **Collecte** : Des cellules d'énergie vertes apparaissent aléatoirement. Les toucher augmente le score cumulé (qui ne baisse jamais) et emplit la jauge de charge.
- **Surge Dash** : À 100% de charge, appuyer sur `[ESPACE]` ou cliquer/taper sur l'écran déclenche une ruée rapide. Le dash consomme toute la charge.
- **Impacts** : Toucher un adversaire lors d'un dash l'étourdit (vitesse réduite de 70% pendant 1 seconde) et disperse 50% de sa charge sous forme de nouvelles cellules d'énergie récupérables au sol.
- **Surcharges** : Une zone rouge instable apparaît périodiquement et draine l'énergie des joueurs qui y séjournent.
- **Boucliers** : Un bonus rare de bouclier doré immunise contre les stuns et vols de charge adverses pendant 5 secondes.
- **Timer de Partie** : Manches rapides de 3 minutes. Le classement (podium) s'affiche pendant 10 secondes à la fin de la manche, puis une nouvelle partie se relance automatiquement.

---

## 2. Lancement en local

### Prérequis
- [Node.js](https://nodejs.org/) (version 20 recommandable)
- npm (intégré à Node)

### Installation
1. Installez toutes les dépendances du monorepo à la racine :
   ```bash
   npm install
   ```

2. Compilez la bibliothèque de types partagés `shared` :
   ```bash
   npm run build:shared
   ```

### Lancement
- **Lancement simultané (Client + Serveur)** :
  ```bash
  npm run dev
  ```
  *Cette commande lance le serveur de jeu sur le port `3000` et le client Vite sur le port `5173`.*

- **Lancement séparé** :
  - Lancer le serveur : `npm run dev:server`
  - Lancer le client Vite : `npm run dev:client`

### Variables d'environnement
Le client lit l'URL du serveur de jeu via la variable `VITE_SERVER_URL`.
- En local, elle vaut par défaut `http://localhost:3000`.
- En production, vous pouvez la définir au moment du build (ex : `VITE_SERVER_URL=https://mon-serveur-surge.onrender.com npm run build`).

---

## 3. Architecture du projet

Le projet est conçu en **monorepo** avec les **workspaces npm** et divisé en 3 packages pour séparer strictement les responsabilités :

```
├── client/          # Interface utilisateur & affichage Canvas (Vite + TypeScript)
├── server/          # Serveur de jeu autoritaire (Node + Express + Socket.io)
└── shared/          # Constantes, types et calculs mathématiques purs partagés
```

### Choix du Serveur Autoritaire
Pour éviter la triche et les désynchronisations, le serveur est **l'unique source de vérité** :
- Le serveur calcule à chaque tick (~30Hz) les déplacements physiques, l'activation des compétences, les collisions et le drain des zones.
- Les clients envoient uniquement leurs intentions de jeu (angle directionnel, événement de dash) avec une limitation de débit (throttling) gérée côté serveur pour éviter les spams.
- Le client reçoit l'état complet du serveur et applique une **interpolation linéaire (LERP)** sur les coordonnées visuelles des joueurs afin d'assurer un affichage fluide à 60 FPS sans à-coups réseau.

### Séparation des responsabilités (SRP)

#### Côté Serveur (`server/src/engine/`)
1. **`GameLoop`** : Cadence les mises à jour à 30 ticks par seconde et gère le minuteur de manche globale (3 minutes).
2. **`PhysicsEngine`** : Met à jour les positions, résout les collisions cercle-cercle et applique les effets (dash, stuns, charges, zones).
3. **`EntityManager`** : Gère l'état brut en mémoire (liste des joueurs connectés, orbes d'énergie, boucliers et zones de surcharge actives).
4. **`NetworkBroadcaster`** : Sérialise et diffuse l'état du jeu à tous les joueurs connectés à chaque tick via Socket.io.

#### Côté Client (`client/src/`)
1. **`Renderer`** : Dessine le quadrillage, l'arène, les effets visuels brillants, le jet des réacteurs (flamme proportionnelle à la vitesse), les halos de boucliers, et les jets de particules de couleur (sparks).
2. **`InputController`** : Capture l'orientation du curseur/toucher par rapport au centre de l'écran et détecte l'appui sur `Espace` ou les clics écran pour déclencher le Dash.
3. **`NetworkClient`** : Centralise la connexion Socket.io et reçoit les mises à jour.
4. **`GameState`** : Contient l'état local interpolé utilisé par le Renderer.
5. **UI (Atomic Design)** :
   - `atoms/` : Composants de base autonomes (`Button.ts`, `Input.ts`, `Badge.ts`, `ScoreTag.ts`, `ChargeBar.ts`).
   - `molecules/` : Assemblages simples (`PlayerRow.ts`, `ConnectionStatus.ts`).
   - `organisms/` : Écrans complexes (`HUD.ts`, `Leaderboard.ts`, `MainMenu.ts`, `RoundEndModal.ts`).

---

## 4. Arsenal IA & Écosystème agentique

Dans cette session de développement, les outils suivants ont été mobilisés :
- **Environnement de développement** : *Antigravity IDE*, un environnement agentique conçu par Google DeepMind.
- **Modèle de langage (agent)** : *Gemini 3.5 Flash (High)*, qui a assuré la rédaction des composants TypeScript et le diagnostic des scripts.
- **Outil d'exécution** : `run_command` pour exécuter localement les scripts de vérification, de build et de tests.
- **Serveurs MCP** : Aucun serveur MCP externe n'a été requis ni activé.

---

## 5. Ingénierie de Prompt

Le prompt maître ci-dessous a été utilisé comme base d'instructions pour guider l'agent dans la conception et l'implémentation de SURGE.io :

### Prompt Maître #1
```
Rôle

Tu es un agent de développement full-stack senior. Tu vas concevoir, coder, tester et préparer le déploiement d'un jeu web multijoueur temps réel original (PAS un clone d'Agar.io ou Slither.io), en respectant strictement les contraintes ci-dessous. Travaille en autonomie complète sur l'ensemble du projet, du code au README, sans rien me laisser à compléter sauf les deux exceptions explicitement marquées en section 5. Exécute le plan complet puis présente-moi un résumé final.

1. Concept du jeu — "SURGE.io"
... [suite du prompt de spécification initiale]
```

*Ce prompt a permis de débloquer immédiatement une architecture monorepo saine avec une séparation stricte des rôles client/serveur, et d'assurer le respect rigoureux des contraintes de Clean Code.*

---

## 6. Analyse critique & Hallucinations

Pendant le processus autonome de génération, plusieurs ajustements techniques ont été apportés :

1. **Format de Dépendance Monorepo (Workspaces)** : Initialement, la notation `"workspace:*"` avait été écrite dans les `package.json` de `client` et `server` (standard pour yarn/pnpm). npm a rejeté cette syntaxe en retournant une erreur `EUNSUPPORTEDPROTOCOL`. Le problème a été corrigé en remplaçant la cible par `"*"` que npm sait correctement résoudre localement.
2. **Typage Strict et Avertissements ESLint** : ESLint a signalé des variables `any` non typées dans `GameLoop.ts` et `PhysicsEngine.ts`. Celles-ci ont été nettoyées en important et en appliquant les interfaces `GameStateSnapshot` et `Player` issues du package `shared`.
3. **Variables inutilisées dans le Renderer** : Trois variables déclarées (`Player`, `now`, `jetLen`) n'étaient pas exploitées dans `Renderer.ts`. L'import de `Player` et la variable `now` ont été retirés. La variable `jetLen` a quant à elle été valorisée pour dynamiser visuellement la taille du jet de flamme à l'arrière des réacteurs en fonction du statut de dash.
4. **Typage de l'import Vite (`import.meta.env`)** : TypeScript ne parvenait pas à résoudre l'objet `env` sur `ImportMeta` lors du build client. Pour y remédier, un fichier `client/src/vite-env.d.ts` contenant `/// <reference types="vite/client" />` a été ajouté au projet pour importer les types natifs de Vite.
