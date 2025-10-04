/**
 * Tests for lobby-related UI helper functions
 */

import { describe, expect, test } from "bun:test";
import {
  formatRoomCodeInput,
  getFormValidationState,
  getLoadingStateText,
  validatePlayerNameInput,
  validateRoomCodeInput,
} from "./ui-helpers.service";

describe("Lobby UI Helper Functions", () => {
  describe("validatePlayerNameInput", () => {
    test("should validate correct player name", () => {
      const result = validatePlayerNameInput("Alice");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test("should reject empty name", () => {
      const result = validatePlayerNameInput("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Le nom est requis");
    });

    test("should reject whitespace-only name", () => {
      const result = validatePlayerNameInput("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Le nom est requis");
    });

    test("should reject name that is too short", () => {
      const result = validatePlayerNameInput("A");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Le nom doit contenir au moins 2 caractères");
    });

    test("should reject name that is too long", () => {
      const result = validatePlayerNameInput("A".repeat(21));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Le nom ne peut pas dépasser 20 caractères");
    });

    test("should accept name at minimum length", () => {
      const result = validatePlayerNameInput("AB");
      expect(result.isValid).toBe(true);
    });

    test("should accept name at maximum length", () => {
      const result = validatePlayerNameInput("A".repeat(20));
      expect(result.isValid).toBe(true);
    });

    test("should trim whitespace", () => {
      const result = validatePlayerNameInput("  Alice  ");
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateRoomCodeInput", () => {
    test("should validate correct room code", () => {
      const result = validateRoomCodeInput("ABC123");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test("should reject empty room code", () => {
      const result = validateRoomCodeInput("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Le code de la salle est requis");
    });

    test("should reject room code that is too short", () => {
      const result = validateRoomCodeInput("ABC12");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Le code de la salle doit contenir 6 caractères",
      );
    });

    test("should reject room code that is too long", () => {
      const result = validateRoomCodeInput("ABC1234");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Le code de la salle doit contenir 6 caractères",
      );
    });

    test("should reject room code with invalid characters", () => {
      const result = validateRoomCodeInput("ABC-12");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Le code de la salle ne peut contenir que des lettres et des chiffres",
      );
    });

    test("should accept room code with numbers only", () => {
      const result = validateRoomCodeInput("123456");
      expect(result.isValid).toBe(true);
    });

    test("should accept room code with letters only", () => {
      const result = validateRoomCodeInput("ABCDEF");
      expect(result.isValid).toBe(true);
    });

    test("should convert to uppercase", () => {
      const result = validateRoomCodeInput("abc123");
      expect(result.isValid).toBe(true);
    });

    test("should trim whitespace", () => {
      const result = validateRoomCodeInput("  ABC123  ");
      expect(result.isValid).toBe(true);
    });
  });

  describe("formatRoomCodeInput", () => {
    test("should convert to uppercase", () => {
      const result = formatRoomCodeInput("abc123");
      expect(result).toBe("ABC123");
    });

    test("should limit to 6 characters", () => {
      const result = formatRoomCodeInput("ABCDEFGHIJ");
      expect(result).toBe("ABCDEF");
    });

    test("should handle empty input", () => {
      const result = formatRoomCodeInput("");
      expect(result).toBe("");
    });

    test("should handle mixed case", () => {
      const result = formatRoomCodeInput("AbC123");
      expect(result).toBe("ABC123");
    });
  });

  describe("getFormValidationState", () => {
    test("should validate create form with valid name", () => {
      const result = getFormValidationState("Alice");
      expect(result.isCreateFormValid).toBe(true);
      expect(result.isJoinFormValid).toBe(true);
      expect(result.createButtonText).toBe("Créer une Salle");
      expect(result.joinButtonText).toBe("Rejoindre la Salle");
    });

    test("should validate join form with valid name and room code", () => {
      const result = getFormValidationState("Alice", "ABC123");
      expect(result.isCreateFormValid).toBe(true);
      expect(result.isJoinFormValid).toBe(true);
    });

    test("should invalidate forms with invalid name", () => {
      const result = getFormValidationState("A", "ABC123");
      expect(result.isCreateFormValid).toBe(false);
      expect(result.isJoinFormValid).toBe(false);
    });

    test("should invalidate join form with invalid room code", () => {
      const result = getFormValidationState("Alice", "ABC");
      expect(result.isCreateFormValid).toBe(true);
      expect(result.isJoinFormValid).toBe(false);
    });

    test("should handle create form without room code", () => {
      const result = getFormValidationState("Alice");
      expect(result.isCreateFormValid).toBe(true);
      expect(result.isJoinFormValid).toBe(true);
    });
  });

  describe("getLoadingStateText", () => {
    test("should return normal text when not loading", () => {
      const result = getLoadingStateText(false, false);
      expect(result.createButtonText).toBe("Créer une Salle");
      expect(result.joinButtonText).toBe("Rejoindre la Salle");
    });

    test("should return loading text when creating", () => {
      const result = getLoadingStateText(true, false);
      expect(result.createButtonText).toBe("Création...");
      expect(result.joinButtonText).toBe("Rejoindre la Salle");
    });

    test("should return loading text when joining", () => {
      const result = getLoadingStateText(false, true);
      expect(result.createButtonText).toBe("Créer une Salle");
      expect(result.joinButtonText).toBe("Rejoindre...");
    });

    test("should return loading text when both loading", () => {
      const result = getLoadingStateText(true, true);
      expect(result.createButtonText).toBe("Création...");
      expect(result.joinButtonText).toBe("Rejoindre...");
    });
  });
});
