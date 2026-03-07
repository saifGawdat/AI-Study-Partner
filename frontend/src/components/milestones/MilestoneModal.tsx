import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { X, Lock, CheckCircle } from "lucide-react";
import type { Milestone } from "../../api/gamification";
import gsap from "gsap";

interface MilestoneModalProps {
  milestone: Milestone | null;
  onClose: () => void;
}

const RARITY_COLOR: Record<Milestone["rarity"], string> = {
  common: "text-gray-400",
  rare: "text-blue-400",
  epic: "text-amber-400",
  legendary: "text-emerald-400",
};

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  milestone,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!milestone) return;

    // Spring-like entrance
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" },
    );
    gsap.fromTo(
      panelRef.current,
      { scale: 0.92, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.6)" },
    );
  }, [milestone]);

  const handleClose = () => {
    gsap.to(panelRef.current, {
      scale: 0.94,
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: "power2.in",
      onComplete: onClose,
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
  };

  if (!milestone) return null;

  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen w-full p-4 bg-black/70 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className="relative bg-[#0f0f0f] border border-white/10 rounded-xl w-full max-w-sm mx-4 sm:mx-0 p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <span
            className={`text-5xl block ${
              milestone.unlocked ? "" : "grayscale brightness-[0.4]"
            }`}
          >
            {milestone.icon}
          </span>
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-widest mb-1 ${
                RARITY_COLOR[milestone.rarity]
              }`}
            >
              {milestone.rarity} — {milestone.category}
            </p>
            <h2 className="text-white font-bold text-xl leading-tight">
              {milestone.title}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {milestone.description}
            </p>
          </div>
        </div>

        {/* Status banner */}
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg mb-6 ${
            milestone.unlocked
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-white/3 border border-white/8"
          }`}
        >
          {milestone.unlocked ? (
            <>
              <CheckCircle size={16} className="text-emerald-500 shrink-0" />
              <span className="text-emerald-400 text-sm font-medium">
                Achievement Unlocked
              </span>
            </>
          ) : (
            <>
              <Lock size={16} className="text-gray-500 shrink-0" />
              <span className="text-gray-500 text-sm">
                {milestone.current} / {milestone.threshold} progress
              </span>
            </>
          )}
        </div>

        {/* How to achieve */}
        {!milestone.unlocked && (
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
              How to unlock
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {milestone.howTo}
            </p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500/50 rounded-full transition-all duration-700"
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
              <p className="text-right text-[10px] text-gray-600 mt-1">
                {milestone.progress}% there
              </p>
            </div>
          </div>
        )}

        {milestone.unlocked && (
          <p className="text-gray-500 text-sm leading-relaxed">
            {milestone.howTo}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default MilestoneModal;
