import { envVars } from "@/lib/env-vars";
import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: envVars.API_URL.toString(),
  basePath: "/auth",
});
