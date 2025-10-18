import type { TaskFrequency } from "@org/domain/Enums";
import * as DateTime from "effect/DateTime";

export const calculateNextDate = (frequency: TaskFrequency, current: Date | string): Date => {
  const dateTime = DateTime.unsafeFromDate(new Date(current)).pipe(DateTime.removeTime);

  switch (frequency) {
    case "daily":
      return dateTime.pipe(DateTime.add({ days: 1 }), DateTime.toDateUtc);
    case "weekly":
      return dateTime.pipe(DateTime.add({ weeks: 1 }), DateTime.toDateUtc);
    case "monthly":
      return dateTime.pipe(DateTime.add({ months: 1 }), DateTime.toDateUtc);
    default:
      return dateTime.pipe(DateTime.toDateUtc);
  }
};

export const calculatePrevDate = (frequency: TaskFrequency, current: Date): Date => {
  const dateTime = DateTime.unsafeFromDate(current).pipe(DateTime.removeTime);

  switch (frequency) {
    case "daily":
      return dateTime.pipe(DateTime.add({ days: -1 }), DateTime.toDateUtc);
    case "weekly":
      return dateTime.pipe(DateTime.add({ weeks: -1 }), DateTime.toDateUtc);
    case "monthly":
      return dateTime.pipe(DateTime.add({ months: -1 }), DateTime.toDateUtc);
    default:
      return dateTime.pipe(DateTime.toDateUtc);
  }
};
