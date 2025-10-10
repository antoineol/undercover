import { describe, expect, it } from "bun:test";
import type { Id } from "cvx/dataModel";
import type { ConvexPlayer } from "../../lib/convex-types";
import type { Player, Room } from "../../lib/types";
import {
  canStartGame,
  getCurrentTurnPlayerId,
  getGameProgress,
  getNextTurnPlayerId,
  getResetRoomData,
  getRoomConfigurationSummary,
  getRoomStatistics,
  getRoomStatusText,
  getRoundDisplayText,
  getTurnOrderInfo,
  hasMrWhite,
  isGameActive,
  isGameFinished,
  isMaxRoundsReached,
  isPlayerTurn,
  isRoomDiscussion,
  isRoomMrWhiteGuessing,
  isRoomReadyForNextPhase,
  isRoomResults,
  isRoomVoting,
  isRoomWaiting,
  needsStateValidation,
} from "./room-management.service";

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
    hasVoted: false,
    createdAt: p.createdAt,
  }));

const mockRoom: Room = {
  _id: "room1" as Id<"rooms">,
  code: "ABC123",
  hostId: "host1",
  gameState: "waiting",
  currentRound: 1,
  maxRounds: 5,
  currentPlayerIndex: 0,
  playerOrder: [
    "player1" as Id<"players">,
    "player2" as Id<"players">,
    "player3" as Id<"players">,
  ],
  numMrWhites: 0,
  numUndercovers: 1,
  createdAt: Date.now(),
  players: [],
};

const mockPlayers: Player[] = [
  {
    _id: "player1" as Id<"players">,
    name: "Player 1",
    role: "civilian",
    isAlive: true,
    hasSharedWord: true,
    votes: [],
    roomId: "room1" as Id<"rooms">,
    isHost: true,
    createdAt: Date.now(),
  },
  {
    _id: "player2" as Id<"players">,
    name: "Player 2",
    role: "undercover",
    isAlive: true,
    hasSharedWord: true,
    votes: ["player1" as Id<"players">],
    roomId: "room1" as Id<"rooms">,
    isHost: false,
    createdAt: Date.now(),
  },
  {
    _id: "player3" as Id<"players">,
    name: "Player 3",
    role: "civilian",
    isAlive: false,
    hasSharedWord: false,
    votes: [],
    roomId: "room1" as Id<"rooms">,
    isHost: false,
    createdAt: Date.now(),
  },
];

describe("Room Management Functions", () => {
  describe("getResetRoomData", () => {
    it("should return reset room data", () => {
      const resetData = getResetRoomData();
      expect(resetData.gameState).toBe("waiting");
      expect(resetData.currentRound).toBe(0);
      expect(resetData.currentPlayerIndex).toBe(0);
      expect(resetData.playerOrder).toEqual([]);
    });
  });

  describe("Room state checks", () => {
    it("should correctly identify room states", () => {
      expect(isRoomWaiting(mockRoom)).toBe(true);
      expect(isRoomDiscussion(mockRoom)).toBe(false);
      expect(isRoomVoting(mockRoom)).toBe(false);
      expect(isRoomResults(mockRoom)).toBe(false);
      expect(isRoomMrWhiteGuessing(mockRoom)).toBe(false);
    });

    it("should identify discussion state", () => {
      const discussionRoom = { ...mockRoom, gameState: "discussion" as const };
      expect(isRoomDiscussion(discussionRoom)).toBe(true);
      expect(isRoomWaiting(discussionRoom)).toBe(false);
    });

    it("should identify voting state", () => {
      const votingRoom = { ...mockRoom, gameState: "voting" as const };
      expect(isRoomVoting(votingRoom)).toBe(true);
      expect(isRoomDiscussion(votingRoom)).toBe(false);
    });

    it("should identify results state", () => {
      const resultsRoom = { ...mockRoom, gameState: "results" as const };
      expect(isRoomResults(resultsRoom)).toBe(true);
      expect(isRoomVoting(resultsRoom)).toBe(false);
    });
  });

  describe("Game state checks", () => {
    it("should identify active games", () => {
      const discussionRoom = { ...mockRoom, gameState: "discussion" as const };
      const votingRoom = { ...mockRoom, gameState: "voting" as const };
      const mrWhiteRoom = {
        ...mockRoom,
        gameState: "mr_white_guessing" as const,
      };

      expect(isGameActive(discussionRoom)).toBe(true);
      expect(isGameActive(votingRoom)).toBe(true);
      expect(isGameActive(mrWhiteRoom)).toBe(true);
      expect(isGameActive(mockRoom)).toBe(false);
    });

    it("should identify finished games", () => {
      const resultsRoom = { ...mockRoom, gameState: "results" as const };
      expect(isGameFinished(resultsRoom)).toBe(true);
      expect(isGameFinished(mockRoom)).toBe(false);
    });
  });

  describe("getCurrentTurnPlayerId", () => {
    it("should return current turn player ID", () => {
      expect(getCurrentTurnPlayerId(mockRoom)).toBe("player1");
    });

    it("should return null for room without player order", () => {
      const roomWithoutOrder = { ...mockRoom, playerOrder: undefined };
      expect(getCurrentTurnPlayerId(roomWithoutOrder)).toBe(null);
    });

    it("should return null for room without current player index", () => {
      const roomWithoutIndex = { ...mockRoom, currentPlayerIndex: undefined };
      expect(getCurrentTurnPlayerId(roomWithoutIndex)).toBe(null);
    });
  });

  describe("isPlayerTurn", () => {
    it("should correctly identify player turn", () => {
      expect(isPlayerTurn("player1", mockRoom)).toBe(true);
      expect(isPlayerTurn("player2", mockRoom)).toBe(false);
    });
  });

  describe("getNextTurnPlayerId", () => {
    it("should find next alive player", () => {
      const alivePlayerIds = ["player1", "player2"];
      expect(getNextTurnPlayerId(mockRoom, alivePlayerIds)).toBe("player2");
    });

    it("should wrap around to beginning", () => {
      const roomAtEnd = { ...mockRoom, currentPlayerIndex: 2 };
      const alivePlayerIds = ["player1", "player2"];
      expect(getNextTurnPlayerId(roomAtEnd, alivePlayerIds)).toBe("player1");
    });

    it("should return null when no next alive player", () => {
      const alivePlayerIds = ["player1"];
      expect(getNextTurnPlayerId(mockRoom, alivePlayerIds)).toBe(null);
    });
  });

  describe("getRoomStatusText", () => {
    it("should return correct status text for known states", () => {
      expect(getRoomStatusText(mockRoom)).toBe("En attente des joueurs");

      const discussionRoom = { ...mockRoom, gameState: "discussion" as const };
      expect(getRoomStatusText(discussionRoom)).toBe("Phase de discussion");

      const votingRoom = { ...mockRoom, gameState: "voting" as const };
      expect(getRoomStatusText(votingRoom)).toBe("Phase de vote");
    });

    it("should return state as-is for unknown states", () => {
      const unknownRoom = { ...mockRoom, gameState: "waiting" as const };
      expect(getRoomStatusText(unknownRoom)).toBe("En attente des joueurs");
    });
  });

  describe("getRoundDisplayText", () => {
    it("should format round display correctly", () => {
      expect(getRoundDisplayText(mockRoom)).toBe("Round 1/5");
    });
  });

  describe("isMaxRoundsReached", () => {
    it("should check if max rounds reached", () => {
      expect(isMaxRoundsReached(mockRoom)).toBe(false);

      const maxRoundsRoom = { ...mockRoom, currentRound: 5 };
      expect(isMaxRoundsReached(maxRoundsRoom)).toBe(true);

      const exceededRoundsRoom = { ...mockRoom, currentRound: 6 };
      expect(isMaxRoundsReached(exceededRoundsRoom)).toBe(true);
    });
  });

  describe("getGameProgress", () => {
    it("should calculate game progress correctly", () => {
      expect(getGameProgress(mockRoom)).toBe(20); // 1/5 * 100

      const halfwayRoom = { ...mockRoom, currentRound: 2.5, maxRounds: 5 };
      expect(getGameProgress(halfwayRoom)).toBe(50);

      const completedRoom = { ...mockRoom, currentRound: 5, maxRounds: 5 };
      expect(getGameProgress(completedRoom)).toBe(100);
    });

    it("should handle zero max rounds", () => {
      const zeroRoundsRoom = { ...mockRoom, maxRounds: 0 };
      expect(getGameProgress(zeroRoundsRoom)).toBe(0);
    });
  });

  describe("canStartGame", () => {
    it("should allow starting game with valid conditions", () => {
      expect(canStartGame(mockRoom, 5, 3)).toBe(true);
    });

    it("should prevent starting game with insufficient players", () => {
      expect(canStartGame(mockRoom, 2, 3)).toBe(false);
    });

    it("should prevent starting game when not waiting", () => {
      const discussionRoom = { ...mockRoom, gameState: "discussion" as const };
      expect(canStartGame(discussionRoom, 5, 3)).toBe(false);
    });

    it("should prevent starting game without player order", () => {
      const roomWithoutOrder = { ...mockRoom, playerOrder: undefined };
      expect(canStartGame(roomWithoutOrder, 5, 3)).toBe(false);
    });
  });

  describe("getRoomConfigurationSummary", () => {
    it("should return room configuration summary", () => {
      const summary = getRoomConfigurationSummary(mockRoom);
      expect(hasMrWhite(mockRoom)).toBe(false);
      expect(summary.numUndercovers).toBe(1);
      expect(summary.maxRounds).toBe(5);
      expect(summary.currentRound).toBe(1);
    });
  });

  describe("isRoomReadyForNextPhase", () => {
    it("should check if room is ready for discussion phase", () => {
      expect(
        isRoomReadyForNextPhase(
          mockRoom,
          toConvexPlayers(mockPlayers),
          "discussion",
        ),
      ).toBe(true);
    });

    it("should check if room is ready for voting phase", () => {
      expect(
        isRoomReadyForNextPhase(
          mockRoom,
          toConvexPlayers(mockPlayers),
          "voting",
        ),
      ).toBe(false);
    });

    it("should return false for unknown phase", () => {
      expect(
        isRoomReadyForNextPhase(
          mockRoom,
          toConvexPlayers(mockPlayers),
          "unknown" as never,
        ),
      ).toBe(false);
    });
  });

  describe("getTurnOrderInfo", () => {
    it("should return turn order information", () => {
      const info = getTurnOrderInfo(mockRoom);
      expect(info.currentIndex).toBe(0);
      expect(info.totalPlayers).toBe(3);
      expect(info.isLastTurn).toBe(false);
      expect(info.turnText).toBe("Tour 1/3");
    });

    it("should identify last turn", () => {
      const lastTurnRoom = { ...mockRoom, currentPlayerIndex: 2 };
      const info = getTurnOrderInfo(lastTurnRoom);
      expect(info.isLastTurn).toBe(true);
    });
  });

  describe("needsStateValidation", () => {
    it("should identify rooms needing validation", () => {
      const invalidRoom = {
        ...mockRoom,
        gameState: "discussion" as const,
        playerOrder: undefined,
      };
      expect(needsStateValidation(invalidRoom)).toBe(true);
    });

    it("should not flag valid rooms", () => {
      expect(needsStateValidation(mockRoom)).toBe(false);
    });
  });

  describe("getRoomStatistics", () => {
    it("should return room statistics", () => {
      const stats = getRoomStatistics(mockRoom, toConvexPlayers(mockPlayers));
      expect(stats.totalPlayers).toBe(3);
      expect(stats.alivePlayers).toBe(2);
      expect(stats.deadPlayers).toBe(1);
      expect(stats.gameProgress).toBe(20);
      expect(stats.currentPhase).toBe("En attente des joueurs");
    });
  });
});
