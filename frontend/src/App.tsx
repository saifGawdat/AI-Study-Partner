import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React from "react";
import { Suspense } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Subjects = React.lazy(() => import("./pages/Subjects"));
const Schedule = React.lazy(() => import("./pages/Schedule"));
const Settings = React.lazy(() => import("./pages/Settings"));
const SubjectDetail = React.lazy(() => import("./pages/SubjectDetail"));
const Milestones = React.lazy(() => import("./pages/Milestones"));
import { useAuth } from "./hooks/useAuth";
import DashboardLayout from "./layouts/DashboardLayout";

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10b981]"></div>
  </div>
);

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/subjects"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Subjects />
              </Suspense>
            }
          />
          <Route
            path="/subjects/:id"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <SubjectDetail />
              </Suspense>
            }
          />
          <Route
            path="/schedule"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Schedule />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="/milestones"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Milestones />
              </Suspense>
            }
          />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
