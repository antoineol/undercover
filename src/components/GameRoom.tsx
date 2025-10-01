"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { GameRoomProps } from "@/lib/types";
import { retryWithBackoff, copyToClipboard } from "@/lib/utils";
import GameHeader from "./game/GameHeader";
import GameStats from "./game/GameStats";
import WordSharing from "./game/WordSharing";
import PlayerList from "./game/PlayerList";
import GameResults from "./game/GameResults";
import Card from "./ui/Card";
import Button from "./ui/Button";

export default function GameRoom({ roomCode, playerName, isHost, onLeave }: GameRoomProps) {
  const [showWords, setShowWords] = useState(false);
  const [wordToShare, setWordToShare] = useState("");
  const [numUndercovers, setNumUndercovers] = useState(1);
  const [hasMrWhite, setHasMrWhite] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const room = useQuery(api.rooms.getRoom, { roomCode });
  const gameWords = useQuery(api.game.getGameWords, room ? { roomId: room._id } : "skip");

  const startGame = useMutation(api.game.startGame);
  const shareWord = useMutation(api.game.shareWord);
  const votePlayer = useMutation(api.game.votePlayer);
  const validateGameState = useMutation(api.game.validateGameState);
  const restartGame = useMutation(api.game.restartGame);

  const handleStartGame = async () => {
    if (room && isHost) {
      try {
        await retryWithBackoff(
          () => startGame({
            roomId: room._id,
            numUndercovers,
            hasMrWhite
          })
        );
      } catch (error: any) {
        console.error("Failed to start game:", error);
        alert(`Erreur: ${error.message}`);
      }
    }
  };

  const handleShareWord = async () => {
    if (room && wordToShare.trim()) {
      const currentPlayer = room.players.find((p: { name: string }) => p.name === playerName);
      if (currentPlayer) {
        try {
          await shareWord({
            playerId: currentPlayer._id,
            word: wordToShare.trim()
          });
          setWordToShare("");
        } catch (error) {
          console.error("Échec du partage du mot:", error);
          alert("Erreur: " + ((error as Error).message || "Erreur inconnue"));
        }
      }
    }
  };

  const handleVote = async (targetId: string) => {
    if (room) {
      const currentPlayer = room.players.find((p: { name: string }) => p.name === playerName);
      if (currentPlayer) {
        try {
          await retryWithBackoff(
            () => votePlayer({
              roomId: room._id,
              voterId: currentPlayer._id,
              targetId: targetId as any
            })
          );
        } catch (error) {
          console.error("Échec du vote:", error);
          alert("Erreur lors du vote: " + ((error as Error).message || "Erreur inconnue"));
        }
      }
    }
  };

  const handleShareLink = async () => {
    const roomUrl = `${window.location.origin}/room/${roomCode}`;
    const success = await copyToClipboard(roomUrl);
    if (success) {
      alert("Lien de la salle copié dans le presse-papiers !");
    } else {
      alert("Impossible de copier le lien. Veuillez le copier manuellement.");
    }
  };

  const handleValidateGameState = async () => {
    if (room && !isValidating) {
      setIsValidating(true);
      try {
        const result = await retryWithBackoff(
          () => validateGameState({ roomId: room._id })
        );
        console.log("Game state validation result:", result);
        if (result.action !== "no_action_needed") {
          if (result.action === "skipped_dead_player") {
            alert("Joueur mort ignoré - passage au joueur suivant");
          } else {
            alert(`Game state fixed: ${result.action}`);
          }
        } else {
          alert("Game state is valid - no action needed");
        }
      } catch (error: any) {
        console.error("Failed to validate game state after retries:", error);
        alert("Failed to validate game state after multiple attempts");
      } finally {
        setIsValidating(false);
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

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = room.players.find((p: { name: string }) => p.name === playerName);
  const alivePlayers = room.players.filter((p: any) => p.isAlive);
  const isVotingPhase = room.gameState === "voting";
  const isDiscussionPhase = room.gameState === "discussion";

  // Calculate voting progress (only alive players)
  const playersWhoVoted = alivePlayers.filter((p: any) => p.votes.length > 0);
  const votingProgress = alivePlayers.length > 0 ? (playersWhoVoted.length / alivePlayers.length) * 100 : 0;

  // Get current player whose turn it is to share word
  const currentTurnPlayerId = room.playerOrder?.[room.currentPlayerIndex || 0];
  const currentTurnPlayer = room.players.find((p: { _id: string }) => p._id === currentTurnPlayerId);
  const isMyTurn = currentTurnPlayerId === currentPlayer?._id;

  // Get vote counts for display
  const voteCounts: Record<string, number> = {};
  const voterNames: Record<string, string[]> = {};

  alivePlayers.forEach((player: { votes: string[]; name: string }) => {
    player.votes.forEach((voteId: string) => {
      voteCounts[voteId] = (voteCounts[voteId] || 0) + 1;
      if (!voterNames[voteId]) voterNames[voteId] = [];
      voterNames[voteId].push(player.name);
    });
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <GameHeader
        room={room}
        isHost={isHost}
        onShareLink={handleShareLink}
        onValidateGame={handleValidateGameState}
        onStartGame={handleStartGame}
        onLeave={onLeave}
        isValidating={isValidating}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <GameStats
          room={room}
          alivePlayers={alivePlayers}
          votingProgress={votingProgress}
          playersWhoVoted={playersWhoVoted}
          currentPlayer={currentPlayer}
        />

        {currentPlayer && (
          <WordSharing
            room={room}
            currentPlayer={currentPlayer}
            wordToShare={wordToShare}
            setWordToShare={setWordToShare}
            onShareWord={handleShareWord}
            isMyTurn={isMyTurn}
            currentTurnPlayer={currentTurnPlayer}
            alivePlayers={alivePlayers}
          />
        )}

        {currentPlayer && (
          <PlayerList
            room={room}
            currentPlayer={currentPlayer}
            playerName={playerName}
            isVotingPhase={isVotingPhase}
            isDiscussionPhase={isDiscussionPhase}
            currentTurnPlayerId={currentTurnPlayerId}
            voteCounts={voteCounts}
            voterNames={voterNames}
            onVote={handleVote}
          />
        )}

        {/* Game Words (for current player) */}
        {room.gameState !== "waiting" && currentPlayer && gameWords && (
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Votre Rôle et Mot</h2>
              <Button
                onClick={() => setShowWords(!showWords)}
                variant="primary"
              >
                {showWords ? "Masquer" : "Afficher"} le Mot
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2">
                <span className="font-medium">Rôle: </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  currentPlayer.role === "undercover"
                    ? "bg-red-100 text-red-800"
                    : currentPlayer.role === "mr_white"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {currentPlayer.role === "undercover" ? "Undercover" :
                   currentPlayer.role === "mr_white" ? "Mr. White" : "Civil"}
                </span>
              </div>

              {showWords && (
                <div>
                  <span className="font-medium">Votre mot: </span>
                  <span className="text-lg font-bold text-blue-600">
                    {currentPlayer.role === "undercover" ? gameWords.undercoverWord :
                     currentPlayer.role === "mr_white" ? "Inconnu" : gameWords.civilianWord}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        <GameResults
          room={room}
          isHost={isHost}
          onRestartGame={handleRestartGame}
        />

        {/* Game Configuration - Host Only */}
        {room.gameState === "waiting" && isHost && (
          <Card className="mb-6 bg-yellow-50">
            <h3 className="text-lg font-semibold mb-4">⚙️ Configuration du Jeu</h3>

            <div className="space-y-4">
              {/* Number of Undercovers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d&apos;Undercovers: {numUndercovers}
                </label>
                <input
                  type="range"
                  min="1"
                  max={Math.min(Math.floor(room.players.length / 2), room.players.length - 1)}
                  value={numUndercovers}
                  onChange={(e) => setNumUndercovers(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>Max: {Math.min(Math.floor(room.players.length / 2), room.players.length - 1)}</span>
                </div>
              </div>

              {/* Mr. White Toggle */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={hasMrWhite}
                    onChange={(e) => setHasMrWhite(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Inclure Mr. White (ne connaît aucun mot)
                  </span>
                </label>
              </div>

              {/* Validation Info */}
              <div className="bg-gray-100 rounded p-3 text-sm">
                <div className="font-medium mb-1">Configuration actuelle:</div>
                <div>• {numUndercovers} Undercover{numUndercovers > 1 ? 's' : ''}</div>
                <div>• {hasMrWhite ? '1 Mr. White' : 'Pas de Mr. White'}</div>
                <div>• {room.players.length - numUndercovers - (hasMrWhite ? 1 : 0)} Civil{room.players.length - numUndercovers - (hasMrWhite ? 1 : 0) > 1 ? 's' : ''}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Game Instructions */}
        {room.gameState === "waiting" && (
          <Card className="bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">Comment Jouer</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 3-10 joueurs peuvent rejoindre cette salle</li>
              <li>• La plupart des joueurs sont des Civils avec un mot</li>
              <li>• 1-3 joueurs sont Undercovers avec un mot différent</li>
              <li>• Mr. White (4+ joueurs) ne connaît aucun mot</li>
              <li>• Discutez et votez contre les joueurs suspects</li>
              <li>• Les Civils gagnent en éliminant tous les Undercovers</li>
              <li>• Les Undercovers gagnent en survivant ou en surpassant les Civils</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}