import React, { useState, useEffect, useRef } from "react";
import { Plus, BookOpen, Search, Sparkles } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SubjectCard from "../components/subjects/SubjectCard";
import SubjectModal from "../components/subjects/SubjectModal";
import BookImportModal from "../components/subjects/BookImportModal";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import DeleteConfirmationModal from "../components/ui/DeleteConfirmationModal";
import Toast from "../components/ui/Toast";
import type { Subject } from "../types/subject";
import * as subjectService from "../api/subject";

const Subjects: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete Flow State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [deletedSubject, setDeletedSubject] = useState<Subject | null>(null);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: rawSubjects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getSubjects,
  });
  const subjects = React.useMemo(() => (Array.isArray(rawSubjects) ? rawSubjects : []), [rawSubjects]);

  const createMutation = useMutation({
    mutationFn: subjectService.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subject> }) =>
      subjectService.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setIsModalOpen(false);
      setEditingSubject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subjectService.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  const handleCreateSubject = async (subjectData: Partial<Subject>) => {
    try {
      await createMutation.mutateAsync(subjectData);
    } catch (err) {
      console.error("Failed to create subject:", err);
      alert("Failed to create subject");
    }
  };

  const handleUpdateSubject = async (subjectData: Partial<Subject>) => {
    if (!editingSubject || !editingSubject._id) return;
    try {
      await updateMutation.mutateAsync({
        id: editingSubject._id,
        data: subjectData,
      });
    } catch (err) {
      console.error("Failed to update subject:", err);
      alert("Failed to update subject");
    }
  };

  // 1. Trigger Delete Flow
  const handleDeleteClick = React.useCallback((id: string) => {
    setSubjectToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  // 2. Confirm Delete (Optimistic UI Update)
  const handleConfirmDelete = () => {
    if (!subjectToDelete) return;

    const subject = subjects.find((s) => s._id === subjectToDelete);
    if (!subject) return;

    // Close Modal
    setDeleteModalOpen(false);

    // Optimistically update the UI by removing it from the cache
    queryClient.setQueryData<Subject[]>(["subjects"], (prev) =>
      prev?.filter((s) => s._id !== subjectToDelete),
    );

    setDeletedSubject(subject);

    // Show Undo Toast
    setShowUndoToast(true);

    // Set Timer for Actual API Call
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        await deleteMutation.mutateAsync(subjectToDelete);
        console.log("Subject permanently deleted");
      } catch (err) {
        console.error("Failed to delete subject permanently:", err);
        // If permanent delete fails, we should refetch to be safe
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
      }
      setDeletedSubject(null);
      setShowUndoToast(false);
      deleteTimeoutRef.current = null;
    }, 5000); // 5 seconds undo window
  };

  // 3. Undo Delete
  const handleUndoDelete = () => {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }

    if (deletedSubject) {
      // Put it back in the cache
      queryClient.setQueryData<Subject[]>(["subjects"], (prev) => [
        ...(prev || []),
        deletedSubject,
      ]);
      setDeletedSubject(null);
    }

    setShowUndoToast(false);
  };

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const openCreateModal = React.useCallback(() => {
    setEditingSubject(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = React.useCallback((subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  }, []);

  const filteredSubjects = React.useMemo(() => {
    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [subjects, searchQuery]);

  // Stagger animation for cards
  useGSAP(() => {
    if (!isLoading && subjects.length > 0) {
      gsap.from(".subject-card", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, [isLoading, subjects.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            My Subjects
          </h1>
          <p className="text-gray-400">
            Manage your courses and study materials.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <Input
              placeholder="Search subjects..."
              className="pl-10 bg-[#151515] border-white/10 w-full sm:w-64 focus:border-(--accent-emerald)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Sparkles size={20} />
            Import with AI
          </Button>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus size={20} />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage
          message={error instanceof Error ? error.message : "An error occurred"}
          onRetry={() => refetch()}
          className="mx-auto max-w-md mt-12"
        />
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
          <div className="w-16 h-16 bg-(--accent-emerald)/10 rounded-full flex items-center justify-center mx-auto mb-6 text-(--accent-emerald)">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No subjects found
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {searchQuery
              ? "No subjects match your search query."
              : "Get started by adding your first subject to track your progress."}
          </p>
          <Button onClick={openCreateModal}>
            <Plus size={20} className="mr-2" />
            Create New Subject
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <div key={subject._id} className="subject-card">
              <SubjectCard
                subject={subject}
                onEdit={openEditModal}
                onDelete={handleDeleteClick}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modals & Toasts */}
      <SubjectModal
        key={editingSubject?._id || "new"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject}
        initialData={editingSubject}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete "${
          subjects.find((s) => s._id === subjectToDelete)?.name
        }"? This action can be undone for a few seconds.`}
      />

      <BookImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleCreateSubject}
      />

      {showUndoToast && (
        <Toast
          message="Subject deleted"
          onUndo={handleUndoDelete}
          onClose={() => {
            // If closed manually or by timer, visual only.
            // Actual commit is handled by setTimeout.
            // If user clicked X, we assume they accept delete.
            // Logic allows Timer to finish job.
            setShowUndoToast(false);
          }}
          duration={5000}
        />
      )}
    </div>
  );
};

export default Subjects;
