/**
 * Tests for extended room management functions
 */

import { describe, expect, test } from "bun:test";
import type { Id } from "cvx/dataModel";
import type { ConvexPlayer } from "../../lib/convex-types";
import type { Player, Room } from "../../lib/types";
import {
  calculateMaxUndercovers,
  calculateVoteData,
  calculateVotingProgress,
  generateRoomUrl,
  getCurrentPlayerByName,
  getCurrentTurnPlayer,
  getGameConfigurationDisplay,
  getPlayersWhoVoted,
  isMyTurn,
  isVotingPhase,
} from "./room-management.service";

describe("Extended Room Management Functions", () => {
  // Helper function to convert test players to ConvexPlayer format
  const toConvexPlayers = (players: Player[]): ConvexPlayer[] =>
    players.map((p) => ({
      _id: p._id,
      _creationTime: Date.now(),
      roomId: p.roomId,
      name: p.name,
      sessionId: p.sessionId,
      isHost: p.isHost,
      isAlive: p.isAlive,
      role: p.role,
      votes: p.votes,
      sharedWord: p.sharedWord,
      hasSharedWord: p.hasSharedWord,
      hasVoted: p.votes && p.votes.length > 0,
      createdAt: p.createdAt,
    }));

  const mockPlayers: Player[] = [
    {
      _id: "player1" as Id<"players">,
      name: "Alice",
      isAlive: true,
      role: "civilian",
      votes: ["player2" as Id<"players">],
      hasSharedWord: true,
      roomId: "room1" as Id<"rooms">,
      isHost: false,
      createdAt: Date.now(),
    },
    {
      _id: "player2" as Id<"players">,
      name: "Bob",
      isAlive: true,
      role: "undercover",
      votes: ["player1" as Id<"players">],
      hasSharedWord: true,
      roomId: "room1" as Id<"rooms">,
      isHost: false,
      createdAt: Date.now(),
    },
    {
      _id: "player3" as Id<"players">,
      name: "Charlie",
      isAlive: false,
      role: "civilian",
      votes: [],
      hasSharedWord: false,
      roomId: "room1" as Id<"rooms">,
      isHost: false,
      createdAt: Date.now(),
    },
  ];

  const mockRoom: Room = {
    _id: "room1" as Id<"rooms">,
    code: "ABC123",
    hostId: "host1",
    gameState: "voting",
    currentRound: 1,
    maxRounds: 3,
    currentPlayerIndex: 0,
    playerOrder: [
      "player1" as Id<"players">,
      "player2" as Id<"players">,
      "player3" as Id<"players">,
    ],
    players: mockPlayers,
    numMrWhites: 0,
    numUndercovers: 1,
    createdAt: Date.now(),
  };

  describe("calculateVotingProgress", () => {
    test("should calculate voting progress correctly", () => {
      const progress = calculateVotingProgress(toConvexPlayers(mockPlayers));
      expect(progress).toBe(100); // 2 alive players, 2 voted = 100%
    });

    test("should return 0 when no alive players", () => {
      const deadPlayers = mockPlayers.map((p) => ({ ...p, isAlive: false }));
      const progress = calculateVotingProgress(toConvexPlayers(deadPlayers));
      expect(progress).toBe(0);
    });

    test("should calculate partial progress", () => {
      const playersWithPartialVoting: Player[] = [
        {
          _id: "player1" as Id<"players">,
          name: "Alice",
          role: "civilian",
          isAlive: true,
          hasSharedWord: false,
          votes: ["player2" as Id<"players">],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
        {
          _id: "player2" as Id<"players">,
          name: "Bob",
          role: "undercover",
          isAlive: true,
          hasSharedWord: false,
          votes: [],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
      ];
      const progress = calculateVotingProgress(
        toConvexPlayers(playersWithPartialVoting),
      );
      expect(progress).toBe(50); // 1 out of 2 voted
    });
  });

  describe("getCurrentTurnPlayer", () => {
    test("should return current turn player", () => {
      const currentPlayer = getCurrentTurnPlayer(
        mockRoom,
        toConvexPlayers(mockPlayers),
      );
      expect(currentPlayer).toEqual(toConvexPlayers(mockPlayers)[0] ?? null);
    });

    test("should return null when no current turn player", () => {
      const roomWithoutTurn = { ...mockRoom, currentPlayerIndex: undefined };
      const currentPlayer = getCurrentTurnPlayer(
        roomWithoutTurn,
        toConvexPlayers(mockPlayers),
      );
      expect(currentPlayer).toBeNull();
    });
  });

  describe("isMyTurn", () => {
    test("should return true for current turn player", () => {
      const isTurn = isMyTurn("player1", mockRoom);
      expect(isTurn).toBe(true);
    });

    test("should return false for non-current turn player", () => {
      const isTurn = isMyTurn("player2", mockRoom);
      expect(isTurn).toBe(false);
    });
  });

  describe("calculateVoteData", () => {
    test("should calculate vote counts and voter names", () => {
      const { voteCounts, voterNames } = calculateVoteData(
        toConvexPlayers(mockPlayers),
      );

      expect(voteCounts).toEqual({
        player2: 1,
        player1: 1,
      });

      expect(voterNames).toEqual({
        player2: ["Alice"],
        player1: ["Bob"],
      });
    });

    test("should handle players with no votes", () => {
      const playersWithNoVotes = mockPlayers.map((p) => ({ ...p, votes: [] }));
      const { voteCounts, voterNames } = calculateVoteData(
        toConvexPlayers(playersWithNoVotes),
      );

      expect(voteCounts).toEqual({});
      expect(voterNames).toEqual({});
    });
  });

  describe("getPlayersWhoVoted", () => {
    test("should return only alive players who voted", () => {
      const playersWhoVoted = getPlayersWhoVoted(toConvexPlayers(mockPlayers));
      expect(playersWhoVoted).toHaveLength(2);
      expect(
        playersWhoVoted.every((p) => p.isAlive && p.hasVoted === true),
      ).toBe(true);
    });

    test("should exclude dead players even if they voted", () => {
      const playersWhoVoted = getPlayersWhoVoted(toConvexPlayers(mockPlayers));
      expect(playersWhoVoted.find((p) => p._id === "player3")).toBeUndefined();
    });
  });

  describe("isVotingPhase", () => {
    test("should return true for voting phase", () => {
      expect(isVotingPhase(mockRoom)).toBe(true);
    });

    test("should return false for non-voting phase", () => {
      const discussionRoom = { ...mockRoom, gameState: "discussion" as const };
      expect(isVotingPhase(discussionRoom)).toBe(false);
    });
  });

  describe("getCurrentPlayerByName", () => {
    test("should find player by name", () => {
      const player = getCurrentPlayerByName(
        toConvexPlayers(mockPlayers),
        "Alice",
      );
      expect(player).toEqual(toConvexPlayers(mockPlayers)[0] ?? null);
    });

    test("should return null for non-existent player", () => {
      const player = getCurrentPlayerByName(
        toConvexPlayers(mockPlayers),
        "NonExistent",
      );
      expect(player).toBeNull();
    });
  });

  describe("generateRoomUrl", () => {
    test("should generate room URL with room code", () => {
      const url = generateRoomUrl("ABC123", "https://example.com");
      expect(url).toBe("https://example.com/room/ABC123");
    });

    test("should handle undefined base URL", () => {
      const url = generateRoomUrl("ABC123");
      expect(url).toBe("/room/ABC123");
    });
  });

  describe("calculateMaxUndercovers", () => {
    test("should calculate max undercovers for small groups", () => {
      expect(calculateMaxUndercovers(4)).toBe(2);
    });

    test("should calculate max undercovers for medium groups", () => {
      expect(calculateMaxUndercovers(6)).toBe(3);
    });

    test("should handle edge case of 2 players", () => {
      expect(calculateMaxUndercovers(2)).toBe(1);
    });

    test("should handle single player", () => {
      expect(calculateMaxUndercovers(1)).toBe(0);
    });
  });

  describe("getGameConfigurationDisplay", () => {
    test("should display configuration with Mr. White", () => {
      const config = {
        numUndercovers: 2,
        numMrWhites: 1,
        totalPlayers: 6,
      };

      const display = getGameConfigurationDisplay(config);
      expect(display).toContain("2 Undercovers");
      expect(display).toContain("1 Mr. White");
      expect(display).toContain("3 Civils");
    });

    test("should display configuration without Mr. White", () => {
      const config = {
        numUndercovers: 1,
        numMrWhites: 0,
        totalPlayers: 4,
      };

      const display = getGameConfigurationDisplay(config);
      expect(display).toContain("1 Undercover");
      expect(display).toContain("Pas de Mr. White");
      expect(display).toContain("3 Civils");
    });

    test("should handle singular forms correctly", () => {
      const config = {
        numUndercovers: 1,
        numMrWhites: 0,
        totalPlayers: 3,
      };

      const display = getGameConfigurationDisplay(config);
      expect(display).toContain("1 Undercover");
      expect(display).toContain("2 Civils");
    });
  });
});
