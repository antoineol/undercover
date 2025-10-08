import AnimateHeight from "react-animate-height";
import { useRoomSafe } from "~/app/room/[roomCode]/_utils/utils";
import type { ConvexPlayer } from "~/lib/convex-types";

export function DeadPlayerRoleLabel({ player }: { player: ConvexPlayer }) {
  const room = useRoomSafe();
  return (
    <AnimateHeight
      height={!player.isAlive && room.gameState !== "waiting" ? "auto" : 0}
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
  );
}

function getRoleDisplayName(role: string) {
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
}

function getRoleBadgeColor(role: string) {
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
}
