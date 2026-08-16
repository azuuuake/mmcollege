import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Alert } from "../components/ui/Alert";

export function AdminHomePage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    void api.get("/admin/stats").then(({ data }) => setStats(data));
  }, []);
  if (!stats) return null;
  return (
    <div>
      <h1 className="font-display text-4xl">Admin overview</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-5">
        <Stat label="Hairdressers" value={stats.hairdressers} />
        <Stat label="Employers" value={stats.employers} />
        <Stat label="Verified credentials" value={stats.verifiedCredentials} />
        <Stat label="Pending verifications" value={stats.pendingVerifications} />
        <Stat label="Active jobs" value={stats.activeJobs} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}

export function AdminUsersPage() {
  const [items, setItems] = useState<Array<{ id: string; email: string; role: string; status: string; hairdresserProfile?: { firstName: string; lastName: string } | null; employerProfile?: { businessName: string } | null }>>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  async function load() {
    const { data } = await api.get("/admin/users", { params: { q: q || undefined, role: role || undefined } });
    setItems(data.items);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <h1 className="font-display text-4xl">Users</h1>
      <form className="mt-4 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); void load(); }}>
        <input className="input max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
        <select className="input max-w-xs" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="HAIRDRESSER">Hairdresser</option>
          <option value="EMPLOYER">Employer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button className="btn-primary" type="submit">Filter</button>
      </form>
      <div className="mt-4 space-y-2">
        {items.map((user) => (
          <div key={user.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{user.hairdresserProfile ? `${user.hairdresserProfile.firstName} ${user.hairdresserProfile.lastName}` : user.employerProfile?.businessName ?? user.email}</p>
              <p className="text-sm text-ink-500">{user.email} · {user.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={user.status} />
              {user.role !== "ADMIN" ? (
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={async () => {
                    await api.put(`/admin/users/${user.id}/suspend`, {
                      status: user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"
                    });
                    await load();
                  }}
                >
                  {user.status === "SUSPENDED" ? "Restore" : "Suspend"}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCredentialsPage() {
  const [items, setItems] = useState<Array<{ id: string; qualificationName: string; status: string; issuingOrganisation: string; hairdresserProfile: { firstName: string; lastName: string } }>>([]);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await api.get("/admin/credentials", { params: { status: "PENDING" } });
    setItems(data.items);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <h1 className="font-display text-4xl">Verification queue</h1>
      <p className="mt-2 text-sm text-ink-700">Only administrators can mark a credential as verified.</p>
      {message ? <div className="mt-4"><Alert tone="success">{message}</Alert></div> : null}
      <textarea className="input mt-4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Review notes" />
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{item.qualificationName}</p>
                <p className="text-sm text-ink-500">{item.hairdresserProfile.firstName} {item.hairdresserProfile.lastName} · {item.issuingOrganisation}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" type="button" onClick={async () => {
                  await api.put(`/admin/credentials/${item.id}/verify`, { notes });
                  setMessage("Credential verified.");
                  await load();
                }}>Verify</button>
                <button className="btn-secondary" type="button" onClick={async () => {
                  await api.put(`/admin/credentials/${item.id}/reject`, { notes });
                  setMessage("Credential rejected.");
                  await load();
                }}>Reject</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminReportsPage() {
  const [items, setItems] = useState<Array<{ id: string; reason: string; status: string; targetType: string }>>([]);
  useEffect(() => {
    void api.get("/admin/reports").then(({ data }) => setItems(data.items));
  }, []);
  return (
    <div>
      <h1 className="font-display text-4xl">Reported content</h1>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="card p-4">
            <p className="font-semibold">{item.targetType}</p>
            <p className="text-sm text-ink-700">{item.reason}</p>
            <StatusBadge status={item.status} />
          </article>
        ))}
      </div>
      <Link className="btn-ghost mt-6 inline-flex" to="/admin">Back to overview</Link>
    </div>
  );
}
