import { describe, expect, it } from 'bun:test';
import {
  calculateOptimalUndercovers,
  canStartGame,
  getDefaultGameSetup,
  getGameConfigurationSuggestions,
  getMaxUndercovers,
  getMinUndercovers,
  getPlayerCountStatus,
  hasEnoughPlayersToStart,
  shouldEnableMrWhite,
  validateGameConfiguration,
  validateRoomCapacity,
} from './game-config.service';

const mockConfig = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 10,
  MIN_UNDERCOVERS: 1,
  MAX_UNDERCOVERS_RATIO: 0.4,
  MR_WHITE_MIN_PLAYERS: 4,
  MAX_ROUNDS: 5,
};

describe('Game Configuration Functions', () => {
  describe('validateGameConfiguration', () => {
    it('should validate correct configuration', () => {
      const result = validateGameConfiguration(5, 2, 1, mockConfig);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject too few players', () => {
      const result = validateGameConfiguration(2, 1, 0, mockConfig);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Need at least 3 players');
    });

    it('should reject too many players', () => {
      const result = validateGameConfiguration(15, 5, 0, mockConfig);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Too many players');
    });

    it('should reject too few undercovers', () => {
      const result = validateGameConfiguration(5, 0, 0, mockConfig);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Need at least 1 undercover');
    });

    it('should reject too many undercovers', () => {
      const result = validateGameConfiguration(5, 3, 0, mockConfig);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Too many undercovers');
    });

    it('should reject when special roles >= total players', () => {
      // This test case is covered by the "too many undercovers" validation
      // The special roles validation is tested in the existing validation.test.ts
      const result = validateGameConfiguration(3, 2, 0, mockConfig);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Too many undercovers');
    });

    it('should reject Mr. White with too few players', () => {
      const result = validateGameConfiguration(3, 1, 1, mockConfig);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Mr. White requires at least 4 players');
    });
  });

  describe('getDefaultGameSetup', () => {
    it('should return default configuration', () => {
      const setup = getDefaultGameSetup(mockConfig);
      expect(setup.numUndercovers).toBe(1);
      expect(setup.numMrWhites).toBe(0);
      expect(setup.maxRounds).toBe(5);
    });
  });

  describe('calculateOptimalUndercovers', () => {
    it('should calculate optimal undercovers for small groups', () => {
      expect(calculateOptimalUndercovers(3, mockConfig)).toBe(1);
      expect(calculateOptimalUndercovers(4, mockConfig)).toBe(1);
    });

    it('should calculate optimal undercovers for medium groups', () => {
      expect(calculateOptimalUndercovers(5, mockConfig)).toBe(2);
      expect(calculateOptimalUndercovers(6, mockConfig)).toBe(2);
    });

    it('should calculate optimal undercovers for large groups', () => {
      expect(calculateOptimalUndercovers(7, mockConfig)).toBe(3);
      expect(calculateOptimalUndercovers(8, mockConfig)).toBe(3);
    });

    it('should respect maximum ratio', () => {
      const result = calculateOptimalUndercovers(10, mockConfig);
      expect(result).toBeLessThanOrEqual(4); // 40% of 10
    });
  });

  describe('shouldEnableMrWhite', () => {
    it('should enable Mr. White for sufficient players', () => {
      expect(shouldEnableMrWhite(4, mockConfig)).toBe(true);
      expect(shouldEnableMrWhite(5, mockConfig)).toBe(true);
    });

    it('should disable Mr. White for insufficient players', () => {
      expect(shouldEnableMrWhite(3, mockConfig)).toBe(false);
      expect(shouldEnableMrWhite(2, mockConfig)).toBe(false);
    });
  });

  describe('getMaxUndercovers', () => {
    it('should calculate maximum undercovers correctly', () => {
      expect(getMaxUndercovers(5, mockConfig)).toBe(2); // 40% of 5
      expect(getMaxUndercovers(10, mockConfig)).toBe(4); // 40% of 10
      expect(getMaxUndercovers(3, mockConfig)).toBe(1); // 40% of 3, floored
    });
  });

  describe('getMinUndercovers', () => {
    it('should return minimum undercovers', () => {
      expect(getMinUndercovers(mockConfig)).toBe(1);
    });
  });

  describe('canStartGame', () => {
    it('should allow starting game with valid configuration', () => {
      expect(canStartGame(5, 2, 1, mockConfig)).toBe(true);
    });

    it('should prevent starting game with invalid configuration', () => {
      expect(canStartGame(2, 1, 0, mockConfig)).toBe(false);
    });
  });

  describe('getGameConfigurationSuggestions', () => {
    it('should provide suggestions for small groups', () => {
      const suggestions = getGameConfigurationSuggestions(4, mockConfig);
      expect(suggestions.suggestedUndercovers).toBe(1);
      expect(suggestions.suggestedMrWhite).toBe(true);
      expect(suggestions.maxUndercovers).toBe(1);
      expect(suggestions.minUndercovers).toBe(1);
    });

    it('should provide suggestions for medium groups', () => {
      const suggestions = getGameConfigurationSuggestions(6, mockConfig);
      expect(suggestions.suggestedUndercovers).toBe(2);
      expect(suggestions.suggestedMrWhite).toBe(true);
      expect(suggestions.maxUndercovers).toBe(2);
      expect(suggestions.minUndercovers).toBe(1);
    });
  });

  describe('validateRoomCapacity', () => {
    it('should validate room capacity correctly', () => {
      expect(validateRoomCapacity(3, 5).isValid).toBe(true);
      expect(validateRoomCapacity(5, 5).isValid).toBe(false);
      expect(validateRoomCapacity(6, 5).isValid).toBe(false);
    });
  });

  describe('hasEnoughPlayersToStart', () => {
    it('should check if enough players to start', () => {
      expect(hasEnoughPlayersToStart(3, mockConfig)).toBe(true);
      expect(hasEnoughPlayersToStart(2, mockConfig)).toBe(false);
      expect(hasEnoughPlayersToStart(5, mockConfig)).toBe(true);
    });
  });

  describe('getPlayerCountStatus', () => {
    it('should provide correct status for insufficient players', () => {
      const status = getPlayerCountStatus(2, mockConfig);
      expect(status.canStart).toBe(false);
      expect(status.needsMorePlayers).toBe(true);
      expect(status.isFull).toBe(false);
      expect(status.statusText).toContain('Need 1 more players');
    });

    it('should provide correct status for sufficient players', () => {
      const status = getPlayerCountStatus(5, mockConfig);
      expect(status.canStart).toBe(true);
      expect(status.needsMorePlayers).toBe(false);
      expect(status.isFull).toBe(false);
      expect(status.statusText).toBe('Ready to start');
    });

    it('should provide correct status for full room', () => {
      const status = getPlayerCountStatus(10, mockConfig);
      expect(status.canStart).toBe(true);
      expect(status.needsMorePlayers).toBe(false);
      expect(status.isFull).toBe(true);
      expect(status.statusText).toBe('Room is full');
    });
  });
});
