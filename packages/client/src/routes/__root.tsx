import { RootLayout } from "@/features/layouts";
import { authClient } from "@/lib/auth-client";
import { createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    return { session: session.data };
  },
});
