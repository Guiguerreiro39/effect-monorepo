import { useGetCurrentUser } from "@/features/user/api";
import { useGetMetadataByUserId } from "@/features/user/api/user-metadata-service";
import { UserId } from "@org/domain/EntityIds";
import { StarIcon } from "lucide-react";

export const SmallXpBar = () => {
  const user = useGetCurrentUser();
  const { data: metadata, isLoading } = useGetMetadataByUserId({ userId: UserId.make(user.id) });

  if (isLoading || !metadata) {
    return null;
  }

  const percentage = (metadata.experience / metadata.currentLevelExperience) * 100;

  return (
    <div className="flex items-center space-x-3 rounded-full border border-border bg-card px-4 py-1 shadow-sm">
      <div className="flex items-center space-x-2">
        <StarIcon className="h-5 w-5 text-secondary-dark" />
        <span className="font-medium">Level {metadata.level}</span>
      </div>
      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted shadow-xs">
        <div
          style={{
            width: `${percentage.toFixed(2)}%`,
          }}
          className="xp-gradient h-full rounded-full transition-all"
        />
      </div>
    </div>
  );
};
