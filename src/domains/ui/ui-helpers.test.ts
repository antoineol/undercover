import { describe, expect, it } from "bun:test";
import {
  getRoleDisplayName,
  getRoleBadgeColor,
  formatWinnerText,
  calculateSharingProgress,
  calculateVotingProgress,
  generateShareButtonText,
  getGameStateDisplayText,
  getRoundDisplayText,
  isGameWaiting,
  isGameDiscussion,
  isGameVoting,
  isGameResults,
  isGameMrWhiteGuessing,
  getPlayerCountDisplay,
  isRoomFull,
  hasMinimumPlayers,
  getValidationErrorMessage,
  formatTimeRemaining,
  isCurrentTurnPlayer,
  getTurnOrderDisplay,
} from "./ui-helpers.service";

describe("UI Helper Functions", () => {
  describe("getRoleDisplayName", () => {
    it("should return correct display name for undercover", () => {
      expect(getRoleDisplayName("undercover")).toBe("Undercover");
    });

    it("should return correct display name for mr_white", () => {
      expect(getRoleDisplayName("mr_white")).toBe("Mr. White");
    });

    it("should return correct display name for civilian", () => {
      expect(getRoleDisplayName("civilian")).toBe("Civil");
    });

    it("should return role as-is for unknown role", () => {
      expect(getRoleDisplayName("unknown")).toBe("unknown");
    });
  });

  describe("getRoleBadgeColor", () => {
    it("should return correct color for undercover", () => {
      expect(getRoleBadgeColor("undercover")).toBe("bg-red-100 text-red-800");
    });

    it("should return correct color for mr_white", () => {
      expect(getRoleBadgeColor("mr_white")).toBe("bg-gray-100 text-gray-800");
    });

    it("should return correct color for civilian", () => {
      expect(getRoleBadgeColor("civilian")).toBe("bg-blue-100 text-blue-800");
    });

    it("should return default color for unknown role", () => {
      expect(getRoleBadgeColor("unknown")).toBe("bg-gray-100 text-gray-800");
    });
  });

  describe("formatWinnerText", () => {
    it('should return "gagne" for singular winners', () => {
      expect(formatWinnerText("Mr. White")).toBe("gagne");
      expect(formatWinnerText("Personne")).toBe("gagne");
    });

    it('should return "gagnent" for plural winners', () => {
      expect(formatWinnerText("Les civils")).toBe("gagnent");
      expect(formatWinnerText("Les undercovers")).toBe("gagnent");
    });
  });

  describe("calculateSharingProgress", () => {
    it("should calculate progress correctly", () => {
      expect(calculateSharingProgress(3, 5)).toBe(60);
      expect(calculateSharingProgress(0, 5)).toBe(0);
      expect(calculateSharingProgress(5, 5)).toBe(100);
    });

    it("should handle zero total players", () => {
      expect(calculateSharingProgress(0, 0)).toBe(0);
      expect(calculateSharingProgress(3, 0)).toBe(0);
    });
  });

  describe("calculateVotingProgress", () => {
    it("should calculate progress correctly", () => {
      expect(calculateVotingProgress(2, 4)).toBe(50);
      expect(calculateVotingProgress(0, 4)).toBe(0);
      expect(calculateVotingProgress(4, 4)).toBe(100);
    });

    it("should handle zero total players", () => {
      expect(calculateVotingProgress(0, 0)).toBe(0);
      expect(calculateVotingProgress(2, 0)).toBe(0);
    });
  });

  describe("generateShareButtonText", () => {
    it("should return success text when isSuccess is true", () => {
      expect(generateShareButtonText(true, false)).toBe("✅ Lien copié !");
    });

    it("should return error text when isError is true", () => {
      expect(generateShareButtonText(false, true)).toBe("❌ Erreur de copie");
    });

    it("should return base text when neither success nor error", () => {
      expect(generateShareButtonText(false, false)).toBe("📋 Partager le Lien");
    });

    it("should use custom base text", () => {
      expect(generateShareButtonText(false, false, "Custom Text")).toBe(
        "Custom Text",
      );
    });
  });

  describe("getGameStateDisplayText", () => {
    it("should return correct display text for known states", () => {
      expect(getGameStateDisplayText("waiting")).toBe("En attente des joueurs");
      expect(getGameStateDisplayText("discussion")).toBe("Phase de discussion");
      expect(getGameStateDisplayText("voting")).toBe("Phase de vote");
      expect(getGameStateDisplayText("results")).toBe("Résultats du jeu");
    });

    it("should return state as-is for unknown states", () => {
      expect(getGameStateDisplayText("unknown")).toBe("unknown");
    });
  });

  describe("getRoundDisplayText", () => {
    it("should format round display correctly", () => {
      expect(getRoundDisplayText(1, 5)).toBe("Round 1/5");
      expect(getRoundDisplayText(3, 10)).toBe("Round 3/10");
    });
  });

  describe("Game state checks", () => {
    it("should correctly identify game states", () => {
      expect(isGameWaiting("waiting")).toBe(true);
      expect(isGameWaiting("discussion")).toBe(false);

      expect(isGameDiscussion("discussion")).toBe(true);
      expect(isGameDiscussion("waiting")).toBe(false);

      expect(isGameVoting("voting")).toBe(true);
      expect(isGameVoting("discussion")).toBe(false);

      expect(isGameResults("results")).toBe(true);
      expect(isGameResults("voting")).toBe(false);

      expect(isGameMrWhiteGuessing("mr_white_guessing")).toBe(true);
      expect(isGameMrWhiteGuessing("voting")).toBe(false);
    });
  });

  describe("getPlayerCountDisplay", () => {
    it("should format player count correctly", () => {
      expect(getPlayerCountDisplay(3, 10)).toBe("3/10 joueurs");
      expect(getPlayerCountDisplay(0, 10)).toBe("0/10 joueurs");
    });
  });

  describe("Room capacity checks", () => {
    it("should correctly identify room capacity", () => {
      expect(isRoomFull(5, 5)).toBe(true);
      expect(isRoomFull(4, 5)).toBe(false);
      expect(isRoomFull(6, 5)).toBe(true);

      expect(hasMinimumPlayers(3, 3)).toBe(true);
      expect(hasMinimumPlayers(2, 3)).toBe(false);
      expect(hasMinimumPlayers(5, 3)).toBe(true);
    });
  });

  describe("getValidationErrorMessage", () => {
    it("should map technical errors to user-friendly messages", () => {
      expect(getValidationErrorMessage("Player not found or not alive")).toBe(
        "Joueur introuvable ou éliminé",
      );
      expect(getValidationErrorMessage("Game is not in discussion phase")).toBe(
        "Le jeu n'est pas en phase de discussion",
      );
      expect(getValidationErrorMessage("Unknown error")).toBe("Unknown error");
    });
  });

  describe("formatTimeRemaining", () => {
    it("should format time correctly", () => {
      expect(formatTimeRemaining(0)).toBe("Temps écoulé");
      expect(formatTimeRemaining(30)).toBe("30s");
      expect(formatTimeRemaining(90)).toBe("1m 30s");
      expect(formatTimeRemaining(120)).toBe("2m 0s");
    });
  });

  describe("isCurrentTurnPlayer", () => {
    it("should correctly identify current turn player", () => {
      expect(isCurrentTurnPlayer("player1", "player1")).toBe(true);
      expect(isCurrentTurnPlayer("player1", "player2")).toBe(false);
      expect(isCurrentTurnPlayer("player1", undefined)).toBe(false);
    });
  });

  describe("getTurnOrderDisplay", () => {
    it("should format turn order correctly", () => {
      expect(getTurnOrderDisplay(0, 5)).toBe("Tour 1/5");
      expect(getTurnOrderDisplay(2, 5)).toBe("Tour 3/5");
    });
  });
});
