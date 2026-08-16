import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/professionals", label: "Find Professionals" },
  { to: "/jobs", label: "Jobs" },
  { to: "/about", label: "About" }
];

export function PublicLayout() {
  const { user } = useAuth();
  const home = user?.role === "ADMIN" ? "/admin" : user ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-cream-200/80 bg-cream-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="font-display text-2xl">
            MM Connect
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? "font-semibold text-rose-600" : "text-ink-700 hover:text-ink-950")}
                end={link.to === "/"}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link className="btn-primary" to={home}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="btn-ghost hidden sm:inline-flex" to="/login">
                  Login
                </Link>
                <Link className="btn-primary" to="/register">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
        <nav className="flex gap-4 overflow-x-auto border-t border-cream-200 px-4 py-3 text-sm md:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="whitespace-nowrap text-ink-700">
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
      <footer className="border-t border-cream-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-700 md:flex-row md:items-center md:justify-between">
          <p>MM Connect — a Marjorie Milner College platform.</p>
          <p>Connect. Showcase. Grow.</p>
        </div>
      </footer>
    </div>
  );
}
