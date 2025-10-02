# Undercover

Un jeu de déduction sociale en temps réel construit avec Next.js, TypeScript et Convex.

## Features

- **Room System**: Create or join rooms with unique codes
- **Real-time Gameplay**: Live updates for all players
- **Role Assignment**: Automatic role distribution (Civilian, Undercover, Mr. White)
- **Voting System**: Interactive voting with real-time results
- **Clean UI**: Modern, responsive interface

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Convex (real-time database)
- **Styling**: Tailwind CSS
- **Runtime**: Bun

## Getting Started

### Prerequisites

- Bun installed on your system
- Convex account (free tier available)

### Setup

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up Convex**:

   ```bash
   bunx convex dev --configure
   ```

   Follow the prompts to create a new Convex project.

3. **Configure environment**:
   Copy the Convex URL from the setup and create `.env.local`:

   ```bash
   cp env.example .env.local
   ```

   Then add your Convex URL to `.env.local`.

4. **Start development servers**:

   ```bash
   bun run dev
   ```

   This will start both Convex and Next.js development servers.

5. **Open the game**:
   Navigate to `http://localhost:3000` in your browser.

## Comment Jouer

1. **Créer ou Rejoindre une Salle**:
   - Créez une salle pour devenir l'hôte
   - Rejoignez avec un code de salle partagé par l'hôte

2. **Déroulement du Jeu**:
   - L'hôte démarre le jeu (3-10 joueurs requis)
   - Les joueurs reçoivent leurs rôles et mots
   - Phase de discussion: Les joueurs partagent un mot descriptif
   - Phase de vote: Votez contre les joueurs suspects
   - Résultats: Vérifiez les conditions de victoire

3. **Rôles**:
   - **Civils**: Connaissent le mot civil, tentent d'identifier les undercovers
   - **Undercovers**: Connaissent un mot différent, tentent de se fondre
   - **Mr. White**: Ne connaît aucun mot (4+ joueurs seulement)

4. **Conditions de Victoire**:
   - **Civils gagnent**: Tous les undercovers éliminés
   - **Undercovers gagnent**: Survivent ou surpassent les civils

5. **Règles Spéciales**:
   - Mr. White ne peut pas être le premier à partager un mot au premier tour
   - Le vote commence automatiquement quand tous les mots sont partagés
   - Les votes sont visibles en temps réel pour tous les joueurs

## Game Rules

- 3-10 players per room
- 1-3 undercover players (based on total players)
- Mr. White role available with 4+ players
- Host controls game phases
- Real-time updates for all players

## Development

### Available Scripts

- `bun run dev`: Start development servers
- `bun run build`: Build for production
- `bun run start`: Start production server
- `bun run convex:dev`: Start only Convex development
- `bun run convex:deploy`: Deploy to Convex production

### Project Structure

```
├── convex/           # Convex backend functions
│   ├── schema.ts     # Database schema
│   ├── rooms.ts      # Room management
│   └── game.ts       # Game logic
├── src/
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   └── lib/          # Utilities
└── package.json
```

## Deployment

1. **Deploy Convex**:

   ```bash
   bun run convex:deploy
   ```

2. **Deploy Next.js**:
   Deploy to Vercel, Netlify, or your preferred platform.

## Contributing

This is a proof-of-concept implementation. Feel free to extend with additional features like:

- Player authentication
- Game history
- Custom word lists
- Spectator mode
- Mobile app
- Advanced game modes

## License

MIT License - feel free to use this code for your own projects!
