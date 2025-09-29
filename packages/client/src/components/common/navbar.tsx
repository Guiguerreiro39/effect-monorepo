import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { Button } from "@/components/ui";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { SmallXpBar } from "@/features/xp/components/small-xp-bar";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between gap-8 border-b bg-background p-4">
      <Link to="/">
        <h1>Logo</h1>
      </Link>
      <div className="flex items-center gap-4">
        <CreateTaskDialog>
          <Button variant="default" size="icon" className="rounded-full">
            <PlusIcon />
          </Button>
        </CreateTaskDialog>
        <SmallXpBar />
        <ThemeSwitcher />
        <div className="size-10 rounded-full border p-2" />
      </div>
    </nav>
  );
};
