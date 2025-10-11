"use client";

import { useSessionStore } from "@/lib/stores/session-store";
import Button from "../../../../../components/ui/Button";

export default function LeaveButton() {
  const { clearSession } = useSessionStore();

  return (
    <Button
      onClick={clearSession}
      variant="secondary"
      size="md"
      className="min-h-[44px] flex-shrink-0 px-4"
    >
      Quitter la Salle
    </Button>
  );
}
