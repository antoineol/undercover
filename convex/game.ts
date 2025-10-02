// Re-export all game functions from their focused modules
// This maintains backward compatibility while following single responsibility principle

// Game start functions
export { startGame } from './game_start';

// Word sharing functions
export { shareWord, resetWordSharing } from './game_word_sharing';

// Voting functions
export { votePlayer, endVoting, startVoting } from './game_voting';

// Game management functions
export {
  validateGameState,
  restartGame,
  checkMaxRoundsReached,
} from './game_management';

// Query functions
export { getGameWords } from './game_queries';
