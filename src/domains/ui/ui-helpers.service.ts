/**
 * UI Domain - UI Helpers Service
 * Pure functions for UI display formatting and presentation
 */

// import { Player, GameResult } from './display';

/**
 * Get role display name for UI
 */
export function getRoleDisplayName(role: string): string {
  const roleMap = {
    undercover: "Undercover",
    mr_white: "Mr. White",
    civilian: "Civil",
  };

  return roleMap[role as keyof typeof roleMap] || role;
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: string): string {
  const colorMap = {
    undercover: "bg-red-100 text-red-800",
    mr_white: "bg-gray-100 text-gray-800",
    civilian: "bg-blue-100 text-blue-800",
  };

  return colorMap[role as keyof typeof colorMap] || "bg-gray-100 text-gray-800";
}

/**
 * Format winner text with proper grammar
 */
export function formatWinnerText(winner: string): string {
  const isSingular = winner === "Mr. White" || winner === "Personne";
  return isSingular ? "gagne" : "gagnent";
}

/**
 * Calculate word sharing progress percentage
 */
export function calculateSharingProgress(
  playersWhoShared: number,
  totalAlivePlayers: number,
): number {
  return totalAlivePlayers > 0
    ? (playersWhoShared / totalAlivePlayers) * 100
    : 0;
}

/**
 * Calculate voting progress percentage
 */
export function calculateVotingProgress(
  playersWhoVoted: number,
  totalAlivePlayers: number,
): number {
  return totalAlivePlayers > 0
    ? (playersWhoVoted / totalAlivePlayers) * 100
    : 0;
}

/**
 * Generate button text for share link functionality
 */
export function generateShareButtonText(
  isSuccess: boolean,
  isError: boolean,
  baseText = "📋 Partager le Lien",
): string {
  if (isSuccess) return "✅ Lien copié !";
  if (isError) return "❌ Erreur de copie";
  return baseText;
}

/**
 * Get game state display text for UI
 */
export function getGameStateDisplayText(gameState: string): string {
  const stateMap: Record<string, string> = {
    waiting: "En attente des joueurs",
    discussion: "Phase de discussion",
    voting: "Phase de vote",
    mr_white_guessing: "Mr. White devine",
    results: "Résultats du jeu",
  };

  return stateMap[gameState] || gameState;
}

/**
 * Get round display text
 */
export function getRoundDisplayText(
  currentRound: number,
  maxRounds: number,
): string {
  return `Round ${currentRound}/${maxRounds}`;
}

/**
 * Check if game is in waiting state
 */
export function isGameWaiting(gameState: string): boolean {
  return gameState === "waiting";
}

/**
 * Check if game is in discussion state
 */
export function isGameDiscussion(gameState: string): boolean {
  return gameState === "discussion";
}

/**
 * Check if game is in voting state
 */
export function isGameVoting(gameState: string): boolean {
  return gameState === "voting";
}

/**
 * Check if game is in results state
 */
export function isGameResults(gameState: string): boolean {
  return gameState === "results";
}

/**
 * Check if game is in Mr. White guessing state
 */
export function isGameMrWhiteGuessing(gameState: string): boolean {
  return gameState === "mr_white_guessing";
}

/**
 * Get player count display text
 */
export function getPlayerCountDisplay(
  playerCount: number,
  maxPlayers: number,
): string {
  return `${playerCount}/${maxPlayers} joueurs`;
}

/**
 * Check if room is full
 */
export function isRoomFull(playerCount: number, maxPlayers: number): boolean {
  return playerCount >= maxPlayers;
}

/**
 * Check if room has minimum players to start
 */
export function hasMinimumPlayers(
  playerCount: number,
  minPlayers: number,
): boolean {
  return playerCount >= minPlayers;
}

/**
 * Get validation error message for display
 */
export function getValidationErrorMessage(error: string): string {
  // Map technical error messages to user-friendly ones
  const errorMap: Record<string, string> = {
    "Player not found or not alive": "Joueur introuvable ou éliminé",
    "Game is not in discussion phase":
      "Le jeu n'est pas en phase de discussion",
    "It's not your turn to share a word":
      "Ce n'est pas votre tour de partager un mot",
    "You have already shared your word": "Vous avez déjà partagé votre mot",
    "Voting is not active": "Le vote n'est pas actif",
    "Players not in same room": "Les joueurs ne sont pas dans la même salle",
  };

  return errorMap[error] || error;
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Temps écoulé";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

/**
 * Get QR code data URL for room sharing
 */
export function generateQRCodeDataUrl(roomUrl: string): Promise<string> {
  // This would typically use a QR code library, but we'll return a placeholder
  // In a real implementation, this would use a library like 'qrcode'
  return Promise.resolve(`data:image/png;base64,${btoa(roomUrl)}`);
}

/**
 * Check if a player is the current turn player
 */
export function isCurrentTurnPlayer(
  playerId: string,
  currentTurnPlayerId: string | undefined,
): boolean {
  return playerId === currentTurnPlayerId;
}

/**
 * Get turn order display text
 */
export function getTurnOrderDisplay(
  currentIndex: number,
  totalPlayers: number,
): string {
  return `Tour ${currentIndex + 1}/${totalPlayers}`;
}

/**
 * Generate share button text with timeout handling
 */
export function generateShareButtonTextWithTimeout(
  isSuccess: boolean,
  isError: boolean,
  baseText = "📋 Partager le Lien",
): string {
  if (isSuccess) return "✅ Lien copié !";
  if (isError) return "❌ Erreur de copie";
  return baseText;
}

/**
 * Get game state message for header
 */
export function getGameStateMessage(gameState: string): string {
  const stateMap: Record<string, string> = {
    waiting: "En attente des joueurs",
    discussion: "Phase de discussion",
    voting: "Phase de vote",
    mr_white_guessing: "Mr. White devine",
    results: "Résultats du jeu",
  };

  return stateMap[gameState] || "";
}

/**
 * Get start game button text
 */
export function getStartGameButtonText(
  playerCount: number,
  minPlayers = 3,
): string {
  return `Commencer le Jeu (${playerCount}/${minPlayers}+)`;
}

/**
 * Get configuration display text for game setup
 */
export function getConfigurationDisplayText(config: {
  numUndercovers: number;
  numMrWhites: number;
  totalPlayers: number;
}): string {
  const { numUndercovers, numMrWhites, totalPlayers } = config;
  const civilians = totalPlayers - numUndercovers - numMrWhites;

  return `Configuration actuelle:
• ${numUndercovers} Undercover${numUndercovers > 1 ? "s" : ""}
• ${numMrWhites} Mr. White${numMrWhites > 1 ? "s" : ""}${numMrWhites === 0 ? " (Aucun)" : ""}
• ${civilians} Civil${civilians > 1 ? "s" : ""}`;
}

/**
 * Get word display text for current player
 */
export function getWordDisplayText(
  playerRole: string,
  gameWords: { civilianWord: string; undercoverWord: string } | null,
): string {
  if (!gameWords) return "";

  switch (playerRole) {
    case "undercover":
      return gameWords.undercoverWord;
    case "mr_white":
      return "Vous êtes Mr. White.";
    case "civilian":
    default:
      return gameWords.civilianWord;
  }
}

/**
 * Get validation result message
 */
export function getValidationResultMessage(action: string): string {
  const messageMap: Record<string, string> = {
    skipped_dead_player: "Joueur mort ignoré - passage au joueur suivant",
    no_action_needed: "Game state is valid - no action needed",
  };

  return messageMap[action] || `Game state fixed: ${action}`;
}

/**
 * Get game instructions text
 */
export function getGameInstructionsText(): string[] {
  return [
    "• 3-10 joueurs peuvent rejoindre cette salle",
    "• La plupart des joueurs sont des Civils avec un mot",
    "• 1-3 joueurs sont Undercovers avec un mot différent",
    "• Mr. White (4+ joueurs) ne connaît aucun mot",
    "• Discutez et votez contre les joueurs suspects",
    "• Les Civils gagnent en éliminant tous les Undercovers",
    "• Les Undercovers gagnent en survivant ou en surpassant les Civils",
  ];
}

/**
 * Get Mr. White guessing phase text
 */
export function getMrWhiteGuessingText(): {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
} {
  return {
    title: "Mr. White a été éliminé !",
    description:
      "Mr. White a une dernière chance de deviner le mot des Civils.",
    placeholder: "Devinez le mot des Civils...",
    buttonText: "Deviner le Mot",
  };
}

/**
 * Validate player name input
 */
export function validatePlayerNameInput(name: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, error: "Le nom est requis" };
  }

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: "Le nom doit contenir au moins 2 caractères",
    };
  }

  if (trimmedName.length > 20) {
    return {
      isValid: false,
      error: "Le nom ne peut pas dépasser 20 caractères",
    };
  }

  return { isValid: true };
}

/**
 * Validate room code input
 */
export function validateRoomCodeInput(roomCode: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmedCode = roomCode.trim().toUpperCase();

  if (!trimmedCode) {
    return { isValid: false, error: "Le code de la salle est requis" };
  }

  if (trimmedCode.length !== 6) {
    return {
      isValid: false,
      error: "Le code de la salle doit contenir 6 caractères",
    };
  }

  if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
    return {
      isValid: false,
      error:
        "Le code de la salle ne peut contenir que des lettres et des chiffres",
    };
  }

  return { isValid: true };
}

/**
 * Format room code for display
 */
export function formatRoomCodeInput(input: string): string {
  return input.toUpperCase().slice(0, 6);
}

/**
 * Get form validation state
 */
export function getFormValidationState(
  playerName: string,
  roomCode?: string,
): {
  isCreateFormValid: boolean;
  isJoinFormValid: boolean;
  createButtonText: string;
  joinButtonText: string;
} {
  const playerNameValidation = validatePlayerNameInput(playerName);
  const roomCodeValidation = roomCode
    ? validateRoomCodeInput(roomCode)
    : { isValid: true };

  return {
    isCreateFormValid: playerNameValidation.isValid,
    isJoinFormValid: playerNameValidation.isValid && roomCodeValidation.isValid,
    createButtonText: "Créer une Salle",
    joinButtonText: "Rejoindre la Salle",
  };
}

/**
 * Get loading state text
 */
export function getLoadingStateText(
  isCreating: boolean,
  isJoining: boolean,
): {
  createButtonText: string;
  joinButtonText: string;
} {
  return {
    createButtonText: isCreating ? "Création..." : "Créer une Salle",
    joinButtonText: isJoining ? "Rejoindre..." : "Rejoindre la Salle",
  };
}

/**
 * Get lobby section titles and descriptions
 */
export function getLobbySectionText(): {
  createTitle: string;
  joinTitle: string;
  joinDescription: string;
} {
  return {
    createTitle: "Créer une Salle",
    joinTitle: "Rejoindre une Salle",
    joinDescription: "Demandez le lien de la salle ou entrez le code :",
  };
}
