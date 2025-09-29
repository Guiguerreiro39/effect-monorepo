import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_unauthenticated")({
  beforeLoad: ({ context }) => {
    const { session } = context;
    const now = Date.now();

    if (session !== null && session.session.expiresAt.getTime() > now) {
      throw redirect({ to: "/" });
    }
  },
});
