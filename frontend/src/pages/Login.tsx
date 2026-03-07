import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    const success = await loginWithGoogle(credential);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <AuthLayout title="Sign in to your account">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 rounded-md bg-red-900/50 border border-red-500 text-red-200 text-sm text-center">
            {error}
          </div>
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
          Sign in
        </Button>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-(--border-subtle)" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-(--bg-surface) px-4 text-sm font-medium text-(--text-secondary) uppercase tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(res) => res.credential && handleGoogleSuccess(res.credential)}
                onError={() => {}}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="full"
              />
            </div>
          </>
        )}
      </form>
      <div className="text-center mt-4">
        <Link
          to="/signup"
          className="text-sm font-medium text-(--accent-emerald) hover:text-(--accent-emerald-dark) transition-colors"
        >
          Don't have an account? Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
