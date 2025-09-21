import { SignInPage } from "@/features/auth/pages";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
  beforeLoad: async ({ context }) => {
    if (context.session !== null) {
      throw redirect({ to: "/" });
    }
  },
});
