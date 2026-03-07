import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Trophy, Flame, CheckCircle, BookOpen } from "lucide-react";
import {
  gamificationApi,
  type Milestone,
  type MilestoneCategory,
} from "../api/gamification";
import MilestoneCard from "../components/milestones/MilestoneCard";
import MilestoneModal from "../components/milestones/MilestoneModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";

type FilterTab = "all" | MilestoneCategory;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "streak", label: "Streaks" },
  { key: "tasks", label: "Tasks" },
  { key: "subjects", label: "Subjects" },
  { key: "rate", label: "Completion" },
];

const MilestonesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null,
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["milestones"],
    queryFn: gamificationApi.getMilestones,
  });

  // Stagger card entrance animation
  useGSAP(() => {
    if (!isLoading && data) {
      gsap.fromTo(
        ".milestone-card",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" },
      );
    }
  }, [isLoading, data, activeFilter]);

  const handleFilterChange = useCallback((tab: FilterTab) => {
    setActiveFilter(tab);
  }, []);

  const filteredMilestones =
    data?.milestones.filter(
      (m) => activeFilter === "all" || m.category === activeFilter,
    ) ?? [];

  const summary = data?.summary;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message="Failed to load milestones."
        onRetry={() => refetch()}
        className="mx-auto max-w-md mt-16"
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy
            size={24}
            className="text-emerald-500 shrink-0"
            strokeWidth={1.5}
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Milestones
          </h1>
        </div>
        <p className="text-gray-500 text-sm ml-9 sm:ml-11">
          Your achievements as a student. Every unlock tells your story.
        </p>
      </div>

      {/* Stats bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
          <StatCell
            icon={<Trophy size={14} />}
            label="Unlocked"
            value={`${summary.unlocked}/${summary.total}`}
          />
          <StatCell
            icon={<Flame size={14} />}
            label="Streak"
            value={`${summary.streak}d`}
          />
          <StatCell
            icon={<CheckCircle size={14} />}
            label="Completed"
            value={String(summary.completedTasks)}
          />
          <StatCell
            icon={<BookOpen size={14} />}
            label="Subjects"
            value={String(summary.subjectCount)}
          />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-6 sm:mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={`px-3 sm:px-4 py-1.5 rounded text-[10px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
              activeFilter === tab.key
                ? "bg-emerald-500 text-black"
                : "bg-white/5 text-gray-500 hover:bg-white/8 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Unlocked section */}
      {filteredMilestones.some((m) => m.unlocked) && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-4">
            Achieved
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredMilestones
              .filter((m) => m.unlocked)
              .map((m) => (
                <MilestoneCard
                  key={m.key}
                  milestone={m}
                  onClick={setSelectedMilestone}
                />
              ))}
          </div>
        </section>
      )}

      {/* Locked section */}
      {filteredMilestones.some((m) => !m.unlocked) && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">
            Locked — click to see how to unlock
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredMilestones
              .filter((m) => !m.unlocked)
              .map((m) => (
                <MilestoneCard
                  key={m.key}
                  milestone={m}
                  onClick={setSelectedMilestone}
                />
              ))}
          </div>
        </section>
      )}

      {filteredMilestones.length === 0 && (
        <div className="text-center py-20 text-gray-600 text-sm">
          No milestones in this category yet.
        </div>
      )}

      <MilestoneModal
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
      />
    </div>
  );
};

// Tiny stat cell — kept inline for minimal footprint
const StatCell: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="bg-[#0d0d0d] border border-white/8 rounded-lg px-3 sm:px-4 py-3">
    <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 mb-1">
      {icon}
      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider truncate">
        {label}
      </span>
    </div>
    <p className="text-white font-bold text-lg sm:text-xl">{value}</p>
  </div>
);

export default MilestonesPage;
