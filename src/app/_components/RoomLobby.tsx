import CreateRoomForm from "@/app/_components/CreateRoomForm";
import {
  formatRoomCodeInput,
  getFormValidationState,
  getLoadingStateText,
  validatePlayerNameInput,
  validateRoomCodeInput,
} from "@/domains/ui/ui-helpers.service";
import { useState } from "react";

interface RoomLobbyProps {
  onJoinRoom: (roomCode: string, name: string) => void;
}

export default function RoomLobby({ onJoinRoom }: RoomLobbyProps) {
  const [joinPlayerName, setJoinPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const nameValidation = validatePlayerNameInput(joinPlayerName);
    const codeValidation = validateRoomCodeInput(roomCode);

    if (nameValidation.isValid && codeValidation.isValid) {
      setIsJoining(true);
      onJoinRoom(roomCode.trim().toUpperCase(), joinPlayerName.trim());
    }
  };

  // Use pure functions for business logic
  const loadingText = getLoadingStateText(false, isJoining);
  const joinFormValidation = getFormValidationState(joinPlayerName, roomCode);

  return (
    <>
      <div className="rounded-lg bg-blue-50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Créer une Salle
        </h2>
        <CreateRoomForm />
      </div>

      {/* Join Room */}
      <div className="flex flex-col gap-4 rounded-lg bg-green-50 p-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Rejoindre une Salle
        </h2>
        <p>Demandez le lien de la salle ou entrez le code :</p>
        <form onSubmit={handleJoinRoom} className="space-y-4">
          <div>
            <label
              htmlFor="join-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Votre Nom
            </label>
            <input
              id="join-name"
              type="text"
              value={joinPlayerName}
              onChange={(e) => setJoinPlayerName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Entrez votre nom"
              required
            />
          </div>
          <div>
            <label
              htmlFor="room-code"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Code de la Salle
            </label>
            <input
              id="room-code"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(formatRoomCodeInput(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Entrez le code de la salle"
              maxLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isJoining || !joinFormValidation.isJoinFormValid}
            className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingText.joinButtonText}
          </button>
        </form>
      </div>
    </>
  );
}
