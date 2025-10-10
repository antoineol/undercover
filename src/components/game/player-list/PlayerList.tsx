import {
  useCurrentPlayerSafe,
  useIsVotingPhase,
  useRoomSafe,
  useVotingProgress,
} from "~/app/room/[roomCode]/_utils/utils";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import Card from "../../ui/Card";
import ProgressBar from "../../ui/ProgressBar";
import { DeadPlayerRoleLabel } from "./DeadPlayerRoleLabel";
import { PlayerCard } from "./PlayerCard";
import { PlayerLabel } from "./PlayerLabel";
import { SharedWord } from "./SharedWord";
import { VoteButton } from "./VoteButton";
import { VoteCounts } from "./VoteCounts";

export default function PlayerList() {
  const room = useRoomSafe();
  const currentPlayer = useCurrentPlayerSafe();
  const isVotingPhase = useIsVotingPhase();
  const votingProgress = useVotingProgress();

  return (
    <AnimateHeightSimple open={!!currentPlayer}>
      <Card className="mt-6 flex flex-col gap-6">
        <ProgressBar progress={votingProgress} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {room.players.map((player) => (
            <PlayerCard key={player._id} player={player}>
              <div className="flex items-center justify-between">
                <PlayerLabel player={player} />
                <div>
                  <SharedWord player={player} />
                  <DeadPlayerRoleLabel player={player} />
                </div>
              </div>

              <AnimateHeightSimple open={isVotingPhase}>
                <VoteCounts player={player} />
                <VoteButton player={player} />
              </AnimateHeightSimple>
            </PlayerCard>
          ))}
        </div>
      </Card>
    </AnimateHeightSimple>
  );
}
