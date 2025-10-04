import { getMrWhiteGuessingText } from "@/domains/ui/ui-helpers.service";
import { GAME_CONFIG } from "@/lib/constants";
import { type RoomWithPlayers } from "@/lib/convex-types";
import { useUIStore } from "@/lib/stores/ui-store";
import { useMutation } from "convex/react";
import AnimateHeight from "react-animate-height";
import { api } from "../../../convex/_generated/api";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface MrWhiteGuessingProps {
  room: RoomWithPlayers;
}

export default function MrWhiteGuessing({ room }: MrWhiteGuessingProps) {
  const { mrWhiteGuessInput, setMrWhiteGuessInput } = useUIStore();
  const mrWhiteGuess = useMutation(api.game.mrWhiteGuess);

  const handleMrWhiteGuess = async () => {
    if (room && mrWhiteGuessInput.trim()) {
      try {
        await mrWhiteGuess({
          roomId: room._id,
          guess: mrWhiteGuessInput.trim(),
        });
        setMrWhiteGuessInput("");
      } catch (error) {
        console.error("Échec de la devinette:", error);
        alert("Erreur: " + ((error as Error).message || "Erreur inconnue"));
      }
    }
  };

  const mrWhiteText = getMrWhiteGuessingText();

  return (
    <AnimateHeight
      height={room.gameState === "mr_white_guessing" ? "auto" : 0}
      duration={300}
      easing="ease-in-out"
      animateOpacity
    >
      <Card className="mt-6 border-yellow-200 bg-yellow-50">
        <div className="text-center">
          <h3 className="mb-4 text-lg font-semibold text-yellow-800">
            {mrWhiteText.title}
          </h3>
          <p className="mb-4 text-sm text-yellow-700">
            {mrWhiteText.description}
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-3">
            <input
              type="text"
              value={mrWhiteGuessInput}
              onChange={(e) => setMrWhiteGuessInput(e.target.value)}
              placeholder={mrWhiteText.placeholder}
              className="rounded-lg border border-yellow-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              maxLength={GAME_CONFIG.MAX_WORD_LENGTH}
            />
            <Button
              onClick={handleMrWhiteGuess}
              variant="primary"
              disabled={!mrWhiteGuessInput.trim()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {mrWhiteText.buttonText}
            </Button>
          </div>
        </div>
      </Card>
    </AnimateHeight>
  );
}
