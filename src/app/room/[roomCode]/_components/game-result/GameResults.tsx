import { useRoomSafe } from "~/app/room/[roomCode]/_utils/utils";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import Card from "../../../../../components/ui/Card";
import PlayerCard from "./PlayerCard";
import RestartGameButton from "./RestartGameButton";
import WinnerMessage from "./WinnerMessage";

export default function GameResults() {
  const room = useRoomSafe();
  const alivePlayers = room.players.filter((p) => p.isAlive);
  const shouldShow = room.gameState === "results";

  return (
    <AnimateHeightSimple open={!!shouldShow}>
      <Card className="mt-6 flex flex-col gap-6">
        <h2 className="text-center text-2xl font-bold">🎉 Jeu Terminé !</h2>

        <div className="flex flex-col gap-4 text-center">
          <WinnerMessage />

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold">Joueurs Survivants</h3>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {alivePlayers.map((player) => (
                <PlayerCard key={player._id} player={player} />
              ))}
            </div>
          </div>
        </div>

        <RestartGameButton />
      </Card>
    </AnimateHeightSimple>
  );
}
