"use client";

import { useState } from "react";

interface RoomLobbyProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (roomCode: string, name: string) => void;
}

export default function RoomLobby({ onCreateRoom, onJoinRoom }: RoomLobbyProps) {
  const [createPlayerName, setCreatePlayerName] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (createPlayerName.trim()) {
      setIsCreating(true);
      onCreateRoom(createPlayerName.trim());
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinPlayerName.trim() && roomCode.trim()) {
      setIsJoining(true);
      onJoinRoom(roomCode.trim().toUpperCase(), joinPlayerName.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Room */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Créer une Salle</h2>
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-1">
              Votre Nom
            </label>
            <input
              id="create-name"
              type="text"
              value={createPlayerName}
              onChange={(e) => setCreatePlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre nom"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isCreating || !createPlayerName.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Création..." : "Créer une Salle"}
          </button>
        </form>
      </div>

      {/* Join Room */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Rejoindre une Salle</h2>
        <form onSubmit={handleJoinRoom} className="space-y-4">
          <div>
            <label htmlFor="join-name" className="block text-sm font-medium text-gray-700 mb-1">
              Votre Nom
            </label>
            <input
              id="join-name"
              type="text"
              value={joinPlayerName}
              onChange={(e) => setJoinPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Entrez votre nom"
              required
            />
          </div>
          <div>
            <label htmlFor="room-code" className="block text-sm font-medium text-gray-700 mb-1">
              Code de la Salle
            </label>
            <input
              id="room-code"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Entrez le code de la salle"
              maxLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isJoining || !joinPlayerName.trim() || !roomCode.trim()}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? "Rejoindre..." : "Rejoindre la Salle"}
          </button>
        </form>
      </div>
    </div>
  );
}
