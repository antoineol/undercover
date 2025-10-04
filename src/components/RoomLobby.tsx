"use client";

import { useState } from "react";
import {
  validatePlayerNameInput,
  validateRoomCodeInput,
  formatRoomCodeInput,
  getFormValidationState,
  getLoadingStateText,
  getLobbySectionText,
} from "@/domains/ui/ui-helpers.service";

interface RoomLobbyProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (roomCode: string, name: string) => void;
}

export default function RoomLobby({
  onCreateRoom,
  onJoinRoom,
}: RoomLobbyProps) {
  const [createPlayerName, setCreatePlayerName] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePlayerNameInput(createPlayerName);
    if (validation.isValid) {
      setIsCreating(true);
      onCreateRoom(createPlayerName.trim());
    }
  };

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
  const sectionText = getLobbySectionText();
  const loadingText = getLoadingStateText(isCreating, isJoining);
  const formValidation = getFormValidationState(createPlayerName);
  const joinFormValidation = getFormValidationState(joinPlayerName, roomCode);

  return (
    <>
      {/* Create Room */}
      <div className="rounded-lg bg-blue-50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          {sectionText.createTitle}
        </h2>
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label
              htmlFor="create-name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Votre Nom
            </label>
            <input
              id="create-name"
              type="text"
              value={createPlayerName}
              onChange={(e) => setCreatePlayerName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Entrez votre nom"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isCreating || !formValidation.isCreateFormValid}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingText.createButtonText}
          </button>
        </form>
      </div>

      {/* Join Room */}
      <div className="flex flex-col gap-4 rounded-lg bg-green-50 p-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {sectionText.joinTitle}
        </h2>
        <p>{sectionText.joinDescription}</p>
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
