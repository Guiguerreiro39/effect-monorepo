import { SignOutPage } from "@/pages/sign-out";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/sign-out")({
  component: SignOutPage,
});
