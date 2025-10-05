"use client";

import { useSessionStore } from "@/lib/stores/session-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useQuery } from "convex/react";
import { api } from "cvx/api";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import GameRoom from "~/app/room/[roomCode]/_components/GameRoom";
import JoinRoomForm from "~/app/room/[roomCode]/_components/JoinRoomForm";

interface RoomPageClientProps {
  roomCode: string;
}

export function RoomPageClient({ roomCode }: RoomPageClientProps) {
  const { sessionId, clearSession } = useSessionStore();
  const { qrCodeDataUrl, setQrCodeDataUrl } = useUIStore();
  const [isLoading, setIsLoading] = useState(true);

  const room = useQuery(api.rooms.getRoom, { roomCode });

  // Check for existing session data on mount and generate QR code
  useEffect(() => {
    // Session data is automatically loaded from sessionStorage on store initialization
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
  }, [roomCode, sessionId, setQrCodeDataUrl]);

  const handleLeave = () => {
    // Clear saved session data
    clearSession();
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

        <JoinRoomForm roomCode={roomCode} room={room} />

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
