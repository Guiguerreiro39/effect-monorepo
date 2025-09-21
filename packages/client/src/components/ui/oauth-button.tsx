import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils/cn";
import { SiGithub } from "@icons-pack/react-simple-icons";
import React from "react";
import { toast } from "sonner";
import { Button } from "./button";

export type OAuthProvider = "github";

export type OAuthButtonProps = {
  provider: OAuthProvider;
} & React.ComponentProps<typeof Button>;

const providers = {
  github: {
    icon: <SiGithub className="size-4" />,
    label: "GitHub",
  },
} satisfies Record<OAuthProvider, { icon: React.ReactNode; label: string }>;

export const OAuthButton = ({
  className,
  provider,
  variant = "secondary",
  ...props
}: OAuthButtonProps) => {
  const { icon, label } = providers[provider];
  const [isPending, startTransition] = React.useTransition();

  const lastUsed = localStorage.getItem("last-used-provider") === provider;

  const handleSignIn = () => {
    startTransition(async () => {
      await authClient.signIn.social({
        callbackURL: window.location.origin,
        provider,

        fetchOptions: {
          onSuccess: async () => {
            localStorage.setItem("last-used-provider", provider);
          },
          onError: async (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      });
    });
  };

  return (
    <Button
      {...props}
      className={cn("relative w-full", className)}
      loading={isPending}
      variant={variant}
      onClick={handleSignIn}
    >
      {icon}
      {label}
      {lastUsed && (
        <span className="absolute right-4 text-xs text-muted-foreground">Last used</span>
      )}
    </Button>
  );
};
