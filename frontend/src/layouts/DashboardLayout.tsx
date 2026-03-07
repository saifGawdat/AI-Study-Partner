import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  GripHorizontal,
  Trophy,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { usePreferences, type NavigationStyle } from "../hooks/usePreferences";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Antigravity from "../components/reactBits/Antigravity";
import { Menu, X as CloseIcon } from "lucide-react";
import MilestoneUnlockController from "../components/milestones/MilestoneUnlockController";
import LogoutConfirmationModal from "../components/ui/LogoutConfirmationModal";

const DashboardLayout: React.FC = () => {
  const { logout } = useAuth();
  const { navigationStyle } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();

  // For Sidebar mode
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [navigationStyleState, setNavigationStyleState] =
    useState(navigationStyle);

  // Listen for preference changes manually since layouts are often long-lived
  useEffect(() => {
    const handlePreferenceChange = () => {
      const saved = localStorage.getItem("navigationStyle");
      if (saved) setNavigationStyleState(saved as NavigationStyle);
    };
    window.addEventListener("preferenceChange", handlePreferenceChange);
    return () =>
      window.removeEventListener("preferenceChange", handlePreferenceChange);
  }, []);

  const currentNavStyle = navigationStyleState;

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Entrance animation for the dock
  useGSAP(() => {
    gsap.from(navRef.current, {
      y: 100,
      opacity: 0.5,
      duration: 1,
      ease: "power3.out",
      delay: 0.3,
    });
  }, []); // Only run on mount

  // Page transition animation
  useGSAP(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [location.pathname]);

  const handleLogoutClick = () => {
    setIsSidebarOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/subjects", label: "Subjects", icon: BookOpen },
    { path: "/schedule", label: "Schedule", icon: Calendar },
    { path: "/milestones", label: "Milestones", icon: Trophy },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the handle or the container background (not buttons)
    if (
      (e.target as HTMLElement).closest("a") ||
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div className="min-h-screen bg-(--bg-primary) text-white font-sans selection:bg-(--accent-emerald) selection:text-black relative overflow-hidden flex flex-col md:flex-row">
      {/* Antigravity Background */}
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full">
        {React.useMemo(
          () => (
            <Antigravity
              count={isMobile ? 50 : 150}
              magnetRadius={isMobile ? 4 : 6}
              ringRadius={isMobile ? 5 : 7}
              waveSpeed={0.4}
              waveAmplitude={1}
              particleSize={isMobile ? 0.6 : 1.2}
              lerpSpeed={0.05}
              color="#10b981"
              autoAnimate
              particleVariance={1}
              rotationSpeed={0}
              depthFactor={1}
              pulseSpeed={3}
              particleShape="capsule"
              fieldStrength={10}
            />
          ),
          [isMobile],
        )}
      </div>

      {/* Sidebar Navigation (Desktop only) */}
      {currentNavStyle === "sidebar" && (
        <aside className="hidden md:flex flex-col w-64 bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/10 h-screen sticky top-0 z-40 p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">
              SP
            </div>
            <span className="font-bold text-xl tracking-tight">
              Study Partner
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogoutClick}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </aside>
      )}

      {/* Mobile Header (Sidebar mode) */}
      {currentNavStyle === "sidebar" && (
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center font-bold text-black text-[10px]">
              SP
            </div>
            <span className="font-bold text-lg">Study Partner</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-400"
          >
            {isSidebarOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>
        </header>
      )}

      {/* Mobile Menu Overlay (Sidebar mode) */}
      {currentNavStyle === "sidebar" && isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#0a0a0a]/95 p-8 flex flex-col pt-20 animate-in fade-in slide-in-from-top-4 duration-300">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-6 right-6 p-2 text-gray-400"
          >
            <CloseIcon size={32} />
          </button>
          <nav className="space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-6 py-4 rounded-2xl text-xl transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "text-gray-400"
                  }`
                }
              >
                <item.icon size={28} />
                <span className="font-bold">{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl text-xl text-red-500/70"
            >
              <LogOut size={28} />
              <span className="font-bold">Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main
        ref={mainRef}
        className={`flex-1 overflow-y-auto px-4 pt-8 md:pt-12 relative z-10 ${
          currentNavStyle === "dock"
            ? "pb-32 max-w-7xl mx-auto"
            : "pb-12 h-screen"
        }`}
      >
        <Outlet />
      </main>

      {/* Dock Navigation (Legacy Dynamic Island) */}
      {currentNavStyle === "dock" && (
        <div
          className="fixed bottom-3 left-1/2 z-50 cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`,
            touchAction: "none",
          }}
          onMouseDown={handleMouseDown}
        >
          <nav
            ref={navRef}
            className="bg-[#151515]/90 backdrop-blur-xl border border-white/10 rounded-full pl-6 pr-8 md:pl-12 md:pr-16 py-2 md:py-3 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center gap-2 md:gap-4 transition-shadow duration-300 hover:shadow-[0_0_50px_rgba(16,185,129,0.1)] hover:border-white/20 select-none"
          >
            <div className="absolute left-2 text-white/20">
              <GripHorizontal className="w-3 h-3 md:w-4 md:h-4" />
            </div>

            <div className="absolute inset-0 rounded-full bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative group p-2 md:p-3 rounded-full transition-all duration-300 ease-out hover:bg-white/10 ${
                    isActive
                      ? "text-(--accent-emerald) scale-110"
                      : "text-gray-400 hover:text-white hover:scale-110"
                  }`
                }
                draggable={false}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300"
                      strokeWidth={2}
                    />
                    <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-(--bg-surface) border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                      {item.label}
                    </span>
                    <div
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-(--accent-emerald) rounded-full transition-all duration-300 transform ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}

            <div className="w-px h-6 md:h-8 bg-white/10" />

            <button
              onClick={handleLogoutClick}
              className="relative group p-2 md:p-3 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 hover:scale-110 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
              <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-(--bg-surface) border border-white/10 text-red-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                Logout
              </span>
            </button>
          </nav>
        </div>
      )}

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />

      {/* Global milestone unlock notifications */}
      <MilestoneUnlockController />
    </div>
  );
};

export default DashboardLayout;
