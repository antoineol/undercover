import { useIsDiscussionPhase } from "~/app/room/[roomCode]/_utils/utils";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import type { ConvexPlayer } from "~/lib/convex-types";

export function SharedWord({ player }: { player: ConvexPlayer }) {
  const isDiscussionPhase = useIsDiscussionPhase();

  return (
    <AnimateHeightSimple
      open={isDiscussionPhase && player.hasSharedWord && !!player.sharedWord}
    >
      <div className="text-sm text-blue-600">
        &quot;{player.sharedWord}&quot;
      </div>
    </AnimateHeightSimple>
  );
}
