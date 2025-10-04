"use client";

import { usePlayerStore } from "@/lib/stores/player-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "cvx/api";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z
    .string()
    .min(1, "Le nom est requis")
    .max(30, "Le nom ne peut pas dépasser 30 caractères")
    .transform((val) => val.trim()),
});

export type CreateRoomFormData = z.infer<typeof createRoomSchema>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CreateRoomFormProps {}

export default function CreateRoomForm({}: CreateRoomFormProps) {
  const [loading, setLoading] = useState(false);

  const createRoom = useMutation(api.rooms.createRoom);
  const { setPlayer, saveToSessionStorage } = usePlayerStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: CreateRoomFormData) => {
    setLoading(true);

    try {
      const result = await createRoom({ hostName: data.playerName });
      // Add a small delay to ensure room is fully created
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Store host data in Zustand store and sessionStorage
      setPlayer({
        playerName: data.playerName,
        isHost: true,
        sessionId: result.sessionId,
        roomCode: result.roomCode,
      });
      saveToSessionStorage(result.roomCode);

      // Redirect to room URL
      window.location.href = `/room/${result.roomCode}`;
    } catch (error) {
      console.error("Failed to create room:", error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Votre Nom
          </span>
          <input
            {...register("playerName")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Entrez votre nom"
          />
        </label>
        {errors.playerName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.playerName.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !isValid}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer une salle"}
      </button>
    </form>
  );
}
