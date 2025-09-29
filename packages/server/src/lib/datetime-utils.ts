import * as DateTime from "effect/DateTime";

/**
 * Returns the start of the day for the given date.
 *
 * @category datetime
 */
export const startOfDay = (date: Date) => {
  return DateTime.unsafeFromDate(date).pipe(DateTime.removeTime, DateTime.toDateUtc);
};

/**
 * Returns the start of the next day for the given date.
 *
 * @category datetime
 */
export const startOfNextDay = (date: Date) => {
  return DateTime.unsafeFromDate(date).pipe(
    DateTime.removeTime,
    DateTime.addDuration("1 day"),
    DateTime.toDateUtc,
  );
};

/**
 * Returns the difference in milliseconds between two dates.
 *
 * @category datetime
 */
export const diffInMilliseconds = (dateA: Date, dateB: Date) => {
  if (dateB < dateA) return 0;
  return dateB.getTime() - dateA.getTime();
};
