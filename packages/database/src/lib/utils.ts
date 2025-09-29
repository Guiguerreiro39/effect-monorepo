import * as DateTime from "effect/DateTime";
import { constant } from "effect/Function";

export const utcNow = constant(DateTime.toDateUtc(DateTime.unsafeNow()));
export const utcToday = constant(
  DateTime.toDateUtc(DateTime.unsafeNow().pipe(DateTime.removeTime)),
);
