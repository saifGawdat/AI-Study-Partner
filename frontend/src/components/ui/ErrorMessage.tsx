import React from "react";
import { AlertCircle } from "lucide-react";
import Button from "./Button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="bg-red-500/20 p-3 rounded-full mb-3">
        <AlertCircle className="text-red-500" size={24} />
      </div>
      <p className="text-red-400 font-medium mb-3">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
