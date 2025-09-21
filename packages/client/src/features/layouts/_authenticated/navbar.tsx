import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { Link } from "@tanstack/react-router";

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between gap-8 border-b p-4">
      <Link to="/">
        <h1>Logo</h1>
      </Link>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <div className="size-10 rounded-full border p-2" />
      </div>
    </nav>
  );
};
