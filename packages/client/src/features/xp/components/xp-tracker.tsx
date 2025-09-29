import { Badge, Card } from "@/components/ui";
import { StarIcon, TrophyIcon } from "lucide-react";

export const XPTracker = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <div className="flex items-center justify-between">
            <h2>XP Progress</h2>
            <Badge variant="secondary" className="text-secondary-foreground">
              <StarIcon />
              Level 3
            </Badge>
          </div>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <p>320 XP</p>
            <p>500 XP</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="xp-gradient h-full rounded-full"
              style={{
                width: "64%",
              }}
            />
          </div>
        </div>
        <div className="rounded-xl bg-secondary-lightest p-3">
          <div className="flex items-center">
            <div className="mr-3 rounded-full border border-secondary bg-secondary-light p-2 shadow-sm">
              <TrophyIcon className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-secondary-foreground">Next milestone</p>
              <p className="font-medium text-secondary-foreground">1000 XP</p>
              <div className="mt-1 flex items-center text-xs">
                <div className="mr-2 h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                  <div
                    className="xp-gradient h-full rounded-full"
                    style={{
                      width: "64%",
                    }}
                  />
                </div>
                <span className="text-secondary-foreground">320/500 XP</span>
              </div>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};
