// tìm ra khoảng thời gian trống trùng nhau giữa 2 user để họ có thể hẹn hò.
/**
 * Convert "HH:MM" to total minutes since midnight
 */
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Find the first overlapping time slot between two sets of availability.
 *
 * Each slot: { date: "YYYY-MM-DD", startTime: "HH:MM", endTime: "HH:MM" }
 *
 * Returns the overlapping slot or null if none found.
 */
const findFirstCommonSlot = (slotsA, slotsB) => {
  // Group B slots by date for faster lookup
  const bByDate = {};
  for (const slot of slotsB) {
    if (!bByDate[slot.date]) bByDate[slot.date] = [];
    bByDate[slot.date].push(slot);
  }

  // Sort A slots by date, then startTime
  const sortedA = [...slotsA].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  for (const slotA of sortedA) {
    const sameDateB = bByDate[slotA.date] || [];

    for (const slotB of sameDateB) {
      const startA = timeToMinutes(slotA.startTime);
      const endA = timeToMinutes(slotA.endTime);
      const startB = timeToMinutes(slotB.startTime);
      const endB = timeToMinutes(slotB.endTime);

      // Find overlap
      const overlapStart = Math.max(startA, startB);
      const overlapEnd = Math.min(endA, endB);

      if (overlapStart < overlapEnd) {
        // Convert back to HH:MM
        const toTime = (mins) => {
          const h = String(Math.floor(mins / 60)).padStart(2, "0");
          const m = String(mins % 60).padStart(2, "0");
          return `${h}:${m}`;
        };

        return {
          date: slotA.date,
          startTime: toTime(overlapStart),
          endTime: toTime(overlapEnd),
        };
      }
    }
  }

  return null;
};

/**
 * Validate that a slot's date is within the next 3 weeks from today.
 */
const isWithinNextThreeWeeks = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeWeeksLater = new Date(today);
  threeWeeksLater.setDate(today.getDate() + 21);

  const date = new Date(dateStr);
  return date >= today && date <= threeWeeksLater;
};

/**
 * Validate start < end for a slot
 */
const isValidSlot = (slot) => {
  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  return start < end && isWithinNextThreeWeeks(slot.date);
};

module.exports = { findFirstCommonSlot, isValidSlot, isWithinNextThreeWeeks };
