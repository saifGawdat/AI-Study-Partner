import { useEffect, useLayoutEffect, useRef } from "react";
import type { Milestone } from "../api/gamification";

const STORAGE_KEY = "sp_known_milestones";

// Returns array of milestone keys that were NOT unlocked before but ARE now
export function useMilestoneNotifications(
  milestones: Milestone[] | undefined,
  onNewUnlock: (milestone: Milestone) => void,
) {
  // Use a ref so the callback identity never causes a re-run
  const onNewUnlockRef = useRef(onNewUnlock);
  useLayoutEffect(() => {
    onNewUnlockRef.current = onNewUnlock;
  });

  useEffect(() => {
    if (!milestones || milestones.length === 0) return;

    // Load previously known unlocked keys
    let knownUnlocked: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      knownUnlocked = raw ? JSON.parse(raw) : [];
    } catch {
      knownUnlocked = [];
    }

    // Find newly unlocked milestones
    const newlyUnlocked = milestones.filter(
      (m) => m.unlocked && !knownUnlocked.includes(m.key),
    );

    // Persist the full current unlocked set
    const allUnlockedKeys = milestones
      .filter((m) => m.unlocked)
      .map((m) => m.key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUnlockedKeys));

    // Fire notifications for newly unlocked milestones (staggered)
    newlyUnlocked.forEach((milestone, i) => {
      setTimeout(() => {
        onNewUnlockRef.current(milestone);
      }, i * 5000); // Queue each 5s apart
    });
  }, [milestones]);
}
