import type { ConvexPlayer } from "~/lib/convex-types";

const roleMap = {
  undercover: {
    displayName: "Undercover",
    badgeColor: "bg-red-100 text-red-800",
  },
  mr_white: {
    displayName: "Mr. White",
    badgeColor: "bg-gray-100 text-gray-800",
  },
  civilian: {
    displayName: "Civil",
    badgeColor: "bg-blue-100 text-blue-800",
  },
} as const;

interface PlayerCardProps {
  player: ConvexPlayer;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const roleInfo = roleMap[player.role] || {
    displayName: player.role,
    badgeColor: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="text-sm">
      <span className="font-medium">{player.name}</span>
      <span className={`ml-2 rounded px-2 py-1 text-xs ${roleInfo.badgeColor}`}>
        {roleInfo.displayName}
      </span>
    </div>
  );
}
