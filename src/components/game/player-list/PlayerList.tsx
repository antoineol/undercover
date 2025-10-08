import type { RoomWithPlayers } from "@/lib/convex-types";
import AnimateHeight from "react-animate-height";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import type { Player } from "~/lib/types";
import Card from "../../ui/Card";
import ProgressBar from "../../ui/ProgressBar";
import { DeadPlayerRoleLabel } from "./DeadPlayerRoleLabel";
import { SharedWord } from "./SharedWord";
import { VoteButton } from "./VoteButton";
import { VoteCounts } from "./VoteCounts";

interface PlayerListProps {
  room: RoomWithPlayers;
  currentPlayer: Player | undefined;
  playerName: string;
  isVotingPhase: boolean;
  isDiscussionPhase: boolean;
  currentTurnPlayerId?: string;
  votingProgress: number;
}

export default function PlayerList({
  room,
  currentPlayer,
  playerName,
  isVotingPhase,
  isDiscussionPhase,
  currentTurnPlayerId,
  votingProgress,
}: PlayerListProps) {
  return (
    <AnimateHeight
      height={currentPlayer ? "auto" : 0}
      duration={300}
      easing="ease-in-out"
      animateOpacity
    >
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
            const shouldShowAsCurrentTurn =
              isCurrentTurn && !hasCompletedAction;
            // player.isAlive = false;

            return (
              <div
                key={player._id}
                className={`rounded-lg border p-3 ${
                  player.isAlive
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                } ${isMe ? "ring-2 ring-blue-500" : ""} ${
                  shouldShowAsCurrentTurn &&
                  (isDiscussionPhase || isVotingPhase)
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
                    <SharedWord player={player} />
                    <DeadPlayerRoleLabel player={player} />
                  </div>
                </div>

                <AnimateHeightSimple open={isVotingPhase}>
                  <VoteCounts player={player} />
                  <VoteButton player={player} />
                </AnimateHeightSimple>
              </div>
            );
          })}
        </div>
      </Card>
    </AnimateHeight>
  );
}
