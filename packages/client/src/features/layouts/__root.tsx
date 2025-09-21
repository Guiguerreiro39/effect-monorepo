import { Outlet } from "@tanstack/react-router";
import * as React from "react";

export const RootLayout: React.FC = () => {
  return (
    <main className="flex h-screen flex-col bg-background">
      <Outlet />
    </main>
  );
};
