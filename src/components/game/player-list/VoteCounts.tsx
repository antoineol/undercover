import { useVotesSafe } from "~/app/room/[roomCode]/_utils/utils";
import type { ConvexPlayer } from "~/lib/convex-types";

export function VoteCounts({ player }: { player: ConvexPlayer }) {
  const { voteCounts, voterNames } = useVotesSafe();

  return (
    <div className="mt-1 text-sm text-red-600">
      Votes :{" "}
      {(voteCounts[player._id] ?? 0) > 0 ? (
        <>
          {voteCounts[player._id]} ({voterNames[player._id]?.join(", ")})
        </>
      ) : (
        "aucun"
      )}
    </div>
  );
}
