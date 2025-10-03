/**
 * Room Domain - Room Management Service
 * Pure functions for room state management and game flow
 */

import { ConvexPlayer } from '../../lib/convex-types';
import { Room, RoomState } from './room';

/**
 * Get reset room data for new game
 */
export function getResetRoomData(): Partial<RoomState> {
  return {
    gameState: 'waiting',
    currentRound: 0,
    currentPlayerIndex: 0,
    playerOrder: [],
  };
}

/**
 * Check if room is in waiting state
 */
export function isRoomWaiting(room: Room): boolean {
  return room.gameState === 'waiting';
}

/**
 * Check if room is in discussion state
 */
export function isRoomDiscussion(room: Room): boolean {
  return room.gameState === 'discussion';
}

/**
 * Check if room is in voting state
 */
export function isRoomVoting(room: Room): boolean {
  return room.gameState === 'voting';
}

/**
 * Check if room is in results state
 */
export function isRoomResults(room: Room): boolean {
  return room.gameState === 'results';
}

/**
 * Check if room is in Mr. White guessing state
 */
export function isRoomMrWhiteGuessing(room: Room): boolean {
  return room.gameState === 'mr_white_guessing';
}

/**
 * Check if game is active (not waiting or results)
 */
export function isGameActive(room: Room): boolean {
  return ['discussion', 'voting', 'mr_white_guessing'].includes(room.gameState);
}

/**
 * Check if game is finished
 */
export function isGameFinished(room: Room): boolean {
  return room.gameState === 'results';
}

/**
 * Get current turn player ID
 */
export function getCurrentTurnPlayerId(room: Room): string | null {
  if (!room.playerOrder || room.currentPlayerIndex === undefined) {
    return null;
  }

  return room.playerOrder[room.currentPlayerIndex] || null;
}

/**
 * Check if it's a specific player's turn
 */
export function isPlayerTurn(playerId: string, room: Room): boolean {
  const currentTurnPlayerId = getCurrentTurnPlayerId(room);
  return currentTurnPlayerId === playerId;
}

/**
 * Get next turn player ID
 */
export function getNextTurnPlayerId(
  room: Room,
  alivePlayerIds: string[]
): string | null {
  if (!room.playerOrder || room.currentPlayerIndex === undefined) {
    return null;
  }

  // Look for next alive player in the order
  for (let i = room.currentPlayerIndex + 1; i < room.playerOrder.length; i++) {
    if (alivePlayerIds.includes(room.playerOrder[i])) {
      return room.playerOrder[i];
    }
  }

  // If no next alive player found, check from the beginning
  for (let i = 0; i < room.currentPlayerIndex; i++) {
    if (alivePlayerIds.includes(room.playerOrder[i])) {
      return room.playerOrder[i];
    }
  }

  return null;
}

/**
 * Get room status text
 */
export function getRoomStatusText(room: Room): string {
  const statusMap: Record<string, string> = {
    waiting: 'En attente des joueurs',
    discussion: 'Phase de discussion',
    voting: 'Phase de vote',
    mr_white_guessing: 'Mr. White devine',
    results: 'Résultats du jeu',
  };

  return statusMap[room.gameState] || room.gameState;
}

/**
 * Get round display text
 */
export function getRoundDisplayText(room: Room): string {
  return `Round ${room.currentRound}/${room.maxRounds}`;
}

/**
 * Check if max rounds reached
 */
export function isMaxRoundsReached(room: Room): boolean {
  return room.currentRound >= room.maxRounds;
}

/**
 * Get game progress percentage
 */
export function getGameProgress(room: Room): number {
  if (room.maxRounds <= 0) return 0;
  return Math.min((room.currentRound / room.maxRounds) * 100, 100);
}

/**
 * Check if room can start game
 */
export function canStartGame(
  room: Room,
  playerCount: number,
  minPlayers: number
): boolean {
  return (
    isRoomWaiting(room) &&
    playerCount >= minPlayers &&
    Boolean(room.playerOrder && room.playerOrder.length > 0)
  );
}

/**
 * Get room configuration summary
 */
export function getRoomConfigurationSummary(room: Room): {
  numMrWhites: number;
  numUndercovers: number;
  maxRounds: number;
  currentRound: number;
} {
  return {
    numMrWhites: room.numMrWhites || 0,
    numUndercovers: room.numUndercovers || 0,
    maxRounds: room.maxRounds,
    currentRound: room.currentRound,
  };
}

/**
 * Check if room has Mr. White players
 */
export function hasMrWhite(room: Room): boolean {
  return (room.numMrWhites || 0) > 0;
}

/**
 * Check if room is ready for next phase
 */
export function isRoomReadyForNextPhase(
  room: Room,
  players: ConvexPlayer[],
  phase: 'discussion' | 'voting'
): boolean {
  if (phase === 'discussion') {
    // All alive players should have shared their word
    const alivePlayers = players.filter(p => p.isAlive);
    return alivePlayers.every(p => p.hasSharedWord === true);
  } else if (phase === 'voting') {
    // All alive players should have voted
    const alivePlayers = players.filter(p => p.isAlive);
    return alivePlayers.every(p => p.hasVoted === true);
  }

  return false;
}

/**
 * Get turn order information
 */
export function getTurnOrderInfo(room: Room): {
  currentIndex: number;
  totalPlayers: number;
  isLastTurn: boolean;
  turnText: string;
} {
  const currentIndex = room.currentPlayerIndex || 0;
  const totalPlayers = room.playerOrder?.length || 0;
  const isLastTurn = currentIndex >= totalPlayers - 1;

  return {
    currentIndex,
    totalPlayers,
    isLastTurn,
    turnText: `Tour ${currentIndex + 1}/${totalPlayers}`,
  };
}

/**
 * Check if room needs state validation
 */
export function needsStateValidation(room: Room): boolean {
  // Room might need validation if it's in an inconsistent state
  return (
    isGameActive(room) &&
    (!room.playerOrder || room.currentPlayerIndex === undefined)
  );
}

/**
 * Get room statistics
 */
export function getRoomStatistics(
  room: Room,
  players: ConvexPlayer[]
): {
  totalPlayers: number;
  alivePlayers: number;
  deadPlayers: number;
  gameProgress: number;
  currentPhase: string;
} {
  const alivePlayers = players.filter(p => p.isAlive);
  const deadPlayers = players.filter(p => !p.isAlive);

  return {
    totalPlayers: players.length,
    alivePlayers: alivePlayers.length,
    deadPlayers: deadPlayers.length,
    gameProgress: getGameProgress(room),
    currentPhase: getRoomStatusText(room),
  };
}

/**
 * Calculate voting progress for alive players
 */
export function calculateVotingProgress(players: ConvexPlayer[]): number {
  const alivePlayers = players.filter(p => p.isAlive);
  if (alivePlayers.length === 0) return 0;

  const playersWhoVoted = alivePlayers.filter(p => p.hasVoted === true);
  return (playersWhoVoted.length / alivePlayers.length) * 100;
}

/**
 * Get current turn player from room
 */
export function getCurrentTurnPlayer(
  room: Room,
  players: ConvexPlayer[]
): ConvexPlayer | null {
  const currentTurnPlayerId = getCurrentTurnPlayerId(room);
  if (!currentTurnPlayerId) return null;

  return players.find(p => p._id === currentTurnPlayerId) || null;
}

/**
 * Check if it's a specific player's turn
 */
export function isMyTurn(playerId: string, room: Room): boolean {
  const currentTurnPlayerId = getCurrentTurnPlayerId(room);
  return currentTurnPlayerId === playerId;
}

/**
 * Calculate vote counts and voter names for display
 */
export function calculateVoteData(players: ConvexPlayer[]): {
  voteCounts: Record<string, number>;
  voterNames: Record<string, string[]>;
} {
  const alivePlayers = players.filter(p => p.isAlive);
  const voteCounts: Record<string, number> = {};
  const voterNames: Record<string, string[]> = {};

  alivePlayers.forEach(player => {
    player.votes.forEach((voteId: string) => {
      voteCounts[voteId] = (voteCounts[voteId] || 0) + 1;
      if (!voterNames[voteId]) voterNames[voteId] = [];
      voterNames[voteId].push(player.name);
    });
  });

  return { voteCounts, voterNames };
}

/**
 * Get players who have voted
 */
export function getPlayersWhoVoted(players: ConvexPlayer[]): ConvexPlayer[] {
  const alivePlayers = players.filter(p => p.isAlive);
  return alivePlayers.filter(p => p.hasVoted === true);
}

/**
 * Check if room is in voting phase
 */
export function isVotingPhase(room: Room): boolean {
  return room.gameState === 'voting';
}

/**
 * Check if room is in discussion phase
 */
export function isDiscussionPhase(room: Room): boolean {
  return room.gameState === 'discussion';
}

/**
 * Get current player by name
 */
export function getCurrentPlayerByName(
  players: ConvexPlayer[],
  playerName: string
): ConvexPlayer | null {
  return players.find(p => p.name === playerName) || null;
}

/**
 * Generate room URL
 */
export function generateRoomUrl(roomCode: string, baseUrl?: string): string {
  const origin =
    baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${origin}/room/${roomCode}`;
}

/**
 * Calculate maximum undercovers for room
 */
export function calculateMaxUndercovers(playerCount: number): number {
  return Math.min(Math.floor(playerCount / 2), playerCount - 1);
}

/**
 * Get game configuration display text
 */
export function getGameConfigurationDisplay(config: {
  numUndercovers: number;
  numMrWhites: number;
  totalPlayers: number;
}): string {
  const { numUndercovers, numMrWhites, totalPlayers } = config;
  const civilians = totalPlayers - numUndercovers - numMrWhites;

  return `• ${numUndercovers} Undercover${numUndercovers > 1 ? 's' : ''}
• ${numMrWhites} Mr. White${numMrWhites > 1 ? 's' : ''}${numMrWhites === 0 ? ' (Aucun)' : ''}
• ${civilians} Civil${civilians > 1 ? 's' : ''}`;
}
