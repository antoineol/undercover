/**
 * Tests for extended UI helper functions
 */

import { describe, expect, test } from "bun:test";
import {
  generateShareButtonTextWithTimeout,
  getConfigurationDisplayText,
  getGameInstructionsText,
  getGameStateMessage,
  getMrWhiteGuessingText,
  getStartGameButtonText,
  getValidationResultMessage,
  getWordDisplayText,
} from "./ui-helpers.service";

describe("Extended UI Helper Functions", () => {
  describe("generateShareButtonTextWithTimeout", () => {
    test("should return success text when isSuccess is true", () => {
      const text = generateShareButtonTextWithTimeout(true, false);
      expect(text).toBe("✅ Lien copié !");
    });

    test("should return error text when isError is true", () => {
      const text = generateShareButtonTextWithTimeout(false, true);
      expect(text).toBe("❌ Erreur de copie");
    });

    test("should return base text when neither success nor error", () => {
      const text = generateShareButtonTextWithTimeout(false, false);
      expect(text).toBe("📋 Partager le Lien");
    });

    test("should use custom base text", () => {
      const text = generateShareButtonTextWithTimeout(
        false,
        false,
        "Custom Text",
      );
      expect(text).toBe("Custom Text");
    });
  });

  describe("getGameStateMessage", () => {
    test("should return correct message for waiting state", () => {
      const message = getGameStateMessage("waiting");
      expect(message).toBe("En attente des joueurs");
    });

    test("should return correct message for discussion state", () => {
      const message = getGameStateMessage("discussion");
      expect(message).toBe("Phase de discussion");
    });

    test("should return correct message for voting state", () => {
      const message = getGameStateMessage("voting");
      expect(message).toBe("Phase de vote");
    });

    test("should return correct message for Mr. White guessing state", () => {
      const message = getGameStateMessage("mr_white_guessing");
      expect(message).toBe("Mr. White devine");
    });

    test("should return correct message for results state", () => {
      const message = getGameStateMessage("results");
      expect(message).toBe("Résultats du jeu");
    });

    test("should return empty string for unknown state", () => {
      const message = getGameStateMessage("unknown");
      expect(message).toBe("");
    });
  });

  describe("getStartGameButtonText", () => {
    test("should return button text with player count", () => {
      const text = getStartGameButtonText(5);
      expect(text).toBe("Commencer le Jeu (5/3+)");
    });

    test("should use custom min players", () => {
      const text = getStartGameButtonText(4, 4);
      expect(text).toBe("Commencer le Jeu (4/4+)");
    });
  });

  describe("getConfigurationDisplayText", () => {
    test("should display configuration with Mr. White", () => {
      const config = {
        numUndercovers: 2,
        numMrWhites: 1,
        totalPlayers: 6,
      };

      const text = getConfigurationDisplayText(config);
      expect(text).toContain("2 Undercovers");
      expect(text).toContain("1 Mr. White");
      expect(text).toContain("3 Civils");
    });

    test("should display configuration without Mr. White", () => {
      const config = {
        numUndercovers: 1,
        numMrWhites: 0,
        totalPlayers: 4,
      };

      const text = getConfigurationDisplayText(config);
      expect(text).toContain("1 Undercover");
      expect(text).toContain("Pas de Mr. White");
      expect(text).toContain("3 Civils");
    });

    test("should handle singular forms correctly", () => {
      const config = {
        numUndercovers: 1,
        numMrWhites: 0,
        totalPlayers: 3,
      };

      const text = getConfigurationDisplayText(config);
      expect(text).toContain("1 Undercover");
      expect(text).toContain("2 Civils");
    });
  });

  describe("getWordDisplayText", () => {
    const mockGameWords = {
      civilianWord: "Civilian Word",
      undercoverWord: "Undercover Word",
    };

    test("should return undercover word for undercover role", () => {
      const text = getWordDisplayText("undercover", mockGameWords);
      expect(text).toBe("Undercover Word");
    });

    test("should return Mr. White message for mr_white role", () => {
      const text = getWordDisplayText("mr_white", mockGameWords);
      expect(text).toBe("Vous êtes Mr. White.");
    });

    test("should return civilian word for civilian role", () => {
      const text = getWordDisplayText("civilian", mockGameWords);
      expect(text).toBe("Civilian Word");
    });

    test("should return civilian word for unknown role", () => {
      const text = getWordDisplayText("unknown", mockGameWords);
      expect(text).toBe("Civilian Word");
    });

    test("should return empty string when no game words", () => {
      const text = getWordDisplayText("civilian", null);
      expect(text).toBe("");
    });
  });

  describe("getValidationResultMessage", () => {
    test("should return correct message for skipped dead player", () => {
      const message = getValidationResultMessage("skipped_dead_player");
      expect(message).toBe("Joueur mort ignoré - passage au joueur suivant");
    });

    test("should return correct message for no action needed", () => {
      const message = getValidationResultMessage("no_action_needed");
      expect(message).toBe("Game state is valid - no action needed");
    });

    test("should return generic message for unknown action", () => {
      const message = getValidationResultMessage("unknown_action");
      expect(message).toBe("Game state fixed: unknown_action");
    });
  });

  describe("getGameInstructionsText", () => {
    test("should return array of instruction strings", () => {
      const instructions = getGameInstructionsText();
      expect(Array.isArray(instructions)).toBe(true);
      expect(instructions.length).toBeGreaterThan(0);
    });

    test("should contain key instruction elements", () => {
      const instructions = getGameInstructionsText();
      const instructionText = instructions.join(" ");

      expect(instructionText).toContain("3-10 joueurs");
      expect(instructionText).toContain("Civils");
      expect(instructionText).toContain("Undercovers");
      expect(instructionText).toContain("Mr. White");
    });
  });

  describe("getMrWhiteGuessingText", () => {
    test("should return correct text structure", () => {
      const text = getMrWhiteGuessingText();

      expect(text).toHaveProperty("title");
      expect(text).toHaveProperty("description");
      expect(text).toHaveProperty("placeholder");
      expect(text).toHaveProperty("buttonText");
    });

    test("should return correct title", () => {
      const text = getMrWhiteGuessingText();
      expect(text.title).toBe("Mr. White a été éliminé !");
    });

    test("should return correct description", () => {
      const text = getMrWhiteGuessingText();
      expect(text.description).toBe(
        "Mr. White a une dernière chance de deviner le mot des Civils.",
      );
    });

    test("should return correct placeholder", () => {
      const text = getMrWhiteGuessingText();
      expect(text.placeholder).toBe("Devinez le mot des Civils...");
    });

    test("should return correct button text", () => {
      const text = getMrWhiteGuessingText();
      expect(text.buttonText).toBe("Deviner le Mot");
    });
  });
});
