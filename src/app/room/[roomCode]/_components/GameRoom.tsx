"use client";

import {
  getCurrentTurnPlayer,
  isMyTurn,
} from "@/domains/room/room-management.service";
import { useQuery } from "convex/react";
import { api } from "cvx/api";
import { useState } from "react";
import GameResults from "~/app/room/[roomCode]/_components/game-result/GameResults";
import PlayerList from "~/app/room/[roomCode]/_components/player-list/PlayerList";
import GameConfiguration from "~/components/game/GameConfiguration";
import GameHeader from "~/components/game/GameHeader";
import GameInstructions from "~/components/game/GameInstructions";
import GameStartButton from "~/components/game/GameStartButton";
import MrWhiteGuessing from "~/components/game/MrWhiteGuessing";
import QRCodeModal from "~/components/game/QRCodeModal";
import ShareButtons from "~/components/game/ShareButtons";
import StopGameButton from "~/components/game/StopGameButton";
import WordDisplay from "~/components/game/WordDisplay";
import WordSharing from "~/components/game/WordSharing";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import { useSessionStore } from "~/lib/stores/session-store";
import { useCurrentPlayerSafe, useRoomSafe } from "../_utils/utils";

export default function GameRoom() {
  const [showConfig, setShowConfig] = useState(false);
  const { clearSession } = useSessionStore();

  const room = useRoomSafe();
  const currentPlayer = useCurrentPlayerSafe();
  const isHost = currentPlayer.isHost;

  const gameWords = useQuery(
    api.game.getGameWords,
    room ? { roomId: room._id } : "skip",
  );

  const handleToggleConfig = () => {
    setShowConfig(!showConfig);
  };

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  const handleLeave = () => {
    clearSession();
  };

  // Use pure functions for business logic calculations
  const alivePlayers = room.players.filter((p) => p.isAlive);

  // Get current turn player using pure function
  const currentTurnPlayer = getCurrentTurnPlayer(room, room.players);
  const isMyTurnState = isMyTurn(currentPlayer._id, room);

  return (
    <div className="min-h-screen bg-gray-100">
      <GameHeader
        room={room}
        onLeave={handleLeave}
        onToggleConfig={handleToggleConfig}
        showConfig={showConfig}
      />

      <div className="mx-auto mb-10 flex max-w-4xl flex-col px-4 py-6">
        <AnimateHeightSimple open={isHost && room.gameState === "waiting"}>
          <div className="mt-6 flex flex-col">
            <GameStartButton room={room} isHost={isHost} />
            <GameConfiguration room={room} showConfig={showConfig} />
          </div>
        </AnimateHeightSimple>

        <PlayerList />

        <GameResults />

        <WordDisplay
          room={room}
          currentPlayer={currentPlayer}
          gameWords={gameWords ?? null}
        />

        <WordSharing
          room={room}
          currentPlayer={currentPlayer}
          isMyTurn={isMyTurnState}
          currentTurnPlayer={currentTurnPlayer ?? undefined}
          alivePlayers={alivePlayers}
        />

        <MrWhiteGuessing room={room} />

        <GameInstructions room={room} />
      </div>

      <ShareButtons room={room} />
      <QRCodeModal />
      <StopGameButton room={room} isHost={isHost} />
    </div>
  );
}
