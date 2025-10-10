import { calculateSharingProgress } from "@/domains/ui/ui-helpers.service";
import { UI_MESSAGES } from "@/lib/constants";
import type { Player, Room } from "@/lib/types";
import { retryWithBackoff } from "@/lib/utils";
import { validateSharedWord } from "@/lib/validation";
import { useMutation } from "convex/react";
import { api } from "cvx/api";
import { useEffect, useState } from "react";
import { AnimateHeightSimple } from "~/components/ui/AnimateHeightSimple";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import ProgressBar from "../ui/ProgressBar";

interface WordSharingProps {
  room: Room;
  currentPlayer: Player | undefined;
  isMyTurn: boolean;
  currentTurnPlayer?: Player;
  alivePlayers: Player[];
}

// Internal component that handles the word sharing logic
function WordSharingContent({
  room,
  currentPlayer,
  isMyTurn,
  currentTurnPlayer,
  alivePlayers,
}: WordSharingProps) {
  const [wordToShare, setWordToShare] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shareWord = useMutation(api.game.shareWord);
  const hasSharedWord = currentPlayer?.hasSharedWord ?? false;
  const playersWhoShared = room.players.filter(
    (p) => p.isAlive && p.hasSharedWord,
  ).length;
  const sharingProgress = calculateSharingProgress(
    playersWhoShared,
    alivePlayers.length,
  );

  // Robust check: if it's my turn but I've already shared, there's a data inconsistency
  // This can happen due to race conditions or data sync issues
  const isDataInconsistent = isMyTurn && hasSharedWord;

  // Auto-fix the inconsistency
  const fixDataInconsistency = useMutation(
    api.game_management.fixDataInconsistency,
  );

  useEffect(() => {
    if (isDataInconsistent && room._id) {
      // Automatically try to fix the inconsistency
      fixDataInconsistency({ roomId: room._id }).catch(console.error);
    }
  }, [isDataInconsistent, room._id, fixDataInconsistency]);

  const handleShareWord = async () => {
    if (room && wordToShare.trim() && !isSubmitting) {
      if (currentPlayer) {
        setIsSubmitting(true);
        try {
          await retryWithBackoff(() =>
            shareWord({
              playerId: currentPlayer._id,
              word: wordToShare.trim(),
            }),
          );
          setWordToShare("");
        } catch (error) {
          console.error("Échec du partage du mot:", error);
          alert("Erreur: " + ((error as Error).message || "Erreur inconnue"));
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the word before sharing
    const validation = validateSharedWord(wordToShare);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    void handleShareWord();
  };

  return (
    <div className="mt-6 flex flex-col gap-6">
      <ProgressBar progress={sharingProgress} />

      <div className="flex flex-col">
        <AnimateHeightSimple open={isMyTurn}>
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="font-medium text-blue-800">
              <span className="animate-pulse">🎯</span> C&apos;est votre tour de
              partager un mot
            </p>
            {isDataInconsistent && (
              <p className="mt-2 text-sm text-blue-600">
                🔄 Correction automatique en cours...
              </p>
            )}
          </div>
        </AnimateHeightSimple>

        <AnimateHeightSimple open={!isMyTurn}>
          <div className="mt-6 rounded-lg bg-yellow-50 p-3">
            <p className="text-yellow-800">
              ⏳ En attente que {currentTurnPlayer?.name} partage son mot...
            </p>
          </div>
        </AnimateHeightSimple>

        <AnimateHeightSimple
          open={isMyTurn && !hasSharedWord && !isDataInconsistent}
        >
          <Card className="mt-6 flex flex-col gap-4">
            <p className="text-gray-700">
              Décrivez votre mot en un seul mot sans le révéler directement.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={wordToShare}
                  onChange={(e) => setWordToShare(e.target.value)}
                  placeholder="Votre mot descriptif..."
                  maxLength={20}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={!wordToShare.trim() || isSubmitting}
                >
                  {isSubmitting
                    ? "Partage en cours..."
                    : UI_MESSAGES.BUTTONS.SHARE_WORD}
                </Button>
              </div>
            </form>
          </Card>
        </AnimateHeightSimple>
      </div>
    </div>
  );
}

// Wrapper component that uses AnimateHeight instead of early return
export default function WordSharing(props: WordSharingProps) {
  const { room, currentPlayer } = props;
  const shouldShow = currentPlayer && room.gameState === "discussion";

  return (
    <AnimateHeightSimple open={shouldShow}>
      <WordSharingContent {...props} />
    </AnimateHeightSimple>
  );
}
