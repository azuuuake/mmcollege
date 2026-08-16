import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../services/api";
import type { HairdresserProfile } from "../types";
import { availabilityLabel, fullName, yearRange } from "../utils/labels";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Loading } from "../components/ui/Loading";
import { Alert } from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";

export function PublicProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<HairdresserProfile | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register, handleSubmit, reset } = useForm<{ body: string }>();

  useEffect(() => {
    if (!id) return;
    void api
      .get(`/hairdressers/${id}`)
      .then(({ data }) => setProfile(data.profile))
      .catch((err) => setError(err instanceof Error ? err.message : "Profile unavailable"));
  }, [id]);

  if (error) return <main className="mx-auto max-w-4xl px-4 py-16"><Alert>{error}</Alert></main>;
  if (!profile) return <Loading />;

  const verifiedCreds = (profile.credentials ?? []).filter((item) => item.status === "VERIFIED" || item.status === "EXPIRED");

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <section className="card p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row">
          <img src={profile.profilePhotoUrl ?? ""} alt="" className="h-28 w-28 rounded-full bg-cream-100 object-cover" />
          <div>
            <h1 className="font-display text-4xl">{fullName(profile.firstName, profile.lastName)}</h1>
            <p className="mt-1 text-ink-700">{profile.professionalTitle ?? "Hair professional"}</p>
            <p className="text-ink-500">{profile.location}</p>
            {profile.availability ? (
              <p className="mt-3"><StatusBadge status="VERIFIED" /> <span className="ml-2 text-sm">{availabilityLabel[profile.availability]}</span></p>
            ) : null}
          </div>
        </div>
        {profile.bio ? <p className="mt-6 text-ink-700">{profile.bio}</p> : null}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-3xl">Qualifications</h2>
        <div className="mt-4 space-y-3">
          {verifiedCreds.length ? verifiedCreds.map((item) => (
            <article key={item.id} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{item.qualificationName}</h3>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-sm text-ink-700">{item.issuingOrganisation}</p>
            </article>
          )) : <p className="text-sm text-ink-500">No verified qualifications to display yet.</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-3xl">Skills</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(profile.skills ?? []).map((item) => (
            <span key={item.skill.id} className="badge bg-white">{item.skill.name}</span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-3xl">Experience</h2>
        <div className="mt-4 space-y-3">
          {(profile.workExperiences ?? []).map((item) => (
            <article key={item.id} className="card p-4">
              <h3 className="font-semibold">{item.employerName}</h3>
              <p className="text-sm text-ink-700">{item.position}</p>
              <p className="text-sm text-ink-500">{yearRange(item.startDate, item.endDate)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-3xl">Portfolio</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(profile.portfolioItems ?? []).map((item) => (
            <figure key={item.id} className="card overflow-hidden">
              <img src={item.imageUrl} alt={item.title} className="h-64 w-full object-cover" />
              <figcaption className="p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-ink-700">{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {user?.role === "EMPLOYER" ? (
        <section className="card mt-10 p-6" id="contact">
          <h2 className="font-display text-3xl">Contact</h2>
          {success ? <div className="mt-3"><Alert tone="success">{success}</Alert></div> : null}
          <form
            className="mt-4 space-y-3"
            onSubmit={handleSubmit(async (values) => {
              setSuccess("");
              await api.post("/conversations", { hairdresserProfileId: profile.id, body: values.body });
              reset();
              setSuccess("Message sent. You can continue the conversation in Messages.");
            })}
          >
            <textarea className="input min-h-28" defaultValue={(location.state as { contact?: boolean } | null)?.contact ? "Hello, we would like to discuss an opportunity." : ""} {...register("body", { required: true })} />
            <button className="btn-primary" type="submit">Send message</button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
