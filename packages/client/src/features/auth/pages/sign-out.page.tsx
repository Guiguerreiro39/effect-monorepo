import { Button, Card } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import React from "react";

export const SignOutPage = () => {
  const [isPending, startTransition] = React.useTransition();

  const navigate = useNavigate();

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: async () => {
            await navigate({ to: "/sign-in" });
          },
        },
      });
    });
  };

  return (
    <div className="flex h-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <Card.Header>
          <Card.Title className="text-2xl font-bold tracking-tight">
            Are you sure you want to sign out?
          </Card.Title>
          <Card.Description>You will be redirected to the sign-in page.</Card.Description>
        </Card.Header>
        <Card.Content>
          <Button
            onClick={handleSignOut}
            loading={isPending}
            className="w-full"
            variant="destructive"
          >
            Sign out
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
};
