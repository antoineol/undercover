import AnimateHeight from "react-animate-height";
import { useIsDiscussionPhase } from "~/app/room/[roomCode]/_utils/utils";
import type { ConvexPlayer } from "~/lib/convex-types";

export function SharedWord({ player }: { player: ConvexPlayer }) {
  const isDiscussionPhase = useIsDiscussionPhase();

  return (
    <AnimateHeight
      height={
        isDiscussionPhase && player.hasSharedWord && player.sharedWord
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
  );
}
