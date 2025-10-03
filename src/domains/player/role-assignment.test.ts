import { describe, expect, test } from 'bun:test';
import {
  assignRoles,
  createPlayerOrder,
  findNextAlivePlayer,
  shuffleArray,
  ensureMrWhiteNotFirst,
} from './role-assignment.service';
import { Player } from '../../lib/types';

describe('Role Assignment Functions', () => {
  const mockPlayers: Player[] = [
    {
      _id: 'player1',
      name: 'Alice',
      role: 'civilian',
      isAlive: true,
      votes: [],
      roomId: 'room1',
      isHost: false,
      createdAt: Date.now(),
    },
    {
      _id: 'player2',
      name: 'Bob',
      role: 'civilian',
      isAlive: true,
      votes: [],
      roomId: 'room1',
      isHost: false,
      createdAt: Date.now(),
    },
    {
      _id: 'player3',
      name: 'Charlie',
      role: 'civilian',
      isAlive: true,
      votes: [],
      roomId: 'room1',
      isHost: false,
      createdAt: Date.now(),
    },
    {
      _id: 'player4',
      name: 'David',
      role: 'civilian',
      isAlive: true,
      votes: [],
      roomId: 'room1',
      isHost: false,
      createdAt: Date.now(),
    },
  ];

  describe('assignRoles', () => {
    test('should assign roles correctly with undercovers and mr white', () => {
      const assignments = assignRoles(mockPlayers, 2, true);

      expect(assignments).toHaveLength(4);

      const undercoverCount = assignments.filter(
        a => a.role === 'undercover'
      ).length;
      const mrWhiteCount = assignments.filter(
        a => a.role === 'mr_white'
      ).length;
      const civilianCount = assignments.filter(
        a => a.role === 'civilian'
      ).length;

      expect(undercoverCount).toBe(2);
      expect(mrWhiteCount).toBe(1);
      expect(civilianCount).toBe(1);
    });

    test('should assign roles correctly without mr white', () => {
      const assignments = assignRoles(mockPlayers, 1, false);

      expect(assignments).toHaveLength(4);

      const undercoverCount = assignments.filter(
        a => a.role === 'undercover'
      ).length;
      const mrWhiteCount = assignments.filter(
        a => a.role === 'mr_white'
      ).length;
      const civilianCount = assignments.filter(
        a => a.role === 'civilian'
      ).length;

      expect(undercoverCount).toBe(1);
      expect(mrWhiteCount).toBe(0);
      expect(civilianCount).toBe(3);
    });

    test('should handle empty player list', () => {
      const assignments = assignRoles([], 1, false);
      expect(assignments).toHaveLength(0);
    });
  });

  describe('createPlayerOrder', () => {
    test('should create player order from players', () => {
      const playerOrder = createPlayerOrder(mockPlayers);
      expect(playerOrder).toHaveLength(4);
      expect(playerOrder).toContain('player1');
      expect(playerOrder).toContain('player2');
      expect(playerOrder).toContain('player3');
      expect(playerOrder).toContain('player4');
    });

    test('should handle empty player list', () => {
      const playerOrder = createPlayerOrder([]);
      expect(playerOrder).toHaveLength(0);
    });
  });

  describe('findNextAlivePlayer', () => {
    const playerOrder = ['player1', 'player2', 'player3', 'player4'];

    test('should find next alive player', () => {
      const alivePlayerIds = ['player1', 'player2', 'player4'];
      const nextIndex = findNextAlivePlayer(playerOrder, 0, alivePlayerIds);
      expect(nextIndex).toBe(1); // player2
    });

    test('should wrap around to beginning', () => {
      const alivePlayerIds = ['player1', 'player4'];
      const nextIndex = findNextAlivePlayer(playerOrder, 2, alivePlayerIds);
      expect(nextIndex).toBe(3); // player4
    });

    test('should return -1 when no alive players', () => {
      const alivePlayerIds: string[] = [];
      const nextIndex = findNextAlivePlayer(playerOrder, 0, alivePlayerIds);
      expect(nextIndex).toBe(-1);
    });

    test('should return -1 when only current player is alive', () => {
      const alivePlayerIds = ['player2'];
      const nextIndex = findNextAlivePlayer(playerOrder, 1, alivePlayerIds);
      expect(nextIndex).toBe(-1);
    });
  });

  describe('shuffleArray', () => {
    test('should return array of same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      expect(shuffled).toHaveLength(5);
    });

    test('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);
      expect(original).toEqual(originalCopy);
    });

    test('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    test('should handle empty array', () => {
      const shuffled = shuffleArray([]);
      expect(shuffled).toEqual([]);
    });

    test('should handle single element', () => {
      const shuffled = shuffleArray([42]);
      expect(shuffled).toEqual([42]);
    });
  });

  describe('ensureMrWhiteNotFirst', () => {
    test('should move mr white from first position', () => {
      const playersWithMrWhiteFirst: Player[] = [
        { ...mockPlayers[0], role: 'mr_white' },
        { ...mockPlayers[1], role: 'civilian' },
        { ...mockPlayers[2], role: 'civilian' },
        { ...mockPlayers[3], role: 'civilian' },
      ];

      const reordered = ensureMrWhiteNotFirst(playersWithMrWhiteFirst);
      expect(reordered[0].role).not.toBe('mr_white');
      expect(reordered.some(p => p.role === 'mr_white')).toBe(true);
    });

    test('should not change order when mr white is not first', () => {
      const playersWithMrWhiteNotFirst: Player[] = [
        { ...mockPlayers[0], role: 'civilian' },
        { ...mockPlayers[1], role: 'mr_white' },
        { ...mockPlayers[2], role: 'civilian' },
        { ...mockPlayers[3], role: 'civilian' },
      ];

      const reordered = ensureMrWhiteNotFirst(playersWithMrWhiteNotFirst);
      expect(reordered[0].role).toBe('civilian');
      expect(reordered[1].role).toBe('mr_white');
    });

    test('should handle players without mr white', () => {
      const reordered = ensureMrWhiteNotFirst(mockPlayers);
      expect(reordered).toHaveLength(4);
      expect(reordered.every(p => p.role === 'civilian')).toBe(true);
    });
  });
});
