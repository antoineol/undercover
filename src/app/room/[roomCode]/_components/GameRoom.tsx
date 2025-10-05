"use client";

import {
  calculateVoteData,
  calculateVotingProgress,
  getCurrentTurnPlayer,
  isDiscussionPhase,
  isMyTurn,
  isVotingPhase,
} from "@/domains/room/room-management.service";
import { useUIStore } from "@/lib/stores/ui-store";
import { retryWithBackoff } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "cvx/api";
import type { Id } from "cvx/dataModel";
import AnimateHeight from "react-animate-height";
import GameConfiguration from "~/components/game/GameConfiguration";
import GameHeader from "~/components/game/GameHeader";
import GameInstructions from "~/components/game/GameInstructions";
import GameResults from "~/components/game/GameResults";
import GameStartButton from "~/components/game/GameStartButton";
import MrWhiteGuessing from "~/components/game/MrWhiteGuessing";
import PlayerList from "~/components/game/PlayerList";
import QRCodeModal from "~/components/game/QRCodeModal";
import ShareButtons from "~/components/game/ShareButtons";
import StopGameButton from "~/components/game/StopGameButton";
import WordDisplay from "~/components/game/WordDisplay";
import WordSharing from "~/components/game/WordSharing";
import { useSessionStore } from "~/lib/stores/session-store";
import { useCurrentPlayer } from "../_utils/utils";

export interface GameRoomProps {
  roomCode: string;
  playerName: string;
  isHost: boolean;
}

export default function GameRoom({
  roomCode,
  playerName,
  isHost,
}: GameRoomProps) {
  const { showConfig, setShowConfig } = useUIStore();
  const { wordToShare, setWordToShare, isSharingWord, setIsSharingWord } =
    useUIStore();
  const { clearSession } = useSessionStore();

  const room = useQuery(api.rooms.getRoom, { roomCode });
  const gameWords = useQuery(
    api.game.getGameWords,
    room ? { roomId: room._id } : "skip",
  );
  const currentPlayer = useCurrentPlayer();

  const shareWord = useMutation(api.game.shareWord);
  const votePlayer = useMutation(api.game.votePlayer);
  const restartGame = useMutation(api.game.restartGame);

  const handleShareWord = async () => {
    if (room && wordToShare.trim() && !isSharingWord) {
      if (currentPlayer) {
        setIsSharingWord(true);
        try {
          await retryWithBackoff(() =>
            shareWord({
              playerId: currentPlayer._id,
              word: wordToShare.trim(),
            }),
          );
          setWordToShare("");
        } catch (error) {
          console.error("Échec du partage du mot:", error);
          alert("Erreur: " + ((error as Error).message || "Erreur inconnue"));
        } finally {
          setIsSharingWord(false);
        }
      }
    }
  };

  const handleVote = async (targetId: Id<"players">) => {
    if (room) {
      if (currentPlayer) {
        try {
          await retryWithBackoff(() =>
            votePlayer({
              roomId: room._id,
              voterId: currentPlayer._id,
              targetId: targetId,
            }),
          );
        } catch (error) {
          console.error("Échec du vote:", error);
          alert(
            "Erreur lors du vote: " +
              ((error as Error).message || "Erreur inconnue"),
          );
        }
      }
    }
  };

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
  const isDiscussionPhaseState = isDiscussionPhase(room);

  // Calculate voting progress using pure function
  const votingProgress = calculateVotingProgress(room.players);

  // Get current turn player using pure function
  const currentTurnPlayer = getCurrentTurnPlayer(room, room.players);
  const isMyTurnState = currentPlayer
    ? isMyTurn(currentPlayer._id, room)
    : false;

  // Calculate vote data using pure function
  const { voteCounts, voterNames } = calculateVoteData(room.players);

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
        <AnimateHeight
          height={isHost && room.gameState === "waiting" ? "auto" : 0}
          duration={300}
          easing="ease-in-out"
          animateOpacity
        >
          <div className="mt-6 flex flex-col">
            <GameStartButton room={room} isHost={isHost} />
            <GameConfiguration room={room} showConfig={showConfig} />
          </div>
        </AnimateHeight>

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
          wordToShare={wordToShare}
          setWordToShare={setWordToShare}
          onShareWord={handleShareWord}
          isMyTurn={isMyTurnState}
          currentTurnPlayer={currentTurnPlayer ?? undefined}
          alivePlayers={alivePlayers}
          isSubmitting={isSharingWord}
        />

        <MrWhiteGuessing room={room} />

        <AnimateHeight
          height={currentPlayer ? "auto" : 0}
          duration={300}
          easing="ease-in-out"
          animateOpacity
        >
          <PlayerList
            room={room}
            currentPlayer={currentPlayer}
            playerName={playerName}
            isVotingPhase={isVotingPhaseState}
            isDiscussionPhase={isDiscussionPhaseState}
            currentTurnPlayerId={currentTurnPlayer?._id}
            voteCounts={voteCounts}
            voterNames={voterNames}
            onVote={handleVote}
            votingProgress={votingProgress}
          />
        </AnimateHeight>

        <GameInstructions room={room} />
      </div>

      <ShareButtons room={room} />
      <QRCodeModal />
      <StopGameButton room={room} isHost={isHost} />
    </div>
  );
}
