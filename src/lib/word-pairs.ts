export const WORD_PAIRS = [
  { civilian: "Médecin", undercover: "Infirmière" },
  { civilian: "Pizza", undercover: "Burger" },
  { civilian: "Été", undercover: "Hiver" },
  { civilian: "Café", undercover: "Thé" },
  { civilian: "Chien", undercover: "Chat" },
  { civilian: "Plage", undercover: "Montagne" },
  { civilian: "Livre", undercover: "Film" },
  { civilian: "Voiture", undercover: "Vélo" },
  { civilian: "Pomme", undercover: "Orange" },
  { civilian: "Soleil", undercover: "Lune" },
  { civilian: "École", undercover: "Université" },
  { civilian: "Restaurant", undercover: "Café" },
  { civilian: "Musique", undercover: "Danse" },
  { civilian: "Sport", undercover: "Jeu" },
  { civilian: "Voyage", undercover: "Vacances" },
  { civilian: "Montagne", undercover: "Colline" },
  { civilian: "Océan", undercover: "Lac" },
  { civilian: "Ville", undercover: "Campagne" },
  { civilian: "Nuit", undercover: "Jour" },
  { civilian: "Chaud", undercover: "Froid" },
] as const;

/**
 * Get a random word pair
 */
export function getRandomWordPair() {
  return WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
}
