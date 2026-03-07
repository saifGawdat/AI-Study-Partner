import React, { useEffect, useState } from "react";
import { X, Undo2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onUndo?: () => void;
  onClose: () => void;
  duration?: number; // duration in ms
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  onUndo,
  onClose,
  duration = 5000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  // Entrance animation
  useGSAP(() => {
    gsap.fromTo(
      ".toast-container",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.5)" },
    );
  }, []);

  return (
    <div
      className={`toast-container fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#1a1a1a] border pl-6 pr-4 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] min-w-[320px] ${
        type === "error" ? "border-red-500/30" : "border-white/10"
      }`}
    >
      <div
        className={`flex-1 text-sm font-medium ${type === "error" ? "text-red-400" : "text-white"}`}
      >
        {message}
      </div>
      <div className="flex items-center gap-3">
        {type === "success" && onUndo && (
          <button
            onClick={onUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-semibold text-(--accent-emerald) transition-colors border border-white/5 hover:border-(--accent-emerald)/30"
          >
            <Undo2 size={14} />
            Undo
          </button>
        )}
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="12"
              cy="12"
              r="10"
              className="fill-none stroke-white/10"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              className={`fill-none ${type === "error" ? "stroke-red-500" : "stroke-(--accent-emerald)"}`}
              strokeWidth="2"
              strokeDasharray="62.83" // 2 * pi * 10
              strokeDashoffset={62.83 - (progress / 100) * 62.83}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 50ms linear" }}
            />
          </svg>
          <button
            onClick={onClose}
            className="absolute inset-0 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
