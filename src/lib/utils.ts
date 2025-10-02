import { GAME_CONFIG, ID_CHARS, RETRY_CONFIG } from './constants';
import { RetryFunction, RetryConfig, GameError } from './types';

/**
 * Generate a random room code
 */
export function generateRoomCode(): string {
  let result = '';
  for (let i = 0; i < GAME_CONFIG.ROOM_CODE_LENGTH; i++) {
    result += ID_CHARS.ROOM_CODE.charAt(
      Math.floor(Math.random() * ID_CHARS.ROOM_CODE.length)
    );
  }
  return result;
}

/**
 * Generate a random session ID
 */
export function generateSessionId(): string {
  let result = '';
  for (let i = 0; i < GAME_CONFIG.SESSION_ID_LENGTH; i++) {
    result += ID_CHARS.SESSION_ID.charAt(
      Math.floor(Math.random() * ID_CHARS.SESSION_ID.length)
    );
  }
  return result;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: RetryFunction<T>,
  config: RetryConfig = {
    maxRetries: RETRY_CONFIG.MAX_RETRIES,
    baseDelay: RETRY_CONFIG.BASE_DELAY,
    maxDelay: RETRY_CONFIG.MAX_DELAY,
  }
): Promise<T> {
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Only retry on concurrent access errors
      if (
        error.message &&
        error.message.includes('Documents read from or written to')
      ) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          config.maxDelay
        );
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Validate game configuration
 */
export function validateGameConfiguration(
  playerCount: number,
  numUndercovers: number,
  hasMrWhite: boolean
): { isValid: boolean; error?: string } {
  if (playerCount < GAME_CONFIG.MIN_PLAYERS) {
    return { isValid: false, error: 'Need at least 3 players to start' };
  }

  if (playerCount > GAME_CONFIG.MAX_PLAYERS) {
    return { isValid: false, error: 'Too many players' };
  }

  if (numUndercovers < GAME_CONFIG.MIN_UNDERCOVERS) {
    return { isValid: false, error: 'Need at least 1 undercover' };
  }

  if (
    numUndercovers > Math.floor(playerCount * GAME_CONFIG.MAX_UNDERCOVERS_RATIO)
  ) {
    return {
      isValid: false,
      error: 'Too many undercovers. Maximum is half the total players.',
    };
  }

  const totalSpecialRoles = numUndercovers + (hasMrWhite ? 1 : 0);
  if (totalSpecialRoles >= playerCount) {
    return {
      isValid: false,
      error:
        'Need at least 1 civilian player. Reduce undercovers or disable Mr. White.',
    };
  }

  if (hasMrWhite && playerCount < GAME_CONFIG.MR_WHITE_MIN_PLAYERS) {
    return {
      isValid: false,
      error: `Mr. White requires at least ${GAME_CONFIG.MR_WHITE_MIN_PLAYERS} players`,
    };
  }

  return { isValid: true };
}

/**
 * Calculate player counts by role
 */
export function calculatePlayerCounts(players: any[]): {
  alive: number;
  undercovers: number;
  civilians: number;
  mrWhite: number;
} {
  const alive = players.filter(p => p.isAlive);
  return {
    alive: alive.length,
    undercovers: alive.filter(p => p.role === 'undercover').length,
    civilians: alive.filter(p => p.role === 'civilian').length,
    mrWhite: alive.filter(p => p.role === 'mr_white').length,
  };
}

/**
 * Check win conditions
 */
export function checkWinConditions(
  counts: ReturnType<typeof calculatePlayerCounts>
): string | null {
  const { alive, undercovers, civilians, mrWhite } = counts;

  // Civilians win if all undercovers AND all Mr. White are eliminated
  if (undercovers === 0 && mrWhite === 0) {
    return 'civilians_win';
  }

  // Undercovers win if they equal or outnumber civilians (and no Mr. White)
  if (undercovers >= civilians && mrWhite === 0) {
    return 'undercovers_win';
  }

  // Mr. White solo victory: survives to end (last 2 players) with at least one civilian
  if (mrWhite > 0 && civilians > 0 && undercovers === 0 && alive === 2) {
    return 'mr_white_win';
  }

  // Joint victory: Undercovers + Mr. White win if all civilians eliminated
  if (civilians === 0 && undercovers > 0 && mrWhite > 0) {
    return 'undercovers_mrwhite_win';
  }

  return null;
}

/**
 * Count votes for each player
 */
export function countVotes(players: any[]): Record<string, number> {
  const voteCounts: Record<string, number> = {};
  players.forEach(player => {
    player.votes.forEach((voteId: string) => {
      voteCounts[voteId] = (voteCounts[voteId] || 0) + 1;
    });
  });
  return voteCounts;
}

/**
 * Find player with most votes
 */
export function findEliminatedPlayer(voteCounts: Record<string, number>): {
  eliminatedPlayerId: string | null;
  maxVotes: number;
  tie: boolean;
} {
  let eliminatedPlayerId: string | null = null;
  let maxVotes = 0;
  let tie = false;

  for (const [playerId, votes] of Object.entries(voteCounts)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      eliminatedPlayerId = playerId;
      tie = false;
    } else if (votes === maxVotes && votes > 0) {
      tie = true;
    }
  }

  return { eliminatedPlayerId, maxVotes, tie };
}

/**
 * Get voter names for each player
 */
export function getVoterNames(players: any[]): Record<string, string[]> {
  const voterNames: Record<string, string[]> = {};

  players.forEach(player => {
    player.votes.forEach((voteId: string) => {
      if (!voterNames[voteId]) voterNames[voteId] = [];
      voterNames[voteId].push(player.name);
    });
  });

  return voterNames;
}

/**
 * Find next alive player in turn order
 */
export function findNextAlivePlayer(
  playerOrder: string[],
  currentIndex: number,
  alivePlayerIds: string[]
): number {
  // Look for next alive player in the order
  for (let i = currentIndex + 1; i < playerOrder.length; i++) {
    if (alivePlayerIds.includes(playerOrder[i])) {
      return i;
    }
  }

  // If no next alive player found, check from the beginning
  for (let i = 0; i < currentIndex; i++) {
    if (alivePlayerIds.includes(playerOrder[i])) {
      return i;
    }
  }

  return -1;
}

/**
 * Shuffle array in place
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Ensure Mr. White is not first in player order
 */
export function ensureMrWhiteNotFirst(playerOrder: any[]): any[] {
  const mrWhiteIndex = playerOrder.findIndex(p => p.role === 'mr_white');
  if (mrWhiteIndex === 0) {
    // Move Mr. White to a random position (not first)
    const mrWhite = playerOrder.splice(0, 1)[0];
    const randomPosition =
      Math.floor(Math.random() * (playerOrder.length - 1)) + 1;
    playerOrder.splice(randomPosition, 0, mrWhite);
  }
  return playerOrder;
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy to clipboard:', fallbackError);
      return false;
    }
  }
}

/**
 * Sanitize input string
 */
export function sanitizeInput(
  input: string,
  maxLength: number = GAME_CONFIG.MAX_PLAYER_NAME_LENGTH
): string {
  return input.trim().slice(0, maxLength);
}

/**
 * Create custom error with code
 */
export function createGameError(
  message: string,
  code: string,
  details?: Record<string, unknown>
): GameError {
  const error = new Error(message) as GameError;
  error.code = code;
  error.details = details;
  return error;
}
