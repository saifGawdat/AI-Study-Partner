import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/auth";
import AccountDeletionModal from "../components/AccountDeletionModal";
import {
  User,
  ShieldAlert,
  Mail,
  Globe,
  Clock,
  Trash2,
  Layout,
  Monitor,
  MousePointer2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../hooks/usePreferences";

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { navigationStyle, setNavigationStyle } = usePreferences();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authApi.deleteAccount();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Appearance Section */}
        <section className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 bg-white/2 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Layout size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">Appearance</h2>
          </div>
          <div className="p-8">
            <h3 className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-4">
              Navigation Style
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setNavigationStyle("dock")}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                  navigationStyle === "dock"
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    : "bg-white/2 border-white/5 hover:border-white/10"
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${navigationStyle === "dock" ? "bg-emerald-500 text-white" : "bg-white/5 text-gray-400"}`}
                >
                  <MousePointer2 size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white mb-1">Dynamic Island</p>
                  <p className="text-sm text-gray-400">
                    Floating dock that can be dragged anywhere.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setNavigationStyle("sidebar")}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                  navigationStyle === "sidebar"
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    : "bg-white/2 border-white/5 hover:border-white/10"
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${navigationStyle === "sidebar" ? "bg-emerald-500 text-white" : "bg-white/5 text-gray-400"}`}
                >
                  <Monitor size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white mb-1">
                    Traditional Sidebar
                  </p>
                  <p className="text-sm text-gray-400">
                    Static sidebar for desktop and bottom nav for mobile.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Profile Section */}
        <section className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 bg-white/2 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <User size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Profile Information
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/2 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl text-gray-400">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-lg text-white font-medium">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl text-gray-400">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                    Timezone
                  </p>
                  <p className="text-white font-medium">{user.timezone}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl text-gray-400">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                    Availability
                  </p>
                  <p className="text-white font-medium">
                    {user.availability?.weekdayMinutes ?? 0}m Weekdays /{" "}
                    {user.availability?.weekendMinutes ?? 0}m Weekends
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/2 border border-red-500/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-red-500/10 bg-red-500/3 flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-xl text-red-500">
              <ShieldAlert size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Delete Account</h3>
                <p className="text-gray-400 text-sm max-w-md">
                  Once you delete your account, there is no going back. Please
                  be certain. All your data will be wiped from our servers
                  immediately.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl transition-all duration-300 border border-red-500/20 group"
              >
                <Trash2
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>

      <AccountDeletionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        userEmail={user.email}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Settings;
