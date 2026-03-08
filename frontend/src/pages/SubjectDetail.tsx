import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, BookOpen, Link2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Subject } from "../types/subject";
import * as subjectService from "../api/subject";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";

const SubjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: subject,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subject", id],
    queryFn: () => subjectService.getSubject(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedSubject: Subject) =>
      subjectService.updateSubject(id!, updatedSubject),
    onSuccess: () => {
      // Invalidate both the list and the specific item
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject", id] });
      // Also invalidate stats because progress changed
      queryClient.invalidateQueries({ queryKey: ["schedule-stats"] });
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/subjects")}
          className="mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Subjects
        </Button>
        <ErrorMessage
          message={error instanceof Error ? error.message : "Subject not found"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const handleToggleChapter = async (chapterIndex: number) => {
    if (!subject) return;

    const newSubject = { ...subject };
    const chapter = newSubject.chapters[chapterIndex];
    chapter.finished = !chapter.finished;

    updateMutation.mutate(newSubject);
  };

  const handleToggleTopic = async (
    chapterIndex: number,
    topicIndex: number,
  ) => {
    if (!subject) return;

    const newSubject = { ...subject };
    const topic = newSubject.chapters[chapterIndex].topics[topicIndex];
    topic.finished = !topic.finished;

    updateMutation.mutate(newSubject);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      <Button
        variant="ghost"
        onClick={() => navigate("/subjects")}
        className="mb-6 pl-0 hover:bg-transparent text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Subjects
      </Button>

      {/* Subject header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {subject.name}
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          {subject.description || "No description provided."}
        </p>
      </div>

      {/* Subject resources — top of page, instant access */}
      {(subject.resourceLinks?.length ?? 0) > 0 && (
        <div className="mb-10">
          <div className="bg-linear-to-br from-[#151515] to-[#0f0f0f] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-(--accent-emerald)/10 border border-(--accent-emerald)/20">
                <BookOpen size={22} className="text-(--accent-emerald)" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  Quick access
                </h2>
                <p className="text-sm text-gray-500">
                  Notes and resources for this subject
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subject.resourceLinks!.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/10 hover:border-(--accent-emerald)/30 hover:bg-white/6 transition-all duration-200"
                >
                  <div className="shrink-0 p-2 rounded-lg bg-white/5 group-hover:bg-(--accent-emerald)/10 transition-colors">
                    <Link2 size={16} className="text-gray-400 group-hover:text-(--accent-emerald)" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-(--accent-emerald) transition-colors truncate">
                    {link.label || "Link"}
                  </span>
                  <ExternalLink size={14} className="shrink-0 ml-auto text-gray-500 group-hover:text-(--accent-emerald)" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chapters and topic resources below */}
      <div className="bg-[#151515] rounded-3xl p-8 border border-white/5">
        <h2 className="text-xl font-semibold text-white mb-4">Chapters</h2>
          {subject.chapters && subject.chapters.length > 0 ? (
            <div className="space-y-4">
              {subject.chapters.map((chapter, cIndex) => (
                <div
                  key={cIndex}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    chapter.finished
                      ? "bg-(--accent-emerald)/10 border-(--accent-emerald)/30"
                      : "bg-black/20 border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={`text-lg font-medium transition-colors ${
                          chapter.finished
                            ? "text-(--accent-emerald)"
                            : "text-white"
                        }`}
                      >
                        {chapter.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {chapter.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={chapter.finished || false}
                      onChange={() => handleToggleChapter(cIndex)}
                      className="w-5 h-5 rounded border-gray-600 text-(--accent-emerald) focus:ring-(--accent-emerald) bg-gray-700"
                    />
                  </div>

                  {/* Topics List */}
                  {chapter.topics && chapter.topics.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Topics
                      </h4>
                      <div className="grid gap-3">
                        {chapter.topics.map((topic, tIndex) => (
                          <div
                            key={tIndex}
                            className={`p-3 rounded-lg transition-colors flex items-center justify-between group ${
                              topic.finished
                                ? "bg-(--accent-emerald)/5"
                                : "bg-white/5 hover:bg-white/10"
                            }`}
                            onClick={() => handleToggleTopic(cIndex, tIndex)}
                          >
                            <div className="min-w-0 flex-1">
                              <h5
                                className={`text-sm font-medium transition-colors ${
                                  topic.finished
                                    ? "text-(--accent-emerald) line-through opacity-70"
                                    : "text-gray-200"
                                }`}
                              >
                                {topic.name}
                              </h5>
                              {topic.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {topic.description}
                                </p>
                              )}
                              {(topic.resourceLinks?.length ?? 0) > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {topic.resourceLinks!.map((link, li) => (
                                    <a
                                      key={li}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-xs text-(--accent-emerald) hover:underline"
                                    >
                                      <ExternalLink size={10} />
                                      {link.label || "Link"}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="relative flex items-center justify-center w-5 h-5 border border-white/20 rounded-full group-hover:border-white/40 transition-colors">
                              {topic.finished && (
                                <div className="w-3 h-3 bg-(--accent-emerald) rounded-full" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No chapters added yet.</p>
          )}
      </div>
    </div>
  );
};

export default SubjectDetail;
