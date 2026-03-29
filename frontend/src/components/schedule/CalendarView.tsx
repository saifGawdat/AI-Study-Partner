import React, { useState } from "react";
import { type Schedule } from "../../api/schedule";
import TaskDifficultyBadge from "../TaskDifficultyBadge";
import { ChevronLeft, ChevronRight, Check, Trash2 } from "lucide-react";

interface CalendarViewProps {
  schedules: Schedule[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTaskClick: (task: Schedule) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskToggle: (taskId: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  schedules: rawSchedules,
  selectedDate,
  onDateSelect,
  onTaskClick,
  onTaskDelete,
  onTaskToggle,
}) => {
  const schedules = React.useMemo(() => (Array.isArray(rawSchedules) ? rawSchedules : []), [rawSchedules]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = React.useMemo(
    () => getDaysInMonth(currentMonth),
    [currentMonth],
  );

  const getTasksForDate = React.useCallback(
    (date: Date) => {
      // Format to YYYY-MM-DD in local time
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      return schedules.filter((s) => s.date.startsWith(dateStr));
    },
    [schedules],
  );

  const selectedTasks = React.useMemo(
    () => getTasksForDate(selectedDate),
    [selectedDate, getTasksForDate],
  );

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleToggleComplete = async (e: React.MouseEvent, task: Schedule) => {
    e.stopPropagation();
    onTaskToggle(task._id);
  };

  const handleDelete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    onTaskDelete(taskId);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNamesShort = ["S", "M", "T", "W", "T", "F", "S"];
  const dayNamesFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch">
      {/* Left Column: Calendar Grid */}
      <div className="flex-[1.2] lg:flex-1 w-full bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col">
        {/* Calendar Header */}
        <div className="p-3 sm:p-4 border-b border-white/5 bg-white/2 flex items-center justify-between shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-400" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="p-2 sm:p-4 flex-1">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1">
            {dayNamesShort.map((day, i) => (
              <div
                key={day + i}
                className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-1"
              >
                <span className="sm:hidden">{dayNamesShort[i]}</span>
                <span className="hidden sm:inline">{dayNamesFull[i]}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[40px] sm:min-h-[60px]"
              />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day,
              );
              const tasks = getTasksForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected =
                date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={day}
                  onClick={() => onDateSelect(date)}
                  className={`min-h-[40px] sm:min-h-[60px] p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/50"
                      : isToday
                        ? "bg-white/5 border-white/10"
                        : "bg-white/2 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={`text-[10px] sm:text-xs font-medium ${
                        isToday ? "text-emerald-500" : "text-white"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="flex-1 mt-0.5 sm:mt-1 space-y-0.5 overflow-hidden">
                      {/* On mobile show dots; on sm+ show labels */}
                      <div className="flex flex-wrap gap-0.5 sm:hidden">
                        {tasks.slice(0, 3).map((task) => (
                          <div
                            key={task._id}
                            className={`w-1 h-1 rounded-full ${
                              task.completed ? "bg-gray-500" : "bg-emerald-500"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="hidden sm:block space-y-0.5">
                        {tasks.slice(0, 2).map((task) => (
                          <div
                            key={task._id}
                            className={`text-[9px] px-1 py-0.5 rounded truncate ${
                              task.completed
                                ? "bg-gray-500/20 text-gray-400 line-through"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {tasks.length > 2 && (
                          <div className="text-[9px] text-gray-500 px-1">
                            +{tasks.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Selected Date Tasks */}
      <div className="flex-1 w-full lg:w-80 bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col max-h-[50vh] lg:max-h-none">
        <div className="p-3 sm:p-4 border-b border-white/5 bg-white/2 shrink-0">
          <h3 className="text-sm sm:text-base font-semibold text-white">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </h3>
          <p className="text-xs text-gray-400">{selectedTasks.length} Tasks</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {selectedTasks.length > 0 ? (
            selectedTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => onTaskClick(task)}
                className="flex items-start gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer transition-all group"
              >
                <button
                  onClick={(e) => handleToggleComplete(e, task)}
                  className={`mt-1 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-500 hover:border-emerald-500"
                  }`}
                >
                  {task.completed && <Check size={10} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      task.completed
                        ? "text-gray-400 line-through"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-gray-500">
                      {task.startTime} - {task.endTime}
                    </p>
                    {task.difficulty && (
                      <TaskDifficultyBadge
                        difficulty={task.difficulty}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, task._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <Check size={20} className="text-gray-600" />
              </div>
              <p className="text-xs text-gray-500">No tasks for this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarView);
