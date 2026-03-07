import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { gamificationApi, type Milestone } from "../../api/gamification";
import { useMilestoneNotifications } from "../../hooks/useMilestoneNotifications";
import MilestoneUnlockToast from "./MilestoneUnlockToast";

// Mounted once in DashboardLayout — watches milestones and renders toasts
const MilestoneUnlockController: React.FC = () => {
  const [queue, setQueue] = useState<Milestone[]>([]);

  const { data } = useQuery({
    queryKey: ["milestones"],
    queryFn: gamificationApi.getMilestones,
    // Poll every 30s so we catch unlocks across sessions
    refetchInterval: 30_000,
  });

  const handleNewUnlock = useCallback((milestone: Milestone) => {
    setQueue((prev) => [...prev, milestone]);
  }, []);

  useMilestoneNotifications(data?.milestones, handleNewUnlock);

  const handleDismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  // Render only the first in queue — the hook staggers firings over time
  const current = queue[0];
  if (!current) return null;

  return (
    <MilestoneUnlockToast
      key={current.key}
      milestone={current}
      onDismiss={handleDismiss}
    />
  );
};

export default MilestoneUnlockController;
