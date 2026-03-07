import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center border font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "text-black bg-linear-to-r from-(--accent-emerald) to-(--accent-emerald-dark) hover:opacity-90 shadow-[0_0_20px_rgba(16,185,129,0.3)] border-transparent",
    secondary:
      "text-(--accent-emerald) bg-[rgba(16,185,129,0.1)] hover:bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.2)]",
    outline:
      "text-gray-300 border-(--border-subtle) hover:border-(--accent-emerald) hover:text-(--accent-emerald) hover:bg-[rgba(16,185,129,0.05)]",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5 border-transparent",
    destructive: "text-white bg-red-500 hover:bg-red-600 border-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
