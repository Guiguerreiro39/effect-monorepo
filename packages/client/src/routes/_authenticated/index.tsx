import { IndexPage } from "@/features/index/index";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: IndexPage,
});
