import { SignInPage } from "@/pages/sign-in";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_unauthenticated/sign-in")({
  component: SignInPage,
  beforeLoad: async ({ context }) => {
    if (context.session !== null) {
      throw redirect({ to: "/" });
    }
  },
});
