import { SignOutPage } from "@/features/auth/pages";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/sign-out")({
  component: SignOutPage,
});
