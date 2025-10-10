import {
  calculateMaxUndercovers,
  getGameConfigurationDisplay,
} from "@/domains/room/room-management.service";
import type { RoomWithPlayers } from "@/lib/convex-types";
import { useMutation, useQuery } from "convex/react";
import { api } from "cvx/api";
import { useEffect, useState } from "react";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import Card from "../ui/Card";

interface GameConfigurationProps {
  room: RoomWithPlayers;
  showConfig: boolean;
}

export default function GameConfiguration({
  room,
  showConfig,
}: GameConfigurationProps) {
  const [numUndercovers, setNumUndercovers] = useState(1);
  const [numMrWhites, setNumMrWhites] = useState(0);

  const updateGameConfig = useMutation(api.room_config.updateGameConfig);
  const gameConfig = useQuery(api.room_config.getGameConfig, {
    roomId: room._id,
  });

  // Load config from database
  useEffect(() => {
    if (gameConfig) {
      setNumUndercovers(gameConfig.numUndercovers);
      setNumMrWhites(gameConfig.numMrWhites);
    }
  }, [gameConfig]);

  const handleConfigChange = async (
    newUndercovers: number,
    newMrWhites: number,
  ) => {
    setNumUndercovers(newUndercovers);
    setNumMrWhites(newMrWhites);

    try {
      await updateGameConfig({
        roomId: room._id,
        numUndercovers: newUndercovers,
        numMrWhites: newMrWhites,
      });
    } catch (error) {
      console.error("Failed to update game config:", error);
    }
  };

  return (
    <AnimateHeightSimple open={showConfig}>
      <Card className="mt-6 bg-yellow-50">
        <h3 className="mb-4 text-lg font-semibold">⚙️ Configuration du Jeu</h3>

        <div className="space-y-4">
          {/* Number of Undercovers */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nombre d&apos;Undercovers: {numUndercovers}
            </label>
            <input
              type="range"
              min="1"
              max={calculateMaxUndercovers(room.players.length)}
              value={numUndercovers}
              onChange={(e) =>
                handleConfigChange(parseInt(e.target.value), numMrWhites)
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>Max: {calculateMaxUndercovers(room.players.length)}</span>
            </div>
          </div>

          {/* Number of Mr. Whites */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nombre de Mr. White: {numMrWhites}
            </label>
            <input
              type="range"
              min="0"
              max={Math.max(0, room.players.length - numUndercovers - 1)}
              value={numMrWhites}
              onChange={(e) =>
                handleConfigChange(numUndercovers, parseInt(e.target.value))
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>
                Max: {Math.max(0, room.players.length - numUndercovers - 1)}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Mr. White ne connaît aucun mot
            </p>
          </div>

          {/* Validation Info */}
          <div className="rounded bg-gray-100 p-3 text-sm">
            <div className="mb-1 font-medium">Configuration actuelle:</div>
            <div className="whitespace-pre-line">
              {getGameConfigurationDisplay({
                numUndercovers,
                numMrWhites,
                totalPlayers: room.players.length,
              })}
            </div>
          </div>
        </div>
      </Card>
    </AnimateHeightSimple>
  );
}
