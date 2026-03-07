import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) px-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-(--accent-emerald) opacity-[0.03] blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-(--accent-emerald-dark) opacity-[0.03] blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 p-8 bg-(--bg-surface) rounded-2xl shadow-2xl border border-(--border-subtle) backdrop-blur-xl relative z-10">
        <div>
          <h1 className="text-center text-4xl font-bold bg-linear-to-r from-white via-white to-gray-400 bg-clip-text text-transparent tracking-tight">
            Study Partner
          </h1>
          <h2 className="mt-2 text-center text-lg text-(--text-secondary)">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
