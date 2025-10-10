import { useWinner } from "./utils";

const winnerMap = {
  civilians: {
    title: "Les civils gagnent !",
    color: "text-blue-600",
    message: "Les civils ont éliminé tous les Undercovers et Mr. White !",
  },
  undercovers: {
    title: "Les undercovers gagnent !",
    color: "text-red-600",
    message: "Les Undercovers ont survécu et surpassé les civils !",
  },
  mr_white: {
    title: "Mr. White gagne !",
    color: "text-gray-600",
    message: "Mr. White a survécu jusqu'à la fin !",
  },
  undercovers_mr_white: {
    title: "Les undercovers & Mr. White gagnent !",
    color: "text-purple-600",
    message: "Les Undercovers et Mr. White ont éliminé tous les civils !",
  },
  nobody: {
    title: "Personne gagne !",
    color: "text-gray-600",
    message: "Le jeu s'est terminé sans vainqueur clair. Veuillez recommencer.",
  },
} as const;

export default function WinnerMessage() {
  const winner = useWinner();
  const { title, color, message } = winnerMap[winner];

  return (
    <>
      <div className={`text-4xl font-bold ${color}`}>{title}</div>
      <p className="text-lg text-gray-700">{message}</p>
    </>
  );
}
