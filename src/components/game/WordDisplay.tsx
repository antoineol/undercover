import { getWordDisplayText } from "@/domains/ui/ui-helpers.service";
import type { RoomWithPlayers } from "@/lib/convex-types";
import { useUIStore } from "@/lib/stores/ui-store";
import type { GameWords, Player } from "@/lib/types";
import AnimateHeight from "react-animate-height";
import Button from "../ui/Button";

interface WordDisplayProps {
  room: RoomWithPlayers;
  currentPlayer: Player | null;
  gameWords: GameWords | null;
}

export default function WordDisplay({
  room,
  currentPlayer,
  gameWords,
}: WordDisplayProps) {
  const { showWords, setShowWords } = useUIStore();

  if (room.gameState === "waiting" || !currentPlayer || !gameWords) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col">
      <div className="flex items-center justify-between">
        <Button onClick={() => setShowWords(!showWords)} variant="primary">
          {showWords ? "Masquer" : "Afficher"} le Mot
        </Button>
      </div>

      <AnimateHeight
        height={showWords ? "auto" : 0}
        duration={300}
        easing="ease-in-out"
        animateOpacity
      >
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <div>
            <span className="text-lg font-bold text-blue-600">
              {getWordDisplayText(currentPlayer.role, {
                civilianWord: gameWords.civilianWord,
                undercoverWord: gameWords.undercoverWord,
              })}
            </span>
          </div>
        </div>
      </AnimateHeight>
    </div>
  );
}
