"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import GameRoom from "@/components/GameRoom";

interface RoomPageProps {
  params: {
    roomCode: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const [playerName, setPlayerName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [joinError, setJoinError] = useState("");
  const searchParams = useSearchParams();

  const room = useQuery(api.rooms.getRoom, { roomCode: params.roomCode });
  const joinRoom = useMutation(api.rooms.joinRoom);

  const handleJoinRoom = useCallback(async (name: string, isHostPlayer: boolean = false) => {
    try {
      setJoinError("");
      await joinRoom({
        roomCode: params.roomCode,
        playerName: name,
        isHost: isHostPlayer
      });

      // Save player data to localStorage
      const playerData = { playerName: name, isHost: isHostPlayer };
      localStorage.setItem(`player_${params.roomCode}`, JSON.stringify(playerData));

      setPlayerName(name);
      setIsHost(isHostPlayer);
    } catch (error) {
      console.error("Failed to join room:", error);
      setJoinError("Impossible de rejoindre la salle. Vérifiez le code de la salle ou essayez un nom différent.");
    }
  }, [params.roomCode, joinRoom]);

  // Check for existing player data on mount
  useEffect(() => {
    const savedPlayerData = localStorage.getItem(`player_${params.roomCode}`);
    if (savedPlayerData) {
      try {
        const { playerName: savedName, isHost: savedIsHost } = JSON.parse(savedPlayerData);
        setPlayerName(savedName);
        setIsHost(savedIsHost);
      } catch (error) {
        console.error("Error parsing saved player data:", error);
        localStorage.removeItem(`player_${params.roomCode}`);
      }
    } else {
      // Check URL parameters for pre-filled data
      const urlName = searchParams.get('name');
      const urlIsHost = searchParams.get('isHost') === 'true';

      if (urlName) {
        setPlayerName(urlName);
        setIsHost(urlIsHost);
        // Auto-join if we have name from URL
        handleJoinRoom(urlName, urlIsHost);
      }
    }
    setIsLoading(false);
  }, [params.roomCode, searchParams, handleJoinRoom]);

  const handleLeave = () => {
    // Clear saved player data
    localStorage.removeItem(`player_${params.roomCode}`);
    setPlayerName("");
    setIsHost(false);
    setJoinError("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Salle Introuvable</h1>
            <p className="text-gray-600">Le code de salle &quot;{params.roomCode}&quot; n&apos;existe pas.</p>
          </div>
          <Link
            href="/"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center block"
          >
            Retour à l&apos;Accueil
          </Link>
        </div>
      </div>
    );
  }

  if (playerName) {
    return (
      <GameRoom
        roomCode={params.roomCode}
        playerName={playerName}
        isHost={isHost}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Rejoindre une Salle</h1>
          <p className="text-gray-600">Code de la Salle : <span className="font-mono font-bold">{params.roomCode}</span></p>
        </div>

        <JoinRoomForm
          onJoin={handleJoinRoom}
          error={joinError}
          room={room}
          preFilledName={searchParams.get('name')}
          preFilledIsHost={searchParams.get('isHost') === 'true'}
        />
      </div>
    </div>
  );
}

interface JoinRoomFormProps {
  onJoin: (name: string, isHost?: boolean) => void;
  error: string;
  room: any;
  preFilledName?: string | null;
  preFilledIsHost?: boolean;
}

function JoinRoomForm({ onJoin, error, room, preFilledName, preFilledIsHost }: JoinRoomFormProps) {
  const [name, setName] = useState(preFilledName || "");
  const [isHost, setIsHost] = useState(preFilledIsHost || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim(), isHost);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {preFilledName && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          Bienvenue ! Votre nom est pré-rempli depuis la création de la salle.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Votre Nom
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez votre nom"
          required
          maxLength={20}
        />
      </div>

      {room.players.length === 0 && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isHost"
            checked={isHost}
            onChange={(e) => setIsHost(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isHost" className="ml-2 block text-sm text-gray-700">
            Je suis l&apos;hôte de cette salle
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Rejoindre la Salle
      </button>

      <div className="text-center">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Retour à l&apos;Accueil
        </Link>
      </div>
    </form>
  );
}
