import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  availabilityApi,
  type DailyAvailability,
  type TimeSlot,
} from "../../api/availability";
import { X, Plus, Trash2, Clock } from "lucide-react";
import ErrorMessage from "../ui/ErrorMessage";
import DeleteConfirmationModal from "../ui/DeleteConfirmationModal";

interface AvailabilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availability: DailyAvailability[];
  onSave: () => void;
}

const AvailabilityPanel: React.FC<AvailabilityPanelProps> = ({
  isOpen,
  onClose,
  availability,
  onSave,
}) => {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dayToDelete, setDayToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getDayAvailability = (day: number): DailyAvailability | undefined => {
    return availability.find((a) => a.dayOfWeek === day);
  };

  const handleEditDay = (day: number) => {
    const dayAvail = getDayAvailability(day);
    setEditingDay(day);
    setError(null);
    if (dayAvail) {
      setTimeSlots(dayAvail.timeSlots);
      setIsAvailable(dayAvail.isAvailable);
    } else {
      setTimeSlots([{ startTime: "09:00", endTime: "17:00" }]);
      setIsAvailable(true);
    }
  };

  const handleAddSlot = () => {
    setTimeSlots([...timeSlots, { startTime: "09:00", endTime: "17:00" }]);
  };

  const handleRemoveSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleSlotChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const handleSave = async () => {
    if (editingDay === null) return;
    setError(null);

    try {
      await availabilityApi.setAvailability({
        dayOfWeek: editingDay,
        timeSlots,
        isAvailable,
      });
      onSave();
      setEditingDay(null);
    } catch (err: unknown) {
      console.error("Failed to save availability:", err);
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        axiosError.response?.data?.message || "Failed to save availability",
      );
    }
  };

  const handleDelete = (day: number) => {
    setDayToDelete(day);
  };

  const confirmDelete = async () => {
    if (dayToDelete === null) return;
    setIsDeleting(true);

    try {
      await availabilityApi.deleteAvailability(dayToDelete);
      onSave();
      setDayToDelete(null);
    } catch (error) {
      console.error("Failed to delete availability:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen w-full p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">
              Weekly Availability
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Set your available time slots for each day
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {editingDay !== null ? (
            /* Edit Mode */
            <div className="space-y-3">
              {error && <ErrorMessage message={error} className="mb-4" />}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">
                  {dayNames[editingDay]}
                </h3>
                <button
                  onClick={() => setEditingDay(null)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  ← Back
                </button>
              </div>

              {/* Available Toggle */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <input
                  type="checkbox"
                  id="available"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-500 text-emerald-500 focus:ring-emerald-500"
                />
                <label
                  htmlFor="available"
                  className="text-sm text-white font-medium"
                >
                  I'm available on this day
                </label>
              </div>

              {/* Time Slots */}
              {isAvailable && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-400">
                      Time Slots
                    </label>
                    <button
                      onClick={handleAddSlot}
                      className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400"
                    >
                      <Plus size={14} />
                      Add Slot
                    </button>
                  </div>

                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-white/5 rounded-xl"
                    >
                      <Clock size={14} className="text-gray-400" />
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          handleSlotChange(index, "startTime", e.target.value)
                        }
                        className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                      <span className="text-xs text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          handleSlotChange(index, "endTime", e.target.value)
                        }
                        className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                      {timeSlots.length > 1 && (
                        <button
                          onClick={() => handleRemoveSlot(index)}
                          className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingDay(null)}
                  className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            /* List Mode */
            <div className="space-y-1.5">
              {dayNames.map((day, index) => {
                const dayAvail = getDayAvailability(index);
                const hasSlots = dayAvail && dayAvail.timeSlots.length > 0;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors group"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{day}</p>
                      {hasSlots && dayAvail.isAvailable ? (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {dayAvail.timeSlots
                            .map((s) => `${s.startTime}-${s.endTime}`)
                            .join(", ")}
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Not available
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {hasSlots && (
                        <button
                          onClick={() => handleDelete(index)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditDay(index)}
                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors text-xs font-medium"
                      >
                        {hasSlots ? "Edit" : "Set"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={dayToDelete !== null}
        onClose={() => setDayToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove Availability"
        message={`Are you sure you want to remove all availability for ${dayToDelete !== null ? dayNames[dayToDelete] : ""}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>,
    document.body,
  );
};

export default AvailabilityPanel;
