import { describe, expect, test } from "bun:test";
import { type Id } from "../../../convex/_generated/dataModel";
import { domainPlayerToConvex, type Player } from "../player/player";
import {
  allPlayersCompletedAction,
  calculatePlayerCounts,
  checkWinConditions,
  countVotes,
  determineWinner,
  findEliminatedPlayer,
  getRoleDisplay,
  getVoterNames,
  type PlayerCounts,
  type VoteCounts,
} from "./game-logic.service";

describe("Game Logic Functions", () => {
  const mockPlayers: Player[] = [
    {
      _id: "player1",
      name: "Alice",
      role: "civilian",
      isAlive: true,
      hasSharedWord: false,
      votes: [],
      roomId: "room1",
    },
    {
      _id: "player2",
      name: "Bob",
      role: "undercover",
      isAlive: true,
      hasSharedWord: false,
      votes: [],
      roomId: "room1",
    },
    {
      _id: "player3",
      name: "Charlie",
      role: "mr_white",
      isAlive: true,
      hasSharedWord: false,
      votes: [],
      roomId: "room1",
    },
    {
      _id: "player4",
      name: "David",
      role: "civilian",
      isAlive: false,
      hasSharedWord: false,
      votes: [],
      roomId: "room1",
    },
  ];

  describe("calculatePlayerCounts", () => {
    test("should count alive players correctly", () => {
      const convexPlayers = mockPlayers.map(domainPlayerToConvex);
      const counts = calculatePlayerCounts(convexPlayers);
      expect(counts.alive).toBe(3);
      expect(counts.undercovers).toBe(1);
      expect(counts.civilians).toBe(1);
      expect(counts.mrWhite).toBe(1);
    });

    test("should handle empty player list", () => {
      const counts = calculatePlayerCounts([]);
      expect(counts.alive).toBe(0);
      expect(counts.undercovers).toBe(0);
      expect(counts.civilians).toBe(0);
      expect(counts.mrWhite).toBe(0);
    });
  });

  describe("checkWinConditions", () => {
    test("should return civilians_win when no undercovers and no mr white", () => {
      const counts: PlayerCounts = {
        alive: 2,
        undercovers: 0,
        civilians: 2,
        mrWhite: 0,
      };
      expect(checkWinConditions(counts)).toBe("civilians_win");
    });

    test("should return undercovers_win when civilians <= 1 and undercovers > 0", () => {
      const counts: PlayerCounts = {
        alive: 2,
        undercovers: 1,
        civilians: 1,
        mrWhite: 0,
      };
      expect(checkWinConditions(counts)).toBe("undercovers_win");
    });

    test("should return mr_white_win when civilians <= 1 and mr white > 0", () => {
      const counts: PlayerCounts = {
        alive: 2,
        undercovers: 0,
        civilians: 1,
        mrWhite: 1,
      };
      expect(checkWinConditions(counts)).toBe("mr_white_win");
    });

    test("should return undercovers_mrwhite_win when no civilians and both special roles alive", () => {
      const counts: PlayerCounts = {
        alive: 2,
        undercovers: 1,
        civilians: 0,
        mrWhite: 1,
      };
      expect(checkWinConditions(counts)).toBe("undercovers_mrwhite_win");
    });

    test("should return null when no win condition met", () => {
      const counts: PlayerCounts = {
        alive: 4,
        undercovers: 1,
        civilians: 2,
        mrWhite: 1,
      };
      expect(checkWinConditions(counts)).toBeNull();
    });
  });

  describe("countVotes", () => {
    test("should count votes correctly", () => {
      const playersWithVotes: Player[] = [
        {
          _id: "player1",
          name: "Alice",
          role: "civilian",
          isAlive: true,
          hasSharedWord: false,
          votes: ["player2", "player3"],
          roomId: "room1",
        },
        {
          _id: "player2",
          name: "Bob",
          role: "undercover",
          isAlive: true,
          hasSharedWord: false,
          votes: ["player2"],
          roomId: "room1",
        },
        {
          _id: "player3",
          name: "Charlie",
          role: "civilian",
          isAlive: true,
          hasSharedWord: false,
          votes: ["player1"],
          roomId: "room1",
        },
      ];

      const convexPlayers = playersWithVotes.map(domainPlayerToConvex);
      const voteCounts = countVotes(convexPlayers);
      expect(voteCounts.player1).toBe(1);
      expect(voteCounts.player2).toBe(2);
      expect(voteCounts.player3).toBe(1);
    });

    test("should handle players with no votes", () => {
      const convexPlayers = mockPlayers.map(domainPlayerToConvex);
      const voteCounts = countVotes(convexPlayers);
      expect(Object.keys(voteCounts)).toHaveLength(0);
    });
  });

  describe("findEliminatedPlayer", () => {
    test("should find player with most votes", () => {
      const voteCounts: VoteCounts = { player1: 2, player2: 1, player3: 3 };
      const result = findEliminatedPlayer(voteCounts);
      expect(result.eliminatedPlayerId).toBe("player3" as Id<"players">);
      expect(result.maxVotes).toBe(3);
      expect(result.tie).toBe(false);
    });

    test("should detect tie", () => {
      const voteCounts: VoteCounts = { player1: 2, player2: 2 };
      const result = findEliminatedPlayer(voteCounts);
      expect(result.eliminatedPlayerId).toBe("player1" as Id<"players">);
      expect(result.maxVotes).toBe(2);
      expect(result.tie).toBe(true);
    });

    test("should handle empty vote counts", () => {
      const result = findEliminatedPlayer({});
      expect(result.eliminatedPlayerId).toBeNull();
      expect(result.maxVotes).toBe(0);
      expect(result.tie).toBe(false);
    });
  });

  describe("getVoterNames", () => {
    test("should map voter names to voted players", () => {
      const playersWithVotes: Player[] = [
        {
          _id: "player1",
          name: "Alice",
          role: "civilian",
          isAlive: true,
          hasSharedWord: false,
          votes: ["player2"],
          roomId: "room1",
        },
        {
          _id: "player2",
          name: "Bob",
          role: "undercover",
          isAlive: true,
          hasSharedWord: false,
          votes: ["player1"],
          roomId: "room1",
        },
        {
          _id: "player3",
          name: "Charlie",
          role: "civilian",
          isAlive: true,
          hasSharedWord: false,
          votes: ["player1"],
          roomId: "room1",
        },
      ];

      const convexPlayers = playersWithVotes.map(domainPlayerToConvex);
      const voterNames = getVoterNames(convexPlayers);
      expect(voterNames.player1).toEqual(["Bob", "Charlie"]);
      expect(voterNames.player2).toEqual(["Alice"]);
    });
  });

  describe("allPlayersCompletedAction", () => {
    test("should return true when all players shared word", () => {
      const playersWithSharedWords: Player[] = mockPlayers.map((p) => ({
        _id: p._id,
        name: p.name,
        role: p.role,
        isAlive: p.isAlive,
        hasSharedWord: true,
        votes: p.votes,
        roomId: p.roomId,
      }));

      const convexPlayers = playersWithSharedWords.map(domainPlayerToConvex);
      expect(allPlayersCompletedAction(convexPlayers, "sharedWord")).toBe(true);
    });

    test("should return false when not all players shared word", () => {
      const convexPlayers = mockPlayers.map(domainPlayerToConvex);
      expect(allPlayersCompletedAction(convexPlayers, "sharedWord")).toBe(
        false,
      );
    });

    test("should return true when all players voted", () => {
      const playersWithVotes: Player[] = mockPlayers.map((p) => ({
        _id: p._id,
        name: p.name,
        role: p.role,
        isAlive: p.isAlive,
        hasSharedWord: p.hasSharedWord,
        hasVoted: true,
        votes: p.votes,
        roomId: p.roomId,
      }));

      const convexPlayers = playersWithVotes.map(domainPlayerToConvex);
      expect(allPlayersCompletedAction(convexPlayers, "voted")).toBe(true);
    });
  });

  describe("determineWinner", () => {
    test("should return civilians win when no undercovers and no mr white", () => {
      const alivePlayers: Player[] = [
        {
          _id: "player1",
          name: "Alice",
          role: "civilian",
          isAlive: true,
          hasSharedWord: false,
          votes: [],
          roomId: "room1",
        },
        {
          _id: "player4",
          name: "David",
          role: "civilian",
          isAlive: true,
          hasSharedWord: false,
          votes: [],
          roomId: "room1",
        },
      ];

      const convexPlayers = alivePlayers.map(domainPlayerToConvex);
      const result = determineWinner(convexPlayers);
      expect(result.winner).toBe("Les civils");
      expect(result.winnerColor).toBe("text-blue-600");
    });

    test("should return undercovers win when they outnumber civilians", () => {
      const alivePlayers: Player[] = [
        {
          _id: "player2",
          name: "Bob",
          role: "undercover",
          isAlive: true,
          hasSharedWord: false,
          votes: [],
          roomId: "room1",
        },
        {
          _id: "player1",
          name: "Alice",
          role: "civilian",
          isAlive: true,
          hasSharedWord: false,
          votes: [],
          roomId: "room1",
        },
      ];

      const convexPlayers = alivePlayers.map(domainPlayerToConvex);
      const result = determineWinner(convexPlayers);
      expect(result.winner).toBe("Les undercovers");
      expect(result.winnerColor).toBe("text-red-600");
    });
  });

  describe("getRoleDisplay", () => {
    test("should return correct display for undercover", () => {
      const display = getRoleDisplay("undercover");
      expect(display.name).toBe("Undercover");
      expect(display.color).toBe("bg-red-100 text-red-800");
    });

    test("should return correct display for civilian", () => {
      const display = getRoleDisplay("civilian");
      expect(display.name).toBe("Civil");
      expect(display.color).toBe("bg-blue-100 text-blue-800");
    });

    test("should return correct display for mr_white", () => {
      const display = getRoleDisplay("mr_white");
      expect(display.name).toBe("Mr. White");
      expect(display.color).toBe("bg-gray-100 text-gray-800");
    });

    test("should return default display for unknown role", () => {
      const display = getRoleDisplay("unknown");
      expect(display.name).toBe("unknown");
      expect(display.color).toBe("bg-gray-100 text-gray-800");
    });
  });
});
