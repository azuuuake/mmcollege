import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Loading } from "../components/ui/Loading";
import { StatusBadge } from "../components/ui/StatusBadge";
import { HairdresserCard } from "../components/HairdresserCard";

export function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "EMPLOYER") return <EmployerDashboard />;
  return <HairdresserDashboard />;
}

function HairdresserDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    void api.get("/hairdressers/me/dashboard").then(({ data: payload }) => setData(payload));
  }, []);
  if (!data) return <Loading />;
  const profile = data.profile as { id: string; firstName: string; lastName: string; credentials?: { id: string; qualificationName: string; status: string }[] };
  const completion = data.completion as { total: number };
  const verification = data.verificationSummary as { verified: number; pending: number };
  const jobs = (data.recommendedJobs as { job: { id: string; title: string; location: string }; match: { score: number } }[]) ?? [];

  return (
    <div>
      <h1 className="font-display text-4xl">Welcome, {profile.firstName}</h1>
      <p className="mt-2 text-ink-700">Keep your profile complete so employers can find you with confidence.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat label="Profile complete" value={`${completion.total}%`} />
        <Stat label="Verified credentials" value={String(verification.verified)} />
        <Stat label="Profile views" value={String(data.profileViews)} />
        <Stat label="Employer contacts" value={String(data.employerInterests)} />
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link className="btn-primary" to="/profile/edit">Edit profile</Link>
        <Link className="btn-secondary" to="/profile/edit#qualifications">Add qualification</Link>
        <Link className="btn-secondary" to="/profile/edit#skills">Add skill</Link>
        <Link className="btn-secondary" to="/profile/edit#experience">Add experience</Link>
        <Link className="btn-secondary" to="/profile/edit#portfolio">Add portfolio item</Link>
        <Link className="btn-secondary" to={`/professionals/${profile.id}`}>View public profile</Link>
      </div>
      <section className="mt-10">
        <h2 className="font-display text-3xl">Verification</h2>
        <div className="mt-4 space-y-3">
          {(profile.credentials ?? []).map((item) => (
            <div key={item.id} className="card flex items-center justify-between p-4">
              <p className="font-semibold">{item.qualificationName}</p>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-display text-3xl">Recommended jobs</h2>
        <div className="mt-4 space-y-3">
          {jobs.map((item) => (
            <Link key={item.job.id} to={`/jobs/${item.job.id}`} className="card block p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.job.title}</p>
                  <p className="text-sm text-ink-500">{item.job.location}</p>
                </div>
                <span className="badge bg-cream-100">Match {item.match.score}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmployerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    void api.get("/employers/me/dashboard").then(({ data: payload }) => setData(payload));
  }, []);
  if (!data) return <Loading />;
  const jobs = (data.activeJobs as { id: string; title: string; location: string; _count?: { applications: number } }[]) ?? [];
  const recommended = (data.recommendedProfessionals as { candidate: { id: string; firstName: string; lastName: string; professionalTitle?: string; location?: string; yearsOfExperience: number; profilePhotoUrl?: string }; match: { score: number } }[]) ?? [];

  return (
    <div>
      <h1 className="font-display text-4xl">Welcome, {user?.employerProfile?.businessName}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat label="Active jobs" value={String(jobs.length)} />
        <Stat label="Candidate matches" value={String(data.candidateMatches)} />
        <Stat label="Profile views" value={String(data.profileViews)} />
        <Stat label="Recent contacts" value={String((data.recentContacts as unknown[]).length)} />
      </div>
      <div className="mt-8 flex gap-2">
        <Link className="btn-primary" to="/jobs/new">Create job</Link>
        <Link className="btn-secondary" to="/professionals">Search professionals</Link>
      </div>
      <section className="mt-10">
        <h2 className="font-display text-3xl">Active jobs</h2>
        <div className="mt-4 space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="card block p-4">
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-ink-500">{job.location} · {job._count?.applications ?? 0} applications</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-display text-3xl">Recommended professionals</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {recommended.map((item) => (
            <HairdresserCard
              key={item.candidate.id}
              profile={{
                ...item.candidate,
                professionalTitle: item.candidate.professionalTitle,
                profileCompletion: item.match.score
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
