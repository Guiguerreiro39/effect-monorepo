import { Badge, Card } from "@/components/ui";
import { CheckIcon, FlameIcon, StarIcon } from "lucide-react";

const activities = [
  {
    id: 1,
    action: "completed",
    chore: "Wash the dishes",
    time: "2 hours ago",
    days: 2,
    title: "Unlocked Cleaning Novice",
    xp: 10,
  },
  {
    id: 2,
    action: "streak",
    chore: "Wash the dishes",
    time: "2 hours ago",
    days: 2,
    title: "Unlocked Cleaning Novice",
    xp: 10,
  },
  {
    id: 3,
    action: "milestone",
    chore: "Wash the dishes",
    time: "2 hours ago",
    days: 2,
    title: "Unlocked Cleaning Novice",
    xp: 10,
  },
];

export const RecentActivity = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="border-b border-border pb-3 last:border-0">
              {activity.action === "completed" && (
                <div className="flex items-center gap-4">
                  <Badge variant="success" className="size-8 rounded-full">
                    <CheckIcon />
                  </Badge>

                  <div className="flex-1">
                    <p className="text-sm">
                      Completed <span className="font-medium">{activity.chore}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <span className="text-xs font-medium text-success-foreground">
                    +{activity.xp} XP
                  </span>
                </div>
              )}
              {activity.action === "streak" && (
                <div className="flex items-center gap-4">
                  <Badge variant="primary" className="size-8 rounded-full">
                    <FlameIcon />
                  </Badge>

                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.days}-day streak</span> for{" "}
                      {activity.chore}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <span className="text-xs font-medium text-primary">+{activity.xp} XP</span>
                </div>
              )}
              {activity.action === "milestone" && (
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="size-8 rounded-full">
                    <StarIcon />
                  </Badge>

                  <div className="flex-1">
                    <p className="text-sm">
                      Unlocked <span className="font-medium">{activity.title}</span> milestone
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <span className="text-xs font-medium text-secondary">+{activity.xp} XP</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
};
