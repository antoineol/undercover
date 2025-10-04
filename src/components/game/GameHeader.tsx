import { UI_MESSAGES } from "@/lib/constants";
import { type Room } from "@/lib/types";
import Button from "../ui/Button";

interface GameHeaderProps {
  room: Room;
  onLeave: () => void;
  onToggleConfig: () => void;
  showConfig: boolean;
}

export default function GameHeader({
  room,
  onLeave,
  onToggleConfig,
  showConfig,
}: GameHeaderProps) {
  const getGameStateMessage = () => {
    switch (room.gameState) {
      case "waiting":
        return UI_MESSAGES.GAME_STATES.WAITING;
      case "discussion":
        return UI_MESSAGES.GAME_STATES.DISCUSSION;
      case "voting":
        return UI_MESSAGES.GAME_STATES.VOTING;
      case "mr_white_guessing":
        return UI_MESSAGES.GAME_STATES.MR_WHITE_GUESSING;
      case "results":
        return UI_MESSAGES.GAME_STATES.RESULTS;
      default:
        return "";
    }
  };

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-4xl px-4 py-3">
        {/* Mobile-first header layout */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Leave button */}
          <Button
            onClick={onLeave}
            variant="secondary"
            size="md"
            className="min-h-[44px] flex-shrink-0 px-4"
          >
            {UI_MESSAGES.BUTTONS.LEAVE_ROOM}
          </Button>

          {/* Center: Game state message */}
          <div className="flex-1 px-2 text-center">
            <p className="truncate text-sm font-medium text-gray-600">
              {getGameStateMessage()}
            </p>
          </div>

          {/* Right: Config toggle button (only show when waiting) */}
          {room.gameState === "waiting" && (
            <Button
              onClick={onToggleConfig}
              variant="primary"
              size="md"
              className="min-h-[44px] flex-shrink-0 px-4"
              title={
                showConfig
                  ? "Masquer la configuration"
                  : "Afficher la configuration"
              }
            >
              <span
                className={`transition-transform duration-300 ease-in-out ${showConfig ? "rotate-180" : "rotate-0"}`}
              >
                ⚙️
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
