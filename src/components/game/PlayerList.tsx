import { UI_MESSAGES } from "@/lib/constants";
import type { RoomWithPlayers } from "@/lib/convex-types";
import type { Id } from "cvx/dataModel";
import AnimateHeight from "react-animate-height";
import type { Player } from "~/lib/types";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";

interface PlayerListProps {
  room: RoomWithPlayers;
  currentPlayer: Player | undefined;
  playerName: string;
  isVotingPhase: boolean;
  isDiscussionPhase: boolean;
  currentTurnPlayerId?: string;
  voteCounts: Record<string, number>;
  voterNames: Record<string, string[]>;
  onVote: (playerId: Id<"players">) => void;
  votingProgress: number;
}

export default function PlayerList({
  room,
  currentPlayer,
  playerName,
  isVotingPhase,
  isDiscussionPhase,
  currentTurnPlayerId,
  voteCounts,
  voterNames,
  onVote,
  votingProgress,
}: PlayerListProps) {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "undercover":
        return "Undercover";
      case "mr_white":
        return "Mr. White";
      case "civilian":
        return "Civil";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "undercover":
        return "bg-red-100 text-red-800";
      case "mr_white":
        return "bg-gray-100 text-gray-800";
      case "civilian":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mt-6 flex flex-col gap-6">
      <ProgressBar progress={votingProgress} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {room.players.map((player) => {
          const isCurrentTurn = player._id === currentTurnPlayerId;
          const isMe = player.name === playerName;

          // Check if current turn player has already completed their action
          const hasCompletedAction = isDiscussionPhase
            ? player.hasSharedWord
            : isVotingPhase
              ? player.hasVoted === true
              : false;

          // Only show as current turn if they haven't completed their action yet
          const shouldShowAsCurrentTurn = isCurrentTurn && !hasCompletedAction;
          // player.isAlive = false;

          return (
            <div
              key={player._id}
              className={`rounded-lg border p-3 ${
                player.isAlive
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              } ${isMe ? "ring-2 ring-blue-500" : ""} ${
                shouldShowAsCurrentTurn && (isDiscussionPhase || isVotingPhase)
                  ? "bg-yellow-50 ring-2 ring-yellow-500"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {shouldShowAsCurrentTurn && " →"} {!player.isAlive && "💀"}{" "}
                  {player.name}
                </span>
                <div>
                  <AnimateHeight
                    height={
                      isDiscussionPhase &&
                      player.hasSharedWord &&
                      player.sharedWord
                        ? "auto"
                        : 0
                    }
                    duration={300}
                    easing="ease-in-out"
                    animateOpacity
                  >
                    <div className="text-sm text-blue-600">
                      &quot;{player.sharedWord}&quot;
                    </div>
                  </AnimateHeight>

                  {/* Show role for dead players */}
                  <AnimateHeight
                    height={
                      !player.isAlive && room.gameState !== "waiting"
                        ? "auto"
                        : 0
                    }
                    duration={300}
                    easing="ease-in-out"
                    animateOpacity
                  >
                    <div className="text-sm">
                      <span
                        className={`rounded px-2 py-1 text-xs ${getRoleBadgeColor(player.role)}`}
                      >
                        {getRoleDisplayName(player.role)}
                      </span>
                    </div>
                  </AnimateHeight>
                </div>
              </div>

              {/* Show vote counts during voting */}
              <AnimateHeight
                height={isVotingPhase ? "auto" : 0}
                duration={300}
                easing="ease-in-out"
                animateOpacity
              >
                <div className="mt-1 text-sm text-red-600">
                  Votes :{" "}
                  {(voteCounts[player._id] ?? 0) > 0 ? (
                    <>
                      {voteCounts[player._id]} (
                      {voterNames[player._id]?.join(", ")})
                    </>
                  ) : (
                    "aucun"
                  )}
                </div>

                {/* Show if current player has voted for this player - only for alive players */}
                <AnimateHeight
                  height={
                    player.isAlive &&
                    player.name !== playerName &&
                    currentPlayer?.isAlive
                      ? "auto"
                      : 0
                  }
                  duration={300}
                  easing="ease-in-out"
                  animateOpacity
                >
                  <div className="mt-2">
                    {currentPlayer?.votes?.includes?.(player._id) ? (
                      <Button
                        onClick={() => onVote(player._id)}
                        variant="success"
                        size="sm"
                        className="w-full"
                      >
                        {UI_MESSAGES.BUTTONS.VOTED}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onVote(player._id)}
                        variant="danger"
                        size="sm"
                        className="w-full"
                      >
                        {UI_MESSAGES.BUTTONS.VOTE_AGAINST}
                      </Button>
                    )}
                  </div>
                </AnimateHeight>
              </AnimateHeight>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
