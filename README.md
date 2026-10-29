# Le Grimoire d’Elderwood

Application web consacrée au roleplay d’Elderwood. Elle réunit un grimoire personnel pour organiser ses informations RP, les archives officielles du serveur et des outils de suivi pour les cours, les relations et la chronologie.

L’application est accessible à cette adresse : [povikk.github.io/grimoireelder](https://povikk.github.io/grimoireelder/)

## Fonctionnalités

- Créer des fiches pour les personnages, lieux, connaissances, projets et sorts.
- Ajouter des images, des étiquettes, des chapitres personnalisés et des notes enrichies aux fiches.
- Retrouver une information grâce à la recherche globale dans les fiches, le lore, le règlement et le wiki.
- Organiser des notes libres sur un tableau, relier les fiches entre elles et consulter une carte des relations.
- Construire une chronologie à partir des dates renseignées dans les fiches.
- Tenir des cahiers de cours, classer les matières, planifier des créneaux dans un agenda hebdomadaire et partager une séance pour validation.
- Consulter le règlement, le lore et les archives consacrées à l’école d’Elderwood.
- Proposer des contributions au wiki, puis suivre leur validation par l’équipe de modération.
- Synchroniser les données privées et les images avec un compte utilisateur.
- Choisir l’ambiance visuelle de l’une des quatre maisons d’Elderwood.

Une interface d’administration permet aux personnes autorisées de modérer les contributions et de consulter les grimoires en lecture seule.

## Technologies utilisées

- **TypeScript** et **React 19** pour l’interface.
- **Vinext** et **Vite** pour le développement et la compilation.
- **Tailwind CSS 4** et des feuilles de style CSS dédiées pour la mise en page.
- **Supabase** pour l’authentification, la base de données, le stockage privé des images et les fonctions serveur.
- **LanguageTool** pour la correction orthographique déclenchée depuis l’éditeur.
- **Lucide React** pour les icônes.
- **GitHub Actions** et **GitHub Pages** pour la publication du site.

## Installation et utilisation

Le projet demande Node.js 22.13 ou une version plus récente, ainsi que pnpm.

```bash
git clone https://github.com/Povikk/grimoireelder.git
cd grimoireelder
pnpm install
pnpm dev
```

Pour activer la connexion, la synchronisation et le wiki, créer un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=adresse_du_projet_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=cle_publique_supabase
```

Les scripts SQL nécessaires à la base de données, au stockage privé, au wiki et à l’administration se trouvent dans le dossier [`supabase`](./supabase).

Commandes utiles :

```bash
pnpm lint
pnpm run build:pages
```

La commande `build:pages` génère la version statique utilisée par GitHub Pages dans le dossier `pages-dist`.

## Auteur

**Jonathan Ragot**  
GitHub : [Povikk](https://github.com/Povikk)
