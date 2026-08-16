import { useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";
import { Loading } from "../components/ui/Loading";

type Intent = Exclude<Role, "ADMIN">;

export function EntryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [intent, setIntent] = useState<Intent | null>(null);

  if (loading) return <Loading />;
  if (user) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-black px-5 pb-8 pt-6 text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800" aria-hidden>
          <div className="h-full w-[14%] rounded-full bg-[#ff4d8d]" />
        </div>

        <h1 className="mt-10 text-[2rem] font-bold leading-tight tracking-tight sm:text-4xl">
          I am looking to...
        </h1>

        <div className="mt-10 grid grid-cols-2 gap-3">
          <IntentCard
            selected={intent === "HAIRDRESSER"}
            label="Find a job"
            onSelect={() => setIntent("HAIRDRESSER")}
            icon={<SearchIcon />}
          />
          <IntentCard
            selected={intent === "EMPLOYER"}
            label="Hire people"
            onSelect={() => setIntent("EMPLOYER")}
            icon={<span className="text-6xl leading-none" aria-hidden>🙋🏼‍♀️</span>}
          />
        </div>

        <div className="mt-auto pt-12">
          <button
            type="button"
            disabled={!intent}
            className="w-full rounded-full bg-white py-4 text-sm font-bold uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            onClick={() => {
              if (!intent) return;
              navigate(`/register?role=${intent}`);
            }}
          >
            Continue
          </button>
          <p className="mt-5 text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-white">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function IntentCard({
  selected,
  label,
  icon,
  onSelect
}: {
  selected: boolean;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex aspect-[4/5] flex-col items-center justify-between rounded-[1.6rem] px-3 py-6 text-center transition ${
        selected ? "bg-white text-black" : "bg-[#2b2b2b] text-white"
      }`}
    >
      <div className="flex flex-1 items-center justify-center">{icon}</div>
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
      <circle cx="30" cy="30" r="16" stroke="currentColor" strokeWidth="5" />
      <path d="M42 42 L58 58" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
