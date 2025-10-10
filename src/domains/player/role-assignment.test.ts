import { describe, expect, test } from "bun:test";
import type { Id } from "cvx/dataModel";
import type { Player } from "../../lib/types";
import {
  assignRoles,
  createPlayerOrder,
  ensureMrWhiteNotFirst,
  findNextAlivePlayer,
  shuffleArray,
} from "./role-assignment.service";

describe("Role Assignment Functions", () => {
  // Helper function to convert test players to the format expected by role assignment functions
  const toPlayerWithId = (players: Player[]) =>
    players.map((p) => ({ _id: p._id, role: p.role }));

  const mockPlayers: Player[] = [
    {
      _id: "player1" as Id<"players">,
      name: "Alice",
      role: "civilian",
      isAlive: true,
      votes: [],
      roomId: "room1" as Id<"rooms">,
      isHost: false,
      createdAt: Date.now(),
    },
    {
      _id: "player2" as Id<"players">,
      name: "Bob",
      role: "civilian",
      isAlive: true,
      votes: [],
      roomId: "room1" as Id<"rooms">,
      isHost: false,
      createdAt: Date.now(),
    },
    {
      _id: "player3" as Id<"players">,
      name: "Charlie",
      role: "civilian",
      isAlive: true,
      votes: [],
      roomId: "room1" as Id<"rooms">,
      isHost: false,
      createdAt: Date.now(),
    },
    {
      _id: "player4" as Id<"players">,
      name: "David",
      role: "civilian",
      isAlive: true,
      votes: [],
      roomId: "room1" as Id<"rooms">,
      isHost: false,
      createdAt: Date.now(),
    },
  ];

  describe("assignRoles", () => {
    test("should assign roles correctly with undercovers and mr white", () => {
      const assignments = assignRoles(toPlayerWithId(mockPlayers), 2, 1);

      expect(assignments).toHaveLength(4);

      const undercoverCount = assignments.filter(
        (a) => a.role === "undercover",
      ).length;
      const mrWhiteCount = assignments.filter(
        (a) => a.role === "mr_white",
      ).length;
      const civilianCount = assignments.filter(
        (a) => a.role === "civilian",
      ).length;

      expect(undercoverCount).toBe(2);
      expect(mrWhiteCount).toBe(1);
      expect(civilianCount).toBe(1);
    });

    test("should assign roles correctly without mr white", () => {
      const assignments = assignRoles(toPlayerWithId(mockPlayers), 1, 0);

      expect(assignments).toHaveLength(4);

      const undercoverCount = assignments.filter(
        (a) => a.role === "undercover",
      ).length;
      const mrWhiteCount = assignments.filter(
        (a) => a.role === "mr_white",
      ).length;
      const civilianCount = assignments.filter(
        (a) => a.role === "civilian",
      ).length;

      expect(undercoverCount).toBe(1);
      expect(mrWhiteCount).toBe(0);
      expect(civilianCount).toBe(3);
    });

    test("should handle empty player list", () => {
      const assignments = assignRoles(toPlayerWithId([]), 1, 0);
      expect(assignments).toHaveLength(0);
    });
  });

  describe("createPlayerOrder", () => {
    test("should create player order from players", () => {
      const playerOrder = createPlayerOrder(toPlayerWithId(mockPlayers));
      expect(playerOrder).toHaveLength(4);
      expect(playerOrder).toContain("player1" as Id<"players">);
      expect(playerOrder).toContain("player2" as Id<"players">);
      expect(playerOrder).toContain("player3" as Id<"players">);
      expect(playerOrder).toContain("player4" as Id<"players">);
    });

    test("should handle empty player list", () => {
      const playerOrder = createPlayerOrder(toPlayerWithId([]));
      expect(playerOrder).toHaveLength(0);
    });
  });

  describe("findNextAlivePlayer", () => {
    const playerOrder = [
      "player1",
      "player2",
      "player3",
      "player4",
    ] as Id<"players">[];

    test("should find next alive player", () => {
      const alivePlayerIds = [
        "player1",
        "player2",
        "player4",
      ] as Id<"players">[];
      const nextIndex = findNextAlivePlayer(playerOrder, 0, alivePlayerIds);
      expect(nextIndex).toBe(1); // player2
    });

    test("should wrap around to beginning", () => {
      const alivePlayerIds = ["player1", "player4"] as Id<"players">[];
      const nextIndex = findNextAlivePlayer(playerOrder, 2, alivePlayerIds);
      expect(nextIndex).toBe(3); // player4
    });

    test("should return -1 when no alive players", () => {
      const alivePlayerIds: Id<"players">[] = [];
      const nextIndex = findNextAlivePlayer(playerOrder, 0, alivePlayerIds);
      expect(nextIndex).toBe(-1);
    });

    test("should return -1 when only current player is alive", () => {
      const alivePlayerIds = ["player2"] as Id<"players">[];
      const nextIndex = findNextAlivePlayer(playerOrder, 1, alivePlayerIds);
      expect(nextIndex).toBe(-1);
    });
  });

  describe("shuffleArray", () => {
    test("should return array of same length", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      expect(shuffled).toHaveLength(5);
    });

    test("should not modify original array", () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);
      expect(original).toEqual(originalCopy);
    });

    test("should contain all original elements", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    test("should handle empty array", () => {
      const shuffled = shuffleArray([]);
      expect(shuffled).toEqual([]);
    });

    test("should handle single element", () => {
      const shuffled = shuffleArray([42]);
      expect(shuffled).toEqual([42]);
    });
  });

  describe("ensureMrWhiteNotFirst", () => {
    test("should move mr white from first position", () => {
      const playersWithMrWhiteFirst: Player[] = [
        {
          _id: "player1" as Id<"players">,
          name: "Alice",
          role: "mr_white",
          isAlive: true,
          votes: [],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
        {
          _id: "player2" as Id<"players">,
          name: "Bob",
          role: "civilian",
          isAlive: true,
          votes: [],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
        {
          _id: "player3" as Id<"players">,
          name: "Charlie",
          role: "civilian",
          isAlive: true,
          votes: [],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
        {
          _id: "player4" as Id<"players">,
          name: "David",
          role: "civilian",
          isAlive: true,
          votes: [],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
      ];

      const reordered = ensureMrWhiteNotFirst(
        toPlayerWithId(playersWithMrWhiteFirst),
      );
      expect(reordered[0]?.role).not.toBe("mr_white");
      expect(reordered.some((p) => p.role === "mr_white")).toBe(true);
    });

    test("should not change order when mr white is not first", () => {
      const playersWithMrWhiteNotFirst: Player[] = [
        {
          _id: "player1" as Id<"players">,
          name: "Alice",
          role: "civilian",
          isAlive: true,
          votes: [],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
        {
          _id: "player2" as Id<"players">,
          name: "Bob",
          role: "mr_white",
          isAlive: true,
          votes: [],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
        {
          _id: "player3" as Id<"players">,
          name: "Charlie",
          role: "civilian",
          isAlive: true,
          votes: [],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
        {
          _id: "player4" as Id<"players">,
          name: "David",
          role: "civilian",
          isAlive: true,
          votes: [],
          roomId: "room1" as Id<"rooms">,
          isHost: false,
          createdAt: Date.now(),
        },
      ];

      const reordered = ensureMrWhiteNotFirst(
        toPlayerWithId(playersWithMrWhiteNotFirst),
      );
      expect(reordered[0]?.role).toBe("civilian");
      expect(reordered[1]?.role).toBe("mr_white");
    });

    test("should handle players without mr white", () => {
      const reordered = ensureMrWhiteNotFirst(toPlayerWithId(mockPlayers));
      expect(reordered).toHaveLength(4);
      expect(reordered.every((p) => p.role === "civilian")).toBe(true);
    });
  });
});
