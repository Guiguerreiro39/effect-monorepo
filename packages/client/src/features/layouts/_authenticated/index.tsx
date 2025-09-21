import { Outlet } from "@tanstack/react-router";
import { Navbar } from "./navbar";

export const AuthenticatedLayout = () => {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div className="flex-1 py-24">
        <Outlet />
      </div>
    </div>
  );
};
