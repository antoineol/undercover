"use client";

import GameRoom from "@/components/GameRoom";
import { useSessionStore } from "@/lib/stores/session-store";
import { useUIStore } from "@/lib/stores/ui-store";
import type { Room } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "cvx/api";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";

interface RoomPageClientProps {
  roomCode: string;
}

export function RoomPageClient({ roomCode }: RoomPageClientProps) {
  const {
    sessionId,
    setSession,
    clearSession,
    loadFromSessionStorage,
    saveToSessionStorage,
  } = useSessionStore();
  const { qrCodeDataUrl, setQrCodeDataUrl } = useUIStore();
  const [isLoading, setIsLoading] = useState(true);
  const [joinError, setJoinError] = useState("");

  const room = useQuery(api.rooms.getRoom, { roomCode });
  const joinRoom = useMutation(api.rooms.joinRoom);

  const handleJoinRoom = useCallback(
    async (name: string, isHostPlayer = false, sessionId?: string) => {
      try {
        setJoinError("");
        const result = await joinRoom({
          roomCode,
          playerName: name,
          sessionId: sessionId, // Pass sessionId for rejoining
          isHost: isHostPlayer,
        });

        // Save session data for rejoining
        if (result.sessionId) {
          setSession(result.sessionId);
        }
        saveToSessionStorage();

        // Log if this is a rejoin (for debugging)
        if (result.isExisting) {
          console.log("Player rejoined existing room");
        }
      } catch (error) {
        console.error("Failed to join room:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Show specific error messages for different cases
        if (errorMessage.includes("name already exists")) {
          setJoinError(
            "Un joueur avec ce nom existe déjà dans la salle. Veuillez choisir un autre nom.",
          );
        } else if (errorMessage.includes("Invalid session")) {
          setJoinError(
            "Session invalide. Veuillez rejoindre avec un nouveau nom.",
          );
        } else if (errorMessage.includes("Room not found")) {
          setJoinError("Salle introuvable. Vérifiez le code de la salle.");
        } else if (errorMessage.includes("Game has already started")) {
          setJoinError(
            "La partie a déjà commencé. Vous ne pouvez plus rejoindre cette salle.",
          );
        } else if (errorMessage.includes("Room is full")) {
          setJoinError("La salle est pleine. Maximum 10 joueurs autorisés.");
        } else {
          setJoinError(
            "Impossible de rejoindre la salle. Vérifiez le code de la salle ou essayez un nom différent.",
          );
        }
      }
    },
    [roomCode, joinRoom, setSession, saveToSessionStorage],
  );

  // Check for existing session data on mount and generate QR code
  useEffect(() => {
    // Load from sessionStorage first
    loadFromSessionStorage();

    // Auto-join if we have saved session data
    if (sessionId && roomCode) {
      // Try to rejoin with the existing sessionId
      // The room query will handle finding the player
    }
    setIsLoading(false);

    // Generate QR code automatically
    const generateQRCode = async () => {
      const roomUrl = `${window.location.origin}/room/${roomCode}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(roomUrl, {
          width: 150,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    };

    void generateQRCode();
  }, [
    roomCode,
    handleJoinRoom,
    sessionId,
    setQrCodeDataUrl,
    loadFromSessionStorage,
  ]);

  const handleLeave = () => {
    // Clear saved session data
    clearSession();
    sessionStorage.removeItem("player_session");
    setJoinError("");
  };

  if (isLoading || room === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  if (room === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-red-600">
              Salle Introuvable
            </h1>
            <p className="text-gray-600">
              Le code de salle &quot;{roomCode}&quot; n&apos;existe pas.
            </p>
          </div>
          <Link
            href="/"
            className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
          >
            Retour à l&apos;Accueil
          </Link>
        </div>
      </div>
    );
  }

  // Get current player from room data using sessionId
  const currentPlayer = room?.players.find((p) => p.sessionId === sessionId);

  if (currentPlayer) {
    return (
      <GameRoom
        roomCode={roomCode}
        playerName={currentPlayer.name}
        isHost={currentPlayer.isHost}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Rejoindre une Salle
          </h1>
          <p className="text-gray-600">
            Code de la Salle :{" "}
            <span className="font-mono font-bold">{roomCode}</span>
          </p>
        </div>

        <JoinRoomForm onJoin={handleJoinRoom} error={joinError} room={room} />

        {/* QR Code Section */}
        {qrCodeDataUrl && (
          <div className="mt-6 text-center">
            <Image
              src={qrCodeDataUrl}
              alt="QR Code"
              width={150}
              height={150}
              className="mx-auto"
            />
            <p className="mt-2 text-sm text-gray-600">Scannez pour rejoindre</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface JoinRoomFormProps {
  onJoin: (name: string, isHost?: boolean) => void;
  error: string;
  room: Room;
}

function JoinRoomForm({ onJoin, error, room }: JoinRoomFormProps) {
  const [name, setName] = useState("");
  const [isHost, setIsHost] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim(), isHost);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Votre Nom
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Entrez votre nom"
          required
          maxLength={20}
          autoFocus
        />
      </div>

      {room.players.length === 0 && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isHost"
            checked={isHost}
            onChange={(e) => setIsHost(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isHost" className="ml-2 block text-sm text-gray-700">
            Je suis l&apos;hôte de cette salle
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Rejoindre la Salle
      </button>

      <div className="text-center">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
          ← Retour à l&apos;Accueil
        </Link>
      </div>
    </form>
  );
}
