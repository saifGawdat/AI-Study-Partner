import React, { useState } from "react";
import ReactDOM from "react-dom";
import { scheduleApi } from "../../api/schedule";
import { X, Sparkles, Calendar, Loader } from "lucide-react";
import ErrorMessage from "../ui/ErrorMessage";

interface AIScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: () => void;
}

const AIScheduleModal: React.FC<AIScheduleModalProps> = ({
  isOpen,
  onClose,
  onGenerated,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await scheduleApi.generateSchedule({
        startDate,
        endDate,
      });

      setResult({ message: response.message });
      setTimeout(() => {
        onGenerated();
        onClose();
      }, 2000);
    } catch (err: unknown) {
      console.error("Failed to generate schedule:", err);
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        axiosError.response?.data?.message ||
          "Failed to generate schedule. Make sure you have subjects and availability set.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setResult(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Set default dates (next 7 days)
  if (!startDate) {
    const today = new Date();
    setStartDate(today.toISOString().split("T")[0]);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setEndDate(nextWeek.toISOString().split("T")[0]);
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen w-full p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Sparkles size={20} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                AI Schedule Generator
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Let AI create your study plan
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {result ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Schedule Generated!
              </h3>
              <p className="text-gray-400">{result.message}</p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleGenerate} className="space-y-4">
              {error && <ErrorMessage message={error} className="mb-4" />}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400">
                  <strong>How it works:</strong> AI analyzes your subjects,
                  topics, and availability to create an optimized plan. It
                  automatically determines topic complexity to allocate the
                  right amount of time for each session.
                </p>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  min={startDate}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Prerequisites:</strong>
                  <br />• At least one active subject with topics
                  <br />• Availability settings configured
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AIScheduleModal;
