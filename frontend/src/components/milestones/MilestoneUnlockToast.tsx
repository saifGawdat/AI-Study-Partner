import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { X } from "lucide-react";
import type { Milestone } from "../../api/gamification";

interface MilestoneUnlockToastProps {
  milestone: Milestone;
  onDismiss: () => void;
}

const RARITY_CONFIG: Record<
  Milestone["rarity"],
  { label: string; border: string; glow: string; bar: string; text: string }
> = {
  common: {
    label: "Common",
    border: "border-white/20",
    glow: "shadow-[0_0_30px_rgba(255,255,255,0.05)]",
    bar: "bg-gray-400",
    text: "text-gray-400",
  },
  rare: {
    label: "Rare",
    border: "border-blue-500/40",
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.2)]",
    bar: "bg-blue-400",
    text: "text-blue-400",
  },
  epic: {
    label: "Epic",
    border: "border-amber-500/50",
    glow: "shadow-[0_0_50px_rgba(245,158,11,0.25)]",
    bar: "bg-amber-400",
    text: "text-amber-400",
  },
  legendary: {
    label: "Legendary",
    border: "border-emerald-500/60",
    glow: "shadow-[0_0_60px_rgba(16,185,129,0.3)]",
    bar: "bg-emerald-400",
    text: "text-emerald-400",
  },
};

const DISMISS_AFTER = 4500; // ms

const MilestoneUnlockToast: React.FC<MilestoneUnlockToastProps> = ({
  milestone,
  onDismiss,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cfg = RARITY_CONFIG[milestone.rarity];

  useEffect(() => {
    const card = cardRef.current;
    const bar = barRef.current;
    if (!card || !bar) return;

    // Entrance: slide up from bottom with spring bounce
    gsap.fromTo(
      card,
      { y: 120, opacity: 0, scale: 0.85 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.65,
        ease: "back.out(2.2)",
      },
    );

    // Subtle shimmer pulse after entrance
    gsap.to(card, {
      delay: 0.65,
      scale: 1.03,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    });

    // Drain timer bar
    gsap.fromTo(
      bar,
      { scaleX: 1 },
      {
        scaleX: 0,
        duration: DISMISS_AFTER / 1000,
        ease: "none",
        transformOrigin: "left center",
      },
    );

    // Auto dismiss
    const timeout = setTimeout(() => {
      gsap.to(card, {
        y: 40,
        opacity: 0,
        scale: 0.9,
        duration: 0.35,
        ease: "power2.in",
        onComplete: onDismiss,
      });
    }, DISMISS_AFTER);

    return () => clearTimeout(timeout);
  }, [onDismiss]);

  const handleClose = () => {
    gsap.to(cardRef.current, {
      y: 40,
      opacity: 0,
      scale: 0.9,
      duration: 0.28,
      ease: "power2.in",
      onComplete: onDismiss,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`fixed bottom-24 right-5 z-200 w-[320px] bg-[#0d0d0d] border rounded-2xl overflow-hidden ${cfg.border} ${cfg.glow}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Dismiss timer bar */}
      <div ref={barRef} className={`h-0.5 w-full ${cfg.bar} origin-left`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 mb-0.5">
              Achievement Unlocked
            </p>
            <span
              className={`text-[10px] font-semibold uppercase tracking-widest ${cfg.text}`}
            >
              {cfg.label}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-700 hover:text-white transition-colors mt-0.5"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>

        {/* Icon + content */}
        <div className="flex items-center gap-4">
          <div
            className={`text-5xl shrink-0 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]`}
          >
            {milestone.icon}
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">
              {milestone.title}
            </h3>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              {milestone.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneUnlockToast;
