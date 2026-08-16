import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import type { Job } from "../types";
import { employmentTypeLabel } from "../utils/labels";
import { Alert } from "../components/ui/Alert";
import { Loading } from "../components/ui/Loading";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";

export function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm<{ coverNote: string }>();

  useEffect(() => {
    if (!id) return;
    void api.get(`/jobs/${id}`).then(({ data }) => setJob(data.job)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <Alert>{error}</Alert>;
  if (!job) return <Loading />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-ink-500">{job.employerProfile?.businessName}</p>
      <h1 className="mt-1 font-display text-4xl">{job.title}</h1>
      <p className="mt-2 text-ink-700">{job.location} · {employmentTypeLabel[job.employmentType]}</p>
      {job.salaryDisplay ? <p className="mt-1 text-sm">{job.salaryDisplay}</p> : null}
      <article className="card mt-6 whitespace-pre-wrap p-6 text-ink-700">{job.description}</article>
      <div className="mt-4 flex flex-wrap gap-2">
        {(job.requiredSkills ?? []).map((item) => (
          <span key={item.skill.id} className="badge bg-white">{item.skill.name}</span>
        ))}
      </div>
      {user?.role === "HAIRDRESSER" ? (
        <form
          className="card mt-8 space-y-3 p-6"
          onSubmit={handleSubmit(async (values) => {
            setError("");
            setMessage("");
            try {
              await api.post(`/jobs/${job.id}/apply`, values);
              setMessage("Interest submitted.");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not apply");
            }
          })}
        >
          <h2 className="font-display text-2xl">Express interest</h2>
          {message ? <Alert tone="success">{message}</Alert> : null}
          {error ? <Alert>{error}</Alert> : null}
          <textarea className="input min-h-24" placeholder="Optional note" {...register("coverNote")} />
          <button className="btn-primary" type="submit">Apply</button>
        </form>
      ) : null}
      {user?.role === "EMPLOYER" && user.employerProfile?.id === job.employerProfile?.id ? (
        <Link className="btn-secondary mt-6 inline-flex" to={`/jobs/${job.id}/edit`}>Edit job</Link>
      ) : null}
    </main>
  );
}
