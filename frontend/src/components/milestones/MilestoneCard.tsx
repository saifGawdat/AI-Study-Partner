import React from "react";
import { Lock } from "lucide-react";
import type { Milestone } from "../../api/gamification";

interface MilestoneCardProps {
  milestone: Milestone;
  onClick: (milestone: Milestone) => void;
}

const RARITY_STYLES: Record<
  Milestone["rarity"],
  { border: string; glow: string; badge: string }
> = {
  common: {
    border: "border-white/10 hover:border-white/25",
    glow: "",
    badge: "bg-gray-500/20 text-gray-400",
  },
  rare: {
    border: "border-blue-500/20 hover:border-blue-500/40",
    glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    badge: "bg-blue-500/20 text-blue-400",
  },
  epic: {
    border: "border-amber-500/20 hover:border-amber-500/40",
    glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    badge: "bg-amber-500/20 text-amber-400",
  },
  legendary: {
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    glow: "group-hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]",
    badge: "bg-emerald-500/20 text-emerald-400",
  },
};

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  onClick,
}) => {
  const styles = RARITY_STYLES[milestone.rarity];

  return (
    <button
      onClick={() => onClick(milestone)}
      className={`milestone-card group relative w-full text-left bg-[#0d0d0d] border rounded-xl p-5 transition-all duration-300 cursor-pointer ${styles.border} ${styles.glow}`}
      aria-label={`${milestone.title} milestone — ${milestone.unlocked ? "Unlocked" : "Locked"}`}
    >
      {/* Rarity label */}
      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded ${styles.badge}`}
        >
          {milestone.rarity}
        </span>
        {!milestone.unlocked && (
          <Lock size={13} className="text-gray-600 mt-0.5" />
        )}
      </div>

      {/* Icon */}
      <div className="relative inline-block mb-2 sm:mb-3">
        <span
          className={`text-3xl sm:text-4xl block transition-all duration-300 ${
            milestone.unlocked
              ? ""
              : "grayscale brightness-[0.3] group-hover:brightness-[0.45]"
          }`}
        >
          {milestone.icon}
        </span>
        {milestone.unlocked && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d0d0d]" />
        )}
      </div>

      {/* Title & description */}
      <h3
        className={`font-bold text-xs sm:text-sm mb-1 transition-colors duration-300 ${
          milestone.unlocked
            ? "text-white"
            : "text-gray-600 group-hover:text-gray-500"
        }`}
      >
        {milestone.title}
      </h3>
      <p
        className={`text-xs leading-relaxed ${
          milestone.unlocked ? "text-gray-400" : "text-gray-700"
        }`}
      >
        {milestone.description}
      </p>

      {/* Progress bar */}
      {!milestone.unlocked && (
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-gray-600 mb-1">
            <span>{milestone.current}</span>
            <span>{milestone.threshold}</span>
          </div>
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500/40 rounded-full transition-all duration-700"
              style={{ width: `${milestone.progress}%` }}
            />
          </div>
        </div>
      )}

      {milestone.unlocked && (
        <div className="mt-4 text-[10px] text-emerald-500 font-semibold tracking-wider uppercase">
          ✓ Achieved
        </div>
      )}
    </button>
  );
};

export default MilestoneCard;
