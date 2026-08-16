import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links =
    user?.role === "ADMIN"
      ? [
          { to: "/admin", label: "Overview" },
          { to: "/admin/users", label: "Users" },
          { to: "/admin/credentials", label: "Verifications" },
          { to: "/admin/reports", label: "Reports" }
        ]
      : user?.role === "EMPLOYER"
        ? [
            { to: "/dashboard", label: "Dashboard" },
            { to: "/professionals", label: "Find professionals" },
            { to: "/jobs", label: "Jobs" },
            { to: "/messages", label: "Messages" },
            { to: "/profile/edit", label: "Business profile" }
          ]
        : [
            { to: "/dashboard", label: "Dashboard" },
            { to: "/jobs", label: "Jobs" },
            { to: "/messages", label: "Messages" },
            { to: "/profile/edit", label: "Edit profile" }
          ];

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-cream-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-display text-2xl">
            MM Connect
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-ink-700 sm:inline">{user?.email}</span>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 pb-3 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard" || link.to === "/admin"}
              className={({ isActive }) =>
                isActive ? "font-semibold text-rose-600" : "whitespace-nowrap text-ink-700 hover:text-ink-950"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
