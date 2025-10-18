import { HashIdentifierError } from "@org/domain/Errors";
import * as Effect from "effect/Effect";
import * as String from "effect/String";
import * as crypto from "node:crypto";

export const createHash = Effect.fn(function* (params: { title: string; executionDate: Date }) {
  return yield* Effect.try({
    try: () =>
      crypto
        .createHash("sha256")
        .update(String.concat(params.title, params.executionDate.toISOString()))
        .digest("hex"),
    catch: (error) => new HashIdentifierError({ message: `Failed to create hash: ${error}` }),
  });
});
