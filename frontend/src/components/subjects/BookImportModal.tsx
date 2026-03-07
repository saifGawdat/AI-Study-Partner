import React, { useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { X, Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import type { Subject } from "../../types/subject";
import type { ExtractedSubject } from "../../api/ai";

interface BookImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (subject: Partial<Subject>) => void;
}

const BookImportModal: React.FC<BookImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedSubject | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or image file");
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError("File size must be less than 25MB");
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { extractBookStructure } = await import("../../api/ai");
      const extracted = await extractBookStructure(file);
      setExtractedData(extracted);
    } catch (err: unknown) {
      console.error("Extraction error:", err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosError.response?.data?.message ||
        "Failed to extract book structure. Please try again.";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!extractedData) return;

    // Convert ExtractedSubject to Subject format
    const subjectData: Partial<Subject> = {
      name: extractedData.name,
      description: extractedData.description,
      chapters: extractedData.chapters.map((chapter) => ({
        name: chapter.name,
        description: "", // Add empty description for chapters
        topics: chapter.topics.map((topic) => ({
          name: topic.name,
          description: "", // Add empty description for topics
          finished: false,
        })),
      })),
    };

    onImport(subjectData);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setExtractedData(null);
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen w-full bg-black/60 backdrop-blur-md p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-(--accent-emerald)/10">
              <Sparkles className="text-(--accent-emerald)" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Import with AI</h2>
              <p className="text-sm text-gray-400">
                Upload a textbook and let AI extract the structure
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!extractedData ? (
            <>
              {/* File Upload */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragging
                    ? "border-(--accent-emerald) bg-(--accent-emerald)/5"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-white/5">
                    <Upload className="text-gray-400" size={32} />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">
                      Drop your textbook here
                    </p>
                    <p className="text-sm text-gray-400">
                      or click to browse (PDF, JPG, PNG, WEBP - max 25MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) handleFileSelect(selectedFile);
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-(--accent-emerald)" size={20} />
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleExtract}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Extract
                      </>
                    )}
                  </Button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Preview Extracted Data */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subject Name
                  </label>
                  <Input
                    value={extractedData.name}
                    onChange={(e) =>
                      setExtractedData({
                        ...extractedData,
                        name: e.target.value,
                      })
                    }
                    className="bg-[#151515] border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={extractedData.description}
                    onChange={(e) =>
                      setExtractedData({
                        ...extractedData,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-[#151515] border border-white/10 rounded-xl p-3 text-white resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Chapters ({extractedData.chapters.length})
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {extractedData.chapters.map((chapter, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/5 rounded-xl border border-white/5"
                      >
                        <p className="text-white font-medium mb-2">
                          {chapter.name}
                        </p>
                        <div className="pl-4 space-y-1">
                          {chapter.topics.map((topic, topicIdx) => (
                            <p key={topicIdx} className="text-sm text-gray-400">
                              • {topic.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {extractedData && (
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-2"
            >
              <Sparkles size={16} />
              Create Subject
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default BookImportModal;
