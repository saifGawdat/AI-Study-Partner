import React from "react";
import StatsCard from "../components/ui/StatsCard";
import ExamCountdownWidget from "../components/ExamCountdownWidget";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as subjectService from "../api/subject";
import { scheduleApi } from "../api/schedule";
import type { Subject } from "../types/subject";
import LoadingSpinner from "../components/ui/LoadingSpinner";

interface DashboardStats {
  finishedToday: number;
  totalSubjects: number;
  streak: number;
  activityData: { date: string; count: number }[];
}

const SubjectProgress: React.FC<{ subject: Subject }> = ({ subject }) => {
  const { percent } = React.useMemo(() => {
    let total = 0;
    let finished = 0;
    subject.chapters?.forEach((c) => {
      total += c.topics?.length || 0;
      finished += c.topics?.filter((t) => t.finished).length || 0;
    });
    const percent = total === 0 ? 0 : Math.round((finished / total) * 100);
    return { percent };
  }, [subject]);

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
        <div
          className="bg-(--accent-emerald) h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { data: rawSubjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getSubjects,
  });
  const subjects = React.useMemo(() => (Array.isArray(rawSubjects) ? rawSubjects : []), [rawSubjects]);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["schedule-stats"],
    queryFn: scheduleApi.getStatistics,
  });

  const safeStatsData = statsData as unknown as Partial<DashboardStats> | undefined;
  const stats: DashboardStats = {
    finishedToday: safeStatsData?.finishedToday ?? 0,
    totalSubjects: safeStatsData?.totalSubjects ?? 0,
    streak: safeStatsData?.streak ?? 0,
    activityData: Array.isArray(safeStatsData?.activityData) ? safeStatsData.activityData : [],
  };

  const loading = subjectsLoading || statsLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans text-(--text-primary) selection:bg-(--accent-emerald) selection:text-black">
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-white/70 mb-6">
        See your progress and manage your subjects here.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="Today's Progress"
          value={stats.finishedToday.toString()}
          icon={TrendingUp}
          trend="Tasks finished today"
        />
        <StatsCard
          label="Current Streak"
          value={`${stats.streak} Days`}
          icon={Calendar}
          trend={stats.streak > 0 ? "Keep it up!" : "Start today!"}
          help="Your current streak of consecutive days of studying"
        />
        <StatsCard
          label="Active Subjects"
          value={subjects.length.toString()}
          icon={BookOpen}
          trend="Learn more and more!"
        />
      </div>

      {subjects.length > 0 && <ExamCountdownWidget subjects={subjects} />}

      {subjects.length === 0 ? (
        <div className="mt-12 text-center p-12 border border-dashed border-(--border-subtle) rounded-3xl bg-(--bg-surface)/30 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-3 text-white">
            Welcome to your AI Study Partner
          </h2>
          <p className="text-(--text-secondary) mb-8 max-w-md mx-auto leading-relaxed">
            You haven't added any subjects yet. Head over to the subjects page
            to get started with your study plan.
          </p>
          <Link
            to="/subjects"
            className="px-8 py-3 bg-linear-to-r from-(--accent-emerald) to-(--accent-emerald-dark) hover:bg-(--accent-emerald) text-black font-semibold rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.2)] inline-block"
          >
            Add Your First Subject
          </Link>
        </div>
      ) : (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Subjects</h2>
            <Link
              to="/subjects"
              className="text-(--accent-emerald) hover:text-white transition-colors text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.slice(0, 3).map((subject: Subject) => (
              <Link
                key={subject._id}
                to={`/subjects/${subject._id}`}
                className="group block p-6 rounded-2xl bg-[#151515] border border-white/5 hover:border-(--accent-emerald)/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-(--accent-emerald)/10 transition-colors">
                    <BookOpen
                      size={24}
                      className="text-gray-400 group-hover:text-(--accent-emerald) transition-colors"
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium bg-black/40 px-2 py-1 rounded-full border border-white/5">
                    {subject.chapters?.length || 0} Chapters
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-(--accent-emerald) transition-colors">
                  {subject.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {subject.description || "No description provided."}
                </p>
                <SubjectProgress subject={subject} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
