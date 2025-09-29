import { RecentActivity } from "@/features/activity/components/recent-activity";
import { WeeklyStreakCard } from "@/features/streak/components/weekly-streak-card";
import { TasksList } from "@/features/tasks/components/tasks-list";
import { XPTracker } from "@/features/xp/components/xp-tracker";

export const IndexPage = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <TasksList />
        <RecentActivity />
      </div>

      <div className="col-span-1 space-y-6">
        <WeeklyStreakCard />
        <XPTracker />
      </div>
    </div>
  );
};
