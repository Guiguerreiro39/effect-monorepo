import { Card } from "@/components/ui";
import { OAuthButton } from "@/components/ui/oauth-button";

export const SignInPage = () => {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <Card.Header>
          <Card.Title className="text-2xl font-bold tracking-tight">Welcome back</Card.Title>
          <Card.Description>Sign in to your account to continue.</Card.Description>
        </Card.Header>
        <Card.Content className="grid gap-4">
          <OAuthButton provider="github" />
        </Card.Content>
      </Card>
    </div>
  );
};
