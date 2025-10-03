// Game configuration constants
export const GAME_CONFIG = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 10,
  MAX_UNDERCOVERS_RATIO: 0.5, // Maximum undercovers as ratio of total players
  MIN_UNDERCOVERS: 1,
  MAX_UNDERCOVERS: 3,
  MR_WHITE_MIN_PLAYERS: 4,
  MAX_ROUNDS: 100,
  MAX_WORD_LENGTH: 20,
  MAX_PLAYER_NAME_LENGTH: 20,
  ROOM_CODE_LENGTH: 6,
  SESSION_ID_LENGTH: 32,
} as const;

// Game states
export const GAME_STATES = {
  WAITING: 'waiting',
  DISCUSSION: 'discussion',
  VOTING: 'voting',
  MR_WHITE_GUESSING: 'mr_white_guessing',
  RESULTS: 'results',
} as const;

// Player roles
export const PLAYER_ROLES = {
  CIVILIAN: 'civilian',
  UNDERCOVER: 'undercover',
  MR_WHITE: 'mr_white',
} as const;

// Game result types
export const GAME_RESULTS = {
  CIVILIANS_WIN: 'civilians_win',
  UNDERCOVERS_WIN: 'undercovers_win',
  MR_WHITE_WIN: 'mr_white_win',
  UNDERCOVERS_MRWHITE_WIN: 'undercovers_mrwhite_win',
  MAX_ROUNDS_REACHED: 'max_rounds_reached',
} as const;

// UI messages
export const UI_MESSAGES = {
  LOADING_ROOM: 'Chargement de la salle...',
  ROOM_NOT_FOUND: 'Salle Introuvable',
  ROOM_NOT_FOUND_DESC: "Le code de salle n'existe pas.",
  GAME_STATES: {
    WAITING: 'En attente des joueurs...',
    DISCUSSION: 'Phase de Discussion',
    VOTING: 'Phase de Vote',
    MR_WHITE_GUESSING: 'Mr. White devine le mot',
    RESULTS: 'Résultats du Jeu',
  },
  PLAYER_STATUS: {
    ALIVE: 'Vivant',
    DEAD: '💀 Éliminé',
    SKIPPED: '⏭️ Ignoré (mort)',
    CURRENT_TURN: '🎯 Tour actuel',
  },
  BUTTONS: {
    SHARE_LINK: '📋 Partager le Lien',
    VALIDATE_GAME: '🔧 Sync état du jeu',
    VALIDATING: '⏳ Synchronisation...',
    START_GAME: 'Démarrer le Jeu',
    LEAVE_ROOM: 'Quitter la Salle',
    SHARE_WORD: 'Partager',
    VOTE_AGAINST: 'Eliminer',
    VOTED: '✅ A voté',
    RESTART_GAME: '🔄 Recommencer un nouveau jeu',
  },
  ERRORS: {
    ROOM_NOT_FOUND: 'Salle introuvable. Vérifiez le code de la salle.',
    GAME_STARTED:
      'La partie a déjà commencé. Vous ne pouvez plus rejoindre cette salle.',
    ROOM_FULL: 'La salle est pleine. Maximum 10 joueurs autorisés.',
    NAME_EXISTS:
      'Un joueur avec ce nom existe déjà dans la salle. Veuillez choisir un autre nom.',
    INVALID_SESSION:
      'Session invalide. Veuillez rejoindre avec un nouveau nom.',
    GENERIC_JOIN_ERROR:
      'Impossible de rejoindre la salle. Vérifiez le code de la salle ou essayez un nom différent.',
  },
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  MAX_DELAY: 5000,
} as const;

// Character sets for ID generation
export const ID_CHARS = {
  ROOM_CODE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  SESSION_ID: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz',
} as const;
