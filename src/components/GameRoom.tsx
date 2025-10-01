"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface GameRoomProps {
  roomCode: string;
  playerName: string;
  isHost: boolean;
  onLeave: () => void;
}

export default function GameRoom({ roomCode, playerName, isHost, onLeave }: GameRoomProps) {
  const [showWords, setShowWords] = useState(false);
  const [wordToShare, setWordToShare] = useState("");

  const room = useQuery(api.rooms.getRoom, { roomCode });
  const gameWords = useQuery(api.game.getGameWords, room ? { roomId: room._id } : "skip");

  const startGame = useMutation(api.game.startGame);
  const shareWord = useMutation(api.game.shareWord);
  const votePlayer = useMutation(api.game.votePlayer);

  const handleStartGame = async () => {
    if (room) {
      try {
        await startGame({ roomId: room._id });
      } catch (error) {
        console.error("Échec du démarrage du jeu:", error);
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
          await votePlayer({
            roomId: room._id,
            voterId: currentPlayer._id,
            targetId: targetId as any
          });
        } catch (error) {
          console.error("Échec du vote:", error);
        }
      }
    }
  };

  const handleShareLink = () => {
    const roomUrl = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(roomUrl).then(() => {
      alert("Lien de la salle copié dans le presse-papiers !");
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = roomUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Lien de la salle copié dans le presse-papiers !");
    });
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
  const hasSharedWord = currentPlayer?.hasSharedWord || false;

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              {/* <h1 className="text-2xl font-bold text-gray-800">Salle: {roomCode}</h1> */}
              <p className="text-gray-600">
                {room.gameState === "waiting" && "En attente des joueurs..."}
                {room.gameState === "discussion" && "Phase de Discussion"}
                {room.gameState === "voting" && "Phase de Vote"}
                {room.gameState === "results" && "Résultats du Jeu"}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleShareLink}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                title="Copier le lien de la salle pour partager"
              >
                📋 Partager le Lien
              </button>
              {isHost && room.gameState === "waiting" && (
                <button
                  onClick={handleStartGame}
                  disabled={room.players.length < 3}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Démarrer le Jeu ({room.players.length}/3+)
                </button>
              )}
              <button
                onClick={onLeave}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Quitter la Salle
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Game State */}
        {room.gameState !== "waiting" && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">État du Jeu</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{alivePlayers.length}</div>
                <div className="text-sm text-gray-600">Joueurs Vivants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{room.currentRound}</div>
                <div className="text-sm text-gray-600">Tour Actuel</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{room.maxRounds}</div>
                <div className="text-sm text-gray-600">Tours Maximum</div>
              </div>
            </div>

            {/* Voting Progress */}
            {isVotingPhase && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression du Vote</span>
                  <span className="text-sm text-gray-600">{playersWhoVoted.length}/{alivePlayers.length} joueurs vivants ont voté</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${votingProgress}%` }}
                  ></div>
                </div>
                {votingProgress === 100 && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ✅ Tous les joueurs vivants ont voté - Traitement des résultats...
                  </p>
                )}
                {currentPlayer && currentPlayer.votes.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    🗳️ Vous avez voté pour: {room.players.find((p: any) => p._id === currentPlayer.votes[0])?.name}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Word Sharing Phase */}
        {isDiscussionPhase && currentPlayer && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Partage de Mot</h2>

            {/* Show whose turn it is */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                {isMyTurn ? "🎯 C'est votre tour de partager un mot" : `⏳ C'est au tour de ${currentTurnPlayer?.name || "quelqu'un"}`}
              </p>
              {/* Show word sharing progress */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-blue-600">
                    Progression: {room.players.filter((p: any) => p.isAlive && p.hasSharedWord).length}/{alivePlayers.length} joueurs vivants ont partagé leur mot
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${alivePlayers.length > 0 ? (room.players.filter((p: any) => p.isAlive && p.hasSharedWord).length / alivePlayers.length) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {!hasSharedWord ? (
              <div className="space-y-4">
                {isMyTurn ? (
                  <>
                    <p className="text-gray-700">
                      Décrivez votre mot en un seul mot sans le révéler directement.
                    </p>
                    <form onSubmit={(e) => { e.preventDefault(); handleShareWord(); }}>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={wordToShare}
                          onChange={(e) => setWordToShare(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleShareWord();
                            }
                          }}
                          placeholder="Votre mot descriptif..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={20}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!wordToShare.trim()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          Partager
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800">
                      ⏳ En attente que {currentTurnPlayer?.name} partage son mot...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">✅ Vous avez partagé votre mot</p>
                <p className="text-sm text-green-600 mt-1">
                  {isMyTurn ? "En attente que tous les joueurs partagent leur mot..." : `En attente que ${currentTurnPlayer?.name} partage son mot...`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Player List */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Joueurs ({room.players.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {room.players.map((player: any) => {
              const isCurrentTurn = player._id === currentTurnPlayerId;
              const isMe = player.name === playerName;

              return (
              <div
                key={player._id}
                className={`p-3 rounded-lg border ${
                  player.isAlive
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                } ${isMe ? "ring-2 ring-blue-500" : ""} ${isCurrentTurn ? "ring-2 ring-yellow-500 bg-yellow-50" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{player.name}</span>
                  <div className="flex space-x-1">
                    {isCurrentTurn && isDiscussionPhase && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Tour
                      </span>
                    )}
                    {player.isHost && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Hôte
                      </span>
                    )}
                  </div>
                </div>
                {room.gameState !== "waiting" && (
                  <div className="text-sm text-gray-600 mt-1">
                    {player.isAlive ? "Vivant" : "💀 Éliminé"}
                  </div>
                )}

                {/* Show if player is skipped in current turn */}
                {isDiscussionPhase && !player.isAlive && (
                  <div className="text-xs text-gray-500 mt-1">
                    ⏭️ Ignoré (mort)
                  </div>
                )}

                {/* Show shared word if player has shared */}
                {isDiscussionPhase && player.hasSharedWord && player.sharedWord && (
                  <div className="text-sm text-blue-600 mt-1">
                    Mot: &quot;{player.sharedWord}&quot;
                  </div>
                )}

                {/* Show vote counts during voting */}
                {isVotingPhase && voteCounts[player._id] > 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    Votes: {voteCounts[player._id]} ({voterNames[player._id]?.join(", ")})
                  </div>
                )}

                {/* Show if current player has voted for this player */}
                {isVotingPhase && player.isAlive && player.name !== playerName && (
                  <div className="mt-2">
                    {currentPlayer?.votes.includes(player._id) ? (
                      <button
                        onClick={() => handleVote(player._id)}
                        className="w-full bg-green-600 text-white text-sm py-1 px-2 rounded hover:bg-green-700"
                      >
                        ✅ Voté - Cliquer pour changer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVote(player._id)}
                        className="w-full bg-red-600 text-white text-sm py-1 px-2 rounded hover:bg-red-700"
                      >
                        Voter Contre
                      </button>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Game Words (for current player) */}
        {room.gameState !== "waiting" && currentPlayer && gameWords && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Votre Rôle et Mot</h2>
              <button
                onClick={() => setShowWords(!showWords)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {showWords ? "Masquer" : "Afficher"} le Mot
              </button>
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
          </div>
        )}

        {/* Game Instructions */}
        {room.gameState === "waiting" && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Comment Jouer</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 3-10 joueurs peuvent rejoindre cette salle</li>
              <li>• La plupart des joueurs sont des Civils avec un mot</li>
              <li>• 1-3 joueurs sont Undercovers avec un mot différent</li>
              <li>• Mr. White (7+ joueurs) ne connaît aucun mot</li>
              <li>• Discutez et votez contre les joueurs suspects</li>
              <li>• Les Civils gagnent en éliminant tous les Undercovers</li>
              <li>• Les Undercovers gagnent en survivant ou en surpassant les Civils</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}