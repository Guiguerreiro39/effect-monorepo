import { StarIcon } from "lucide-react";

export const SmallXpBar = () => {
  return (
    <div className="flex items-center space-x-3 rounded-full border border-border bg-card px-4 py-1 shadow-sm">
      <div className="flex items-center space-x-2">
        <StarIcon className="h-5 w-5 text-secondary-dark" />
        <span className="font-medium">Level 3</span>
      </div>
      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted shadow-xs">
        <div className="xp-gradient h-full w-3/4 rounded-full" />
      </div>
    </div>
  );
};
