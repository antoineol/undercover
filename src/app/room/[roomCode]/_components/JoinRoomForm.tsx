"use client";

import { useSessionStore } from "@/lib/stores/session-store";
import type { Room } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "cvx/api";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const joinRoomFormSchema = z.object({
  playerName: z
    .string()
    .min(1, "Le nom est requis")
    .max(20, "Le nom ne peut pas dépasser 20 caractères")
    .transform((val) => val.trim()),
  isHost: z.boolean().optional(),
});

export type JoinRoomFormData = z.infer<typeof joinRoomFormSchema>;

interface JoinRoomFormProps {
  roomCode: string;
  room: Room;
}

export default function JoinRoomForm({ roomCode, room }: JoinRoomFormProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const joinRoom = useMutation(api.rooms.joinRoom);
  const { setSession } = useSessionStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<JoinRoomFormData>({
    resolver: zodResolver(joinRoomFormSchema),
    mode: "onChange",
    defaultValues: {
      isHost: false,
    },
  });

  const onSubmit = async (data: JoinRoomFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await joinRoom({
        roomCode,
        playerName: data.playerName,
        isHost: data.isHost ?? false,
      });

      // Save session data for rejoining
      if (result.sessionId) {
        setSession(result.sessionId);
      }

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
        setError(
          "Un joueur avec ce nom existe déjà dans la salle. Veuillez choisir un autre nom.",
        );
      } else if (errorMessage.includes("Invalid session")) {
        setError("Session invalide. Veuillez rejoindre avec un nouveau nom.");
      } else if (errorMessage.includes("Room not found")) {
        setError("Salle introuvable. Vérifiez le code de la salle.");
      } else if (errorMessage.includes("Game has already started")) {
        setError(
          "La partie a déjà commencé. Vous ne pouvez plus rejoindre cette salle.",
        );
      } else if (errorMessage.includes("Room is full")) {
        setError("La salle est pleine. Maximum 10 joueurs autorisés.");
      } else {
        setError(
          "Impossible de rejoindre la salle. Vérifiez le code de la salle ou essayez un nom différent.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div>
        <label>
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Votre Nom
          </span>
          <input
            {...register("playerName")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Entrez votre nom"
            maxLength={20}
            autoFocus
          />
        </label>
        {errors.playerName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.playerName.message}
          </p>
        )}
      </div>

      {room.players.length === 0 && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isHost"
            {...register("isHost")}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isHost" className="ml-2 block text-sm text-gray-700">
            Je suis l&apos;hôte de cette salle
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Rejoindre..." : "Rejoindre la Salle"}
      </button>

      <div className="text-center">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
          ← Retour à l&apos;Accueil
        </Link>
      </div>
    </form>
  );
}
