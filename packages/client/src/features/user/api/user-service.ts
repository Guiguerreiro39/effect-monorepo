import { useRouteContext } from "@tanstack/react-router";
import React from "react";

export const useGetCurrentUser = React.cache(() => {
  const context = useRouteContext({ from: "/_authenticated" });
  return context.session.user;
});
