import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "./Button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  isLoading = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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
        { y: 20, opacity: 0, scale: 0.95 },
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
        y: 20,
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen w-full bg-black/60 backdrop-blur-md opacity-0 pointer-events-none p-4"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#151515] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-400 leading-relaxed">{message}</p>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white border-transparent shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteConfirmationModal;
