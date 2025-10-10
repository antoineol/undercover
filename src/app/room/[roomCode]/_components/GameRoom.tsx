"use client";

import {
  calculateVotingProgress,
  getCurrentTurnPlayer,
  isMyTurn,
  isVotingPhase,
} from "@/domains/room/room-management.service";
import { useMutation, useQuery } from "convex/react";
import { api } from "cvx/api";
import { useState } from "react";
import GameConfiguration from "~/components/game/GameConfiguration";
import GameHeader from "~/components/game/GameHeader";
import GameInstructions from "~/components/game/GameInstructions";
import GameResults from "~/components/game/GameResults";
import GameStartButton from "~/components/game/GameStartButton";
import MrWhiteGuessing from "~/components/game/MrWhiteGuessing";
import PlayerList from "~/components/game/player-list/PlayerList";
import QRCodeModal from "~/components/game/QRCodeModal";
import ShareButtons from "~/components/game/ShareButtons";
import StopGameButton from "~/components/game/StopGameButton";
import WordDisplay from "~/components/game/WordDisplay";
import WordSharing from "~/components/game/WordSharing";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import { useSessionStore } from "~/lib/stores/session-store";
import {
  useCurrentPlayerSafe,
  useIsDiscussionPhase,
  useRoomSafe,
} from "../_utils/utils";

export default function GameRoom() {
  const [showConfig, setShowConfig] = useState(false);
  const { clearSession } = useSessionStore();

  const room = useRoomSafe();
  const currentPlayer = useCurrentPlayerSafe();
  const playerName = currentPlayer.name;
  const isHost = currentPlayer.isHost;
  const isDiscussionPhaseState = useIsDiscussionPhase();

  const gameWords = useQuery(
    api.game.getGameWords,
    room ? { roomId: room._id } : "skip",
  );

  const restartGame = useMutation(api.game.restartGame);

  const handleRestartGame = async () => {
    if (room && isHost) {
      try {
        await restartGame({ roomId: room._id });
      } catch (error) {
        console.error("Failed to restart game:", error);
        alert("Échec du redémarrage du jeu");
      }
    }
  };

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
  const isVotingPhaseState = isVotingPhase(room);

  // Calculate voting progress using pure function
  const votingProgress = calculateVotingProgress(room.players);

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
        {/* Start Game Button and Configuration */}
        <AnimateHeightSimple open={isHost && room.gameState === "waiting"}>
          <div className="mt-6 flex flex-col">
            <GameStartButton room={room} isHost={isHost} />
            <GameConfiguration room={room} showConfig={showConfig} />
          </div>
        </AnimateHeightSimple>

        <PlayerList
          room={room}
          currentPlayer={currentPlayer}
          playerName={playerName}
          isVotingPhase={isVotingPhaseState}
          isDiscussionPhase={isDiscussionPhaseState}
          currentTurnPlayerId={currentTurnPlayer?._id}
          votingProgress={votingProgress}
        />

        <GameResults
          room={room}
          isHost={isHost}
          onRestartGame={handleRestartGame}
        />

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
