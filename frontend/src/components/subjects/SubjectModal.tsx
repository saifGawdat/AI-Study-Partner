import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import { X, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import type {
  Subject,
  Chapter,
  Topic,
  ResourceLink,
} from "../../types/subject";

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: Partial<Subject>) => Promise<void>;
  initialData?: Subject | null;
  isLoading?: boolean;
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [examDate, setExamDate] = useState(
    initialData?.examDate ? initialData.examDate.split("T")[0] : "",
  );
  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>(
    initialData?.resourceLinks?.length ? [...initialData.resourceLinks] : [],
  );
  const [chapters, setChapters] = useState<Chapter[]>(
    initialData?.chapters || [],
  );
  const [expandedChapterIndex, setExpandedChapterIndex] = useState<
    number | null
  >(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Removed useEffect sync as we now use component keys to force remount on data change

  useGSAP(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        pointerEvents: "auto",
        ease: "power2.out",
      });
      gsap.fromTo(
        modalRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
      );
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        pointerEvents: "none",
        ease: "power2.in",
      });
      gsap.to(modalRef.current, {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedChapters = chapters.map((ch) => ({
      ...ch,
      topics: (ch.topics ?? []).map((t) => ({
        ...t,
        resourceLinks: (t.resourceLinks ?? []).filter(
          (l) => l.label?.trim() && l.url?.trim(),
        ),
      })),
    }));
    await onSubmit({
      name,
      description,
      examDate: examDate ? new Date(examDate).toISOString() : null,
      resourceLinks: resourceLinks.filter((l) => l.label.trim() && l.url.trim()),
      chapters: cleanedChapters,
    });
    if (!initialData) {
      setName("");
      setDescription("");
      setExamDate("");
      setResourceLinks([]);
      setChapters([]);
    }
  };

  const handleAddChapter = () => {
    setChapters([...chapters, { name: "", description: "", topics: [] }]);
    setExpandedChapterIndex(chapters.length);
  };

  const handleRemoveChapter = (index: number) => {
    const newChapters = [...chapters];
    newChapters.splice(index, 1);
    setChapters(newChapters);
    if (expandedChapterIndex === index) {
      setExpandedChapterIndex(null);
    }
  };

  const handleChapterChange = (
    index: number,
    field: keyof Chapter,
    value: string,
  ) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setChapters(newChapters);
  };

  const handleAddTopic = (chapterIndex: number) => {
    const newChapters = [...chapters];
    newChapters[chapterIndex].topics.push({
      name: "",
      description: "",
      resourceLinks: [],
    });
    setChapters(newChapters);
  };

  const handleRemoveTopic = (chapterIndex: number, topicIndex: number) => {
    const newChapters = [...chapters];
    newChapters[chapterIndex].topics.splice(topicIndex, 1);
    setChapters(newChapters);
  };

  const handleTopicChange = (
    chapterIndex: number,
    topicIndex: number,
    field: keyof Topic,
    value: string | ResourceLink[],
  ) => {
    const newChapters = [...chapters];
    newChapters[chapterIndex].topics[topicIndex] = {
      ...newChapters[chapterIndex].topics[topicIndex],
      [field]: value,
    };
    setChapters(newChapters);
  };

  const addResourceLink = () => {
    if (resourceLinks.length >= 20) return;
    setResourceLinks([...resourceLinks, { label: "", url: "" }]);
  };

  const updateResourceLink = (index: number, field: "label" | "url", value: string) => {
    const next = [...resourceLinks];
    next[index] = { ...next[index], [field]: value };
    setResourceLinks(next);
  };

  const removeResourceLink = (index: number) => {
    setResourceLinks(resourceLinks.filter((_, i) => i !== index));
  };

  const addTopicResourceLink = (chapterIndex: number, topicIndex: number) => {
    const newChapters = [...chapters];
    const topic = newChapters[chapterIndex].topics[topicIndex];
    const links = topic.resourceLinks ?? [];
    if (links.length >= 20) return;
    newChapters[chapterIndex].topics[topicIndex] = {
      ...topic,
      resourceLinks: [...links, { label: "", url: "" }],
    };
    setChapters(newChapters);
  };

  const updateTopicResourceLink = (
    chapterIndex: number,
    topicIndex: number,
    linkIndex: number,
    field: "label" | "url",
    value: string,
  ) => {
    const newChapters = [...chapters];
    const topic = newChapters[chapterIndex].topics[topicIndex];
    const links = [...(topic.resourceLinks ?? [])];
    links[linkIndex] = { ...links[linkIndex], [field]: value };
    newChapters[chapterIndex].topics[topicIndex] = {
      ...topic,
      resourceLinks: links,
    };
    setChapters(newChapters);
  };

  const removeTopicResourceLink = (
    chapterIndex: number,
    topicIndex: number,
    linkIndex: number,
  ) => {
    const newChapters = [...chapters];
    const topic = newChapters[chapterIndex].topics[topicIndex];
    const links = (topic.resourceLinks ?? []).filter((_, i) => i !== linkIndex);
    newChapters[chapterIndex].topics[topicIndex] = {
      ...topic,
      resourceLinks: links,
    };
    setChapters(newChapters);
  };

  const toggleChapter = (index: number) => {
    setExpandedChapterIndex(expandedChapterIndex === index ? null : index);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen w-full bg-black/60 backdrop-blur-md opacity-0 pointer-events-none p-4"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[#151515] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? "Edit Subject" : "Add New Subject"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col grow overflow-hidden"
        >
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar grow">
            {/* Subject Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Subject Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mathematics"
                  required
                  className="bg-black/20 border-white/10 focus:border-(--accent-emerald)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the subject..."
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-(--accent-emerald) focus:ring-1 focus:ring-(--accent-emerald) transition-all duration-200 resize-none h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Exam Date (Optional)
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-(--accent-emerald) focus:ring-1 focus:ring-(--accent-emerald) transition-all duration-200"
                />
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-white">
                  Notes & resources
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addResourceLink}
                  disabled={resourceLinks.length >= 20}
                  className="text-(--accent-emerald) hover:text-(--accent-emerald-dark)"
                >
                  <Plus size={16} className="mr-1" /> Add link
                </Button>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Add URLs to notes, slides, or resources for quick access during study.
              </p>
              <div className="space-y-2">
                {resourceLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-center bg-black/20 border border-white/5 rounded-lg p-2"
                  >
                    <Input
                      placeholder="Label (e.g. Lecture slides)"
                      value={link.label}
                      onChange={(e) =>
                        updateResourceLink(index, "label", e.target.value)
                      }
                      className="bg-black/40 border-white/5 flex-1 text-sm"
                    />
                    <Input
                      placeholder="https://..."
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        updateResourceLink(index, "url", e.target.value)
                      }
                      className="bg-black/40 border-white/5 flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeResourceLink(index)}
                      className="text-gray-500 hover:text-red-400 p-1 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {resourceLinks.length === 0 && (
                  <p className="text-xs text-gray-500 italic">
                    No links yet. Add notes or resource URLs for this subject.
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Chapters</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddChapter}
                  className="text-(--accent-emerald) hover:text-(--accent-emerald-dark)"
                >
                  <Plus size={16} className="mr-1" /> Add Chapter
                </Button>
              </div>

              <div className="space-y-4">
                {chapters.map((chapter, chapterIndex) => (
                  <div
                    key={chapterIndex}
                    className="bg-black/20 border border-white/5 rounded-xl overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleChapter(chapterIndex)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedChapterIndex === chapterIndex ? (
                          <ChevronDown size={16} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                        <span className="font-medium text-gray-200">
                          {chapter.name || `Chapter ${chapterIndex + 1}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveChapter(chapterIndex);
                        }}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {expandedChapterIndex === chapterIndex && (
                      <div className="p-4 border-t border-white/5 space-y-4 bg-black/20">
                        <Input
                          placeholder="Chapter Name"
                          value={chapter.name}
                          onChange={(e) =>
                            handleChapterChange(
                              chapterIndex,
                              "name",
                              e.target.value,
                            )
                          }
                          className="bg-black/40 border-white/5"
                        />
                        <textarea
                          placeholder="Chapter Description"
                          value={chapter.description}
                          onChange={(e) =>
                            handleChapterChange(
                              chapterIndex,
                              "description",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-(--accent-emerald) resize-none h-16 text-sm"
                        />

                        {/* Topics */}
                        <div className="pl-4 border-l border-white/10 mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-400">
                              Topics
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleAddTopic(chapterIndex)}
                              className="text-xs text-(--accent-emerald) hover:text-(--accent-emerald-dark) flex items-center"
                            >
                              <Plus size={12} className="mr-1" /> Add Topic
                            </button>
                          </div>

                          <div className="space-y-3">
                            {chapter.topics.map((topic, topicIndex) => (
                              <div
                                key={topicIndex}
                                className="flex gap-2 items-start"
                              >
                                <div className="grow space-y-2">
                                  <Input
                                    placeholder="Topic Name"
                                    value={topic.name}
                                    onChange={(e) =>
                                      handleTopicChange(
                                        chapterIndex,
                                        topicIndex,
                                        "name",
                                        e.target.value,
                                      )
                                    }
                                    className="bg-black/40 border-white/5 text-sm py-1.5"
                                  />
                                  <textarea
                                    placeholder="Topic Description"
                                    value={topic.description}
                                    onChange={(e) =>
                                      handleTopicChange(
                                        chapterIndex,
                                        topicIndex,
                                        "description",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-(--accent-emerald) resize-none h-12 text-sm"
                                  />
                                  {(topic.resourceLinks?.length ?? 0) > 0 && (
                                    <div className="mt-2 pl-2 border-l border-white/10 space-y-1">
                                      <span className="text-xs text-gray-500">
                                        Resources
                                      </span>
                                      {(topic.resourceLinks ?? []).map(
                                        (link, linkIndex) => (
                                          <div
                                            key={linkIndex}
                                            className="flex gap-1 items-center"
                                          >
                                            <Input
                                              placeholder="Label"
                                              value={link.label}
                                              onChange={(e) =>
                                                updateTopicResourceLink(
                                                  chapterIndex,
                                                  topicIndex,
                                                  linkIndex,
                                                  "label",
                                                  e.target.value,
                                                )
                                              }
                                              className="bg-black/40 border-white/5 text-xs py-1 flex-1"
                                            />
                                            <Input
                                              placeholder="URL"
                                              type="url"
                                              value={link.url}
                                              onChange={(e) =>
                                                updateTopicResourceLink(
                                                  chapterIndex,
                                                  topicIndex,
                                                  linkIndex,
                                                  "url",
                                                  e.target.value,
                                                )
                                              }
                                              className="bg-black/40 border-white/5 text-xs py-1 flex-1"
                                            />
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeTopicResourceLink(
                                                  chapterIndex,
                                                  topicIndex,
                                                  linkIndex,
                                                )
                                              }
                                              className="text-gray-500 hover:text-red-400 p-0.5"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addTopicResourceLink(
                                        chapterIndex,
                                        topicIndex,
                                      )
                                    }
                                    className="text-xs text-(--accent-emerald) hover:text-(--accent-emerald-dark) mt-1"
                                  >
                                    + Add resource link
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveTopic(chapterIndex, topicIndex)
                                  }
                                  className="text-gray-500 hover:text-red-400 p-1 mt-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 shrink-0 flex justify-end gap-3 bg-[#151515]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {initialData ? "Save Changes" : "Create Subject"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default SubjectModal;
