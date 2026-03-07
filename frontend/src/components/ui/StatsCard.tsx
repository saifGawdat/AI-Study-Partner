import React from "react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { BsQuestionCircleFill } from "react-icons/bs";


interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  help?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  help,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="relative group rounded-2xl p-px overflow-hidden">
      {/* Spinning Gradient Border - Always Visible */}
      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,var(--accent-emerald)_100%)] animate-spin-slow opacity-100" />

      {/* Card Content - Keeps original hover effects */}
      <div className="relative bg-(--bg-surface) p-6 rounded-2xl h-full border border-(--border-subtle) group-hover:border-transparent transition-colors duration-300 shadow-lg flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-(--text-secondary) text-sm font-medium group-hover:text-(--accent-emerald) transition-colors">
            {label}
          </h3>
          {Icon && (
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-(--accent-emerald)/10 transition-colors">
              <Icon
                size={20}
                className="text-gray-400 group-hover:text-(--accent-emerald) transition-colors"
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1 font-medium">{trend}</p>
          )}
          {help && (
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs text-gray-500 mt-1 font-medium"
            >
              <BsQuestionCircleFill className="text-gray-400 group-hover:text-(--accent-emerald) transition-colors text-xl" />
            </button>
          )}
        </div>
        {help && showHelp && (
          <p className="text-xs text-white mt-1 font-medium">{help}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
