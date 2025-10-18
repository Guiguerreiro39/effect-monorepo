import type { UserMetadataContract } from "@org/domain/api/Contracts";
import { CurrentUser } from "@org/domain/Policy";
import * as Effect from "effect/Effect";

export const calculateNextLevelExperience = (level: number) => {
  return level * 100;
};

export const generateLevelUpPayload = (
  input: typeof UserMetadataContract.UpdateUserMetadataPayload.Type,
) =>
  Effect.gen(function* () {
    const currentUser = yield* CurrentUser;

    const payload = {
      ...input,
    };

    if (payload.experience && currentUser.metadata.currentLevelExperience <= payload.experience) {
      const nextLevel = currentUser.metadata.level + 1;
      const nextLevelExperience = calculateNextLevelExperience(nextLevel);

      payload.currentLevelExperience = nextLevelExperience;
      payload.level = nextLevel;
      payload.experience = 0;
    }

    if (payload.experience && payload.experience < 0) {
      const previousLevel = currentUser.metadata.level - 1;
      const previousLevelExperience = calculateNextLevelExperience(previousLevel);

      payload.currentLevelExperience = previousLevelExperience;
      payload.level = previousLevel;
      payload.experience = previousLevelExperience - payload.experience;
    }

    return payload;
  });
