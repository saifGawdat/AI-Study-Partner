import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password);
      navigate("/dashboard");
    } catch {
      // The error state is handled by the useAuth hook
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    const success = await loginWithGoogle(credential);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <AuthLayout title="Create your account">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 rounded-md bg-red-900/50 border border-red-500 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(res) => res.credential && handleGoogleSuccess(res.credential)}
                onError={() => {}}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="280"
              />
            </div>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-(--border-subtle)" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-(--bg-surface) px-4 text-sm font-medium text-(--text-secondary) uppercase tracking-wider">
                  Or sign up with email
                </span>
              </div>
            </div>
          </>
        )}

        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full hover:scale-105 transition-all duration-300 hover:cursor-pointer"
          isLoading={isLoading}
        >
          Sign up
        </Button>
      </form>
      <div className="text-center mt-4">
        <Link
          to="/login"
          className="text-sm font-medium text-(--accent-emerald) hover:text-(--accent-emerald-dark) transition-colors"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Signup;
