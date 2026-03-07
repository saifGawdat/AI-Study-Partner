import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "./ui/Button";
import Input from "./ui/Input";

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
  isLoading?: boolean;
}

const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  isLoading = false,
}) => {
  const [confirmationEmail, setConfirmationEmail] = useState("");
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

  const isConfirmed = confirmationEmail === userEmail;

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen w-full bg-black/80 backdrop-blur-md opacity-0 pointer-events-none p-4"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#0a0a0a] border border-red-500/20 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">Delete Account</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-gray-300">
              This action is{" "}
              <span className="text-red-500 font-bold uppercase">
                permanent
              </span>
              . All your subjects, chapters, and progress will be deleted
              forever.
            </p>
            <p className="text-gray-400 text-sm">
              Please type your email{" "}
              <span className="text-white font-mono">{userEmail}</span> to
              confirm.
            </p>
          </div>

          <Input
            value={confirmationEmail}
            onChange={(e) => setConfirmationEmail(e.target.value)}
            placeholder="Type your email here"
            className="bg-black border-red-500/20 focus:border-red-500/50"
            disabled={isLoading}
          />
        </div>

        <div className="p-6 border-t border-white/5 flex flex-col gap-3">
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={!isConfirmed || isLoading}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${isConfirmed ? "bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white" : "bg-white/5 text-gray-500 cursor-not-allowed"}`}
          >
            Delete Everything Forever
          </Button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors py-2"
            disabled={isLoading}
          >
            Wait, I changed my mind
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AccountDeletionModal;
