import React from "react";
import { Edit2, Trash2, ArrowRight } from "lucide-react";
import type { Subject } from "../../types/subject";
import { Link } from "react-router-dom";

interface SubjectCardProps {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onEdit,
  onDelete,
}) => {
  const stats = React.useMemo(() => {
    let totalTopics = 0;
    let finishedTopics = 0;
    subject.chapters?.forEach((c) => {
      totalTopics += c.topics?.length || 0;
      finishedTopics += c.topics?.filter((t) => t.finished).length || 0;
    });

    const percent =
      totalTopics === 0 ? 0 : Math.round((finishedTopics / totalTopics) * 100);

    return { totalTopics, finishedTopics, percent };
  }, [subject.chapters]);

  return (
    <div className="group relative rounded-2xl p-px overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
      {/* Animated Border Gradient */}
      <div className="absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#333333_100%)] group-hover:bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,var(--accent-emerald)_100%)] animate-spin-slow opacity-100 transition-all duration-500" />

      <div className="relative h-full bg-[#0f0f0f] rounded-2xl p-6 border border-white/5 flex flex-col group-hover:border-transparent transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-(--accent-emerald)/10 transition-colors duration-300">
            <div className="w-6 h-6 rounded-lg bg-linear-to-br from-gray-600 to-gray-800 group-hover:from-(--accent-emerald) group-hover:to-(--accent-emerald-dark) transition-all duration-300" />
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit(subject);
              }}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Edit Subject"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (subject._id) onDelete(subject._id);
              }}
              className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete Subject"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-(--accent-emerald) transition-colors">
              {subject.name}
            </h3>
            <span className="text-xs text-gray-500 font-medium bg-black/40 px-2 py-1 rounded-full border border-white/5 whitespace-nowrap">
              {subject.chapters.length} Chapters
            </span>
          </div>

          <p className="text-gray-400 text-sm line-clamp-2 mb-6">
            {subject.description || "No description provided."}
          </p>

          <div className="mt-auto mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{stats.percent}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-(--accent-emerald) h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stats.percent}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-xs text-gray-500 font-medium">
            {subject.chapters?.length || 0} Chapters
          </span>

          <Link
            to={`/subjects/${subject._id}`}
            className="flex items-center gap-2 text-sm text-gray-300 group-hover:text-white font-medium transition-colors"
          >
            Open Subject
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SubjectCard);
