import { Navbar } from "@/components/common/navbar";
import { Outlet } from "@tanstack/react-router";

export const AuthenticatedLayout = () => {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div className="container mx-auto flex-1 px-6 py-24">
        <Outlet />
      </div>
    </div>
  );
};
