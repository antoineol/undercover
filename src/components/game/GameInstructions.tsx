import { getGameInstructionsText } from "@/domains/ui/ui-helpers.service";
import type { RoomWithPlayers } from "@/lib/convex-types";
import AnimateHeight from "react-animate-height";
import Card from "../ui/Card";

interface GameInstructionsProps {
  room: RoomWithPlayers;
}

export default function GameInstructions({ room }: GameInstructionsProps) {
  return (
    <AnimateHeight
      height={room.gameState === "waiting" ? "auto" : 0}
      duration={300}
      easing="ease-in-out"
      animateOpacity
    >
      <Card className="mt-6 bg-blue-50">
        <h3 className="mb-2 text-lg font-semibold">Comment Jouer</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          {getGameInstructionsText().map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </Card>
    </AnimateHeight>
  );
}
