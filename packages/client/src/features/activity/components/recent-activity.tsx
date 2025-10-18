import { Badge, Card } from "@/components/ui";
import { ActivityType } from "@org/domain/Enums";
import * as Array from "effect/Array";
import { ArrowUpIcon, CheckIcon, StarIcon } from "lucide-react";
import { useGetAllActivities } from "../api";

export const RecentActivity = () => {
  const { data: activities, isLoading } = useGetAllActivities();

  if (isLoading) {
    return null;
  }

  if (!activities || Array.isEmptyReadonlyArray(activities)) {
    return "No data";
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border-b border-border pb-3 last:border-0">
              {activity.type === ActivityType.Task && (
                <div className="flex items-center gap-4">
                  <Badge variant="success" className="size-8 rounded-full">
                    <CheckIcon />
                  </Badge>

                  <div className="flex-1">
                    <p className="text-sm">
                      Completed <span className="font-medium">{activity.title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-success-foreground">
                    +{activity.experience} XP
                  </span>
                </div>
              )}
              {activity.type === ActivityType.LevelUp && (
                <div className="flex items-center gap-4">
                  <Badge variant="success" className="size-8 rounded-full">
                    <ArrowUpIcon />
                  </Badge>

                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Level {activity.level}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {activity.type === ActivityType.Reward && (
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="size-8 rounded-full">
                    <StarIcon />
                  </Badge>

                  <div className="flex-1">
                    <p className="text-sm">
                      Unlocked <span className="font-medium">{activity.title}</span> milestone
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
};
