import DailyAvailability, {
  IDailyAvailability,
  ITimeSlot,
} from "../models/DailyAvailability";

export class AvailabilityService {
  // Set or update availability for a specific day
  static async setDailyAvailability(
    userId: string,
    dayOfWeek: number,
    timeSlots: ITimeSlot[],
    isAvailable: boolean = true,
  ): Promise<IDailyAvailability> {
    // Validate time slots
    for (const slot of timeSlots) {
      if (slot.startTime >= slot.endTime) {
        throw new Error("End time must be after start time");
      }
    }

    const availability = await DailyAvailability.findOneAndUpdate(
      { userId, dayOfWeek },
      { timeSlots, isAvailable },
      { new: true, upsert: true },
    );

    return availability!;
  }

  // Get availability for all days
  static async getAllAvailability(
    userId: string,
  ): Promise<IDailyAvailability[]> {
    return await DailyAvailability.find({ userId }).sort({ dayOfWeek: 1 });
  }

  // Get availability for a specific day
  static async getDayAvailability(
    userId: string,
    dayOfWeek: number,
  ): Promise<IDailyAvailability | null> {
    return await DailyAvailability.findOne({ userId, dayOfWeek });
  }

  // Delete availability for a specific day
  static async deleteDayAvailability(
    userId: string,
    dayOfWeek: number,
  ): Promise<void> {
    await DailyAvailability.deleteOne({ userId, dayOfWeek });
  }

  // Calculate total available hours per week
  static async calculateWeeklyHours(userId: string): Promise<number> {
    const availabilities = await this.getAllAvailability(userId);
    let totalMinutes = 0;

    for (const availability of availabilities) {
      if (!availability.isAvailable) continue;

      for (const slot of availability.timeSlots) {
        const [startHour, startMin] = slot.startTime.split(":").map(Number);
        const [endHour, endMin] = slot.endTime.split(":").map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        totalMinutes += endMinutes - startMinutes;
      }
    }

    return totalMinutes / 60; // Convert to hours
  }

  // Get available time slots for a specific date
  static async getAvailableSlots(
    userId: string,
    date: Date,
  ): Promise<ITimeSlot[]> {
    const dayOfWeek = date.getDay();
    const availability = await this.getDayAvailability(userId, dayOfWeek);

    if (!availability || !availability.isAvailable) {
      return [];
    }

    return availability.timeSlots;
  }
}
