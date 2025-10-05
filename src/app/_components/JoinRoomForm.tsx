"use client";

import { useSessionStore } from "@/lib/stores/session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "cvx/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const joinRoomSchema = z.object({
  playerName: z
    .string()
    .min(1, "Le nom est requis")
    .max(30, "Le nom ne peut pas dépasser 30 caractères")
    .transform((val) => val.trim()),
  roomCode: z
    .string()
    .min(6, "Le code de la salle doit contenir 6 caractères")
    .max(6, "Le code de la salle doit contenir 6 caractères")
    .regex(
      /^[A-Z0-9]+$/,
      "Le code de la salle ne peut contenir que des lettres et des chiffres",
    )
    .transform((val) => val.trim().toUpperCase()),
});

export type JoinRoomFormData = z.infer<typeof joinRoomSchema>;

export default function JoinRoomForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const joinRoom = useMutation(api.rooms.joinRoom);
  const { setSession } = useSessionStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<JoinRoomFormData>({
    resolver: zodResolver(joinRoomSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: JoinRoomFormData) => {
    setLoading(true);

    try {
      const result = await joinRoom({
        roomCode: data.roomCode,
        playerName: data.playerName,
      });

      if (result.sessionId) {
        setSession(result.sessionId);
      }
      router.push(`/room/${data.roomCode}`);
    } catch (error) {
      console.error("Failed to join room:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Erreur: ${errorMessage}`);
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Entrez votre nom"
          />
        </label>
        {errors.playerName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.playerName.message}
          </p>
        )}
      </div>
      <div>
        <label>
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Code de la Salle
          </span>
          <input
            {...register("roomCode")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Entrez le code de la salle"
            maxLength={6}
          />
        </label>
        {errors.roomCode && (
          <p className="mt-1 text-sm text-red-600">{errors.roomCode.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !isValid}
        className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Rejoindre..." : "Rejoindre la Salle"}
      </button>
    </form>
  );
}
