import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { LogOut, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "./Button";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
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
      className="fixed inset-0 z-9999 flex items-center justify-center min-h-screen w-full bg-black/60 backdrop-blur-md opacity-0 pointer-events-none p-4"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#151515] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <LogOut size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">Log out</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-400 leading-relaxed">
            Are you sure you want to log out? You will need to sign in again to
            access your account.
          </p>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            variant="destructive"
          >
            Log out
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LogoutConfirmationModal;
