/**
 * UI Domain - Display Entity
 * Represents UI display information and formatting
 */

export interface Player {
  _id: string;
  name: string;
  role: "undercover" | "civilian" | "mr_white";
  isAlive: boolean;
}

export interface GameResult {
  winner: string;
  winnerColor: string;
  winnerMessage: string;
}
