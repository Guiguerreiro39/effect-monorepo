import { Card } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { FlameIcon, XIcon } from "lucide-react";

export const WeeklyStreakCard = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <div className="flex items-center justify-between">
            <h2>Your Streaks</h2>
            <span className="flex items-center">
              <FlameIcon className="mr-1 h-5 w-5 text-primary" />
              <span className="font-medium text-primary-dark">4 days</span>
            </span>
          </div>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="mb-4 rounded-xl bg-primary-lightest p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-dark">Current Streak</p>
              <div className="flex items-center">
                <FlameIcon className="mr-1 h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary-dark">4</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-primary-dark">Best Streak</p>
              <div className="flex items-center">
                <FlameIcon className="mr-1 h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary-dark">7</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Last 7 days:</p>
          <div className="flex justify-between">
            {[true, true, true, true, false, false, false].map((completed, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    "mb-1 flex h-8 w-8 items-center justify-center rounded-full",
                    completed ? "streak-gradient text-card" : "bg-muted text-muted-foreground",
                  )}
                >
                  {completed ? (
                    <FlameIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">
                      <XIcon className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {["M", "T", "W", "T", "F", "S", "S"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};
