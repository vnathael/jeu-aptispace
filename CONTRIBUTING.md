# Guide de contribution — SURGE.io

Merci de vouloir contribuer à SURGE.io ! Pour maintenir la clarté de l'historique et de la gestion du projet, nous utilisons des conventions de labellisation et de nommage strictes pour les tickets (issues), les Pull Requests (PR) et les messages de commit.

## Conventions de nommage Git

Chaque commit et Pull Request doit être préfixé par l'un des labels suivants en fonction de la zone modifiée :

- **`ui`** : Modifications de l'interface utilisateur, CSS, design tokens, Canvas API ou assets visuels.
  - _Exemple_ : `ui: ajouter un effet de flou sur le podium final`
- **`network`** : Modifications liées à Socket.io (client ou serveur), sérialisation, protocoles réseau.
  - _Exemple_ : `network: implémenter le throttling des inputs client`
- **`engine`** : Modifications du moteur physique, de la boucle de jeu principale, ou du gestionnaire d'entités.
  - _Exemple_ : `engine: corriger la détection de collision joueur contre bouclier`
- **`docs`** : Mises à jour de la documentation, README, guides ou commentaires de code.
  - _Exemple_ : `docs: ajouter le guide de déploiement en production`

## Processus de développement

1. Forkez le dépôt et créez votre branche depuis `main`.
2. Utilisez le label adéquat dans le nom de votre branche : `feature/ui-dashboard` ou `fix/engine-collision`.
3. Assurez-vous que le linting et les tests passent localement :
   - `npm run lint`
   - `npm run test`
4. Ouvrez une Pull Request claire en décrivant vos changements.
