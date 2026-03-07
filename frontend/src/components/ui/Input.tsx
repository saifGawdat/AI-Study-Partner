import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-400">
          {label}
        </label>
      )}
      <input
        className={`appearance-none block w-full px-3 py-2 border border-(--border-subtle) rounded-lg shadow-sm placeholder-gray-600 text-white bg-(--bg-card) focus:outline-none focus:ring-2 focus:ring-(--accent-emerald) focus:border-transparent transition-all sm:text-sm ${className} ${error ? "border-red-500 focus:ring-red-500" : ""}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
