import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import type { Job, Paginated } from "../types";
import { employmentTypeLabel } from "../utils/labels";
import { EmptyState } from "../components/ui/EmptyState";
import { Loading } from "../components/ui/Loading";
import { useAuth } from "../context/AuthContext";

export function JobsPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<Paginated<Job> | null>(null);
  const [mine, setMine] = useState(false);

  useEffect(() => {
    void api.get("/jobs", { params: { mine: mine ? "true" : undefined } }).then(({ data }) => setResult(data));
  }, [mine]);

  if (!result) return <Loading />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Jobs</h1>
          <p className="mt-2 text-sm text-ink-700">Active opportunities from salons on MM Connect.</p>
        </div>
        {user?.role === "EMPLOYER" ? (
          <div className="flex gap-2">
            <button className="btn-secondary" type="button" onClick={() => setMine((value) => !value)}>
              {mine ? "Show public jobs" : "My jobs"}
            </button>
            <Link className="btn-primary" to="/jobs/new">Post a job</Link>
          </div>
        ) : null}
      </div>
      {result.items.length ? (
        <div className="mt-6 space-y-4">
          {result.items.map((job) => (
            <article key={job.id} className="card p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div>
                  <h2 className="font-display text-2xl">{job.title}</h2>
                  <p className="text-sm text-ink-700">{job.employerProfile?.businessName} · {job.location}</p>
                  <p className="mt-2 text-sm text-ink-500">{employmentTypeLabel[job.employmentType] ?? job.employmentType}{job.salaryDisplay ? ` · ${job.salaryDisplay}` : ""}</p>
                </div>
                <Link className="btn-secondary self-start" to={`/jobs/${job.id}`}>View role</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6"><EmptyState title="No jobs yet" body="Employers can post roles when they are ready to hire." /></div>
      )}
    </main>
  );
}
