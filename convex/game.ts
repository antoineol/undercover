// Re-export all game functions from their focused modules
// This maintains backward compatibility while following single responsibility principle

// Game start functions
export { startGame } from './game_start';

// Word sharing functions
export { resetWordSharing, shareWord } from './game_word_sharing';

// Voting functions
export {
  endVoting,
  mrWhiteGuess,
  startVoting,
  votePlayer,
} from './game_voting';

// Game management functions
export {
  checkMaxRoundsReached,
  restartGame,
  stopGame,
  validateGameState,
} from './game_management';

// Query functions
export { getGameWords } from './game_queries';
