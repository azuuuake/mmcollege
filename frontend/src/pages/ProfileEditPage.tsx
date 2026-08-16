import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Alert } from "../components/ui/Alert";
import { Loading } from "../components/ui/Loading";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { HairdresserProfile, Qualification, Skill } from "../types";

export function ProfileEditPage() {
  const { user, refresh } = useAuth();
  if (user?.role === "EMPLOYER") return <EmployerEditor onSaved={refresh} />;
  return <HairdresserEditor />;
}

function HairdresserEditor() {
  const [profile, setProfile] = useState<HairdresserProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset } = useForm();

  async function load() {
    const [{ data: me }, { data: skillData }, { data: qualData }] = await Promise.all([
      api.get("/auth/me"),
      api.get("/skills"),
      api.get("/qualifications")
    ]);
    setProfile(me.user.hairdresserProfile);
    reset(me.user.hairdresserProfile);
    setSkills(skillData.items);
    setQualifications(qualData.items);
  }

  useEffect(() => {
    void load();
  }, []);

  if (!profile) return <Loading />;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl">Edit profile</h1>
      {message ? <Alert tone="success">{message}</Alert> : null}
      <form
        className="card grid gap-3 p-6 md:grid-cols-2"
        onSubmit={handleSubmit(async (values) => {
          await api.put("/hairdressers/profile", { ...values, yearsOfExperience: Number(values.yearsOfExperience ?? 0) });
          setMessage("Profile saved.");
          await load();
        })}
      >
        <input className="input" placeholder="First name" {...register("firstName")} />
        <input className="input" placeholder="Last name" {...register("lastName")} />
        <input className="input" placeholder="Professional title" {...register("professionalTitle")} />
        <input className="input" type="number" placeholder="Years of experience" {...register("yearsOfExperience")} />
        <input className="input" placeholder="Location" {...register("location")} />
        <input className="input" placeholder="Phone" {...register("phone")} />
        <select className="input" {...register("availability")}>
          <option value="">Availability</option>
          <option value="IMMEDIATE">Immediate</option>
          <option value="TWO_WEEKS">2 weeks</option>
          <option value="ONE_MONTH">1 month</option>
          <option value="FLEXIBLE">Flexible</option>
        </select>
        <select className="input" {...register("preferredEmploymentType")}>
          <option value="">Preferred employment</option>
          <option value="FULL_TIME">Full time</option>
          <option value="PART_TIME">Part time</option>
          <option value="CASUAL">Casual</option>
          <option value="CONTRACT">Contract</option>
        </select>
        <textarea className="input md:col-span-2 min-h-28" placeholder="About" {...register("bio")} />
        <button className="btn-primary md:col-span-2" type="submit">Save profile</button>
      </form>

      <section id="skills" className="card p-6">
        <h2 className="font-display text-2xl">Skills</h2>
        <form
          className="mt-4 flex flex-col gap-3 md:flex-row"
          onSubmit={async (event) => {
            event.preventDefault();
            const selected = Array.from(event.currentTarget.querySelectorAll<HTMLInputElement>("input:checked")).map((item) => item.value);
            await api.post("/hairdressers/skills", { skillIds: selected });
            setMessage("Skills updated.");
            await load();
          }}
        >
          <div className="grid flex-1 grid-cols-2 gap-2">
            {skills.map((skill) => (
              <label key={skill.id} className="text-sm">
                <input
                  type="checkbox"
                  value={skill.id}
                  defaultChecked={profile.skills?.some((item) => item.skill.id === skill.id)}
                  className="mr-2"
                />
                {skill.name}
              </label>
            ))}
          </div>
          <button className="btn-secondary self-start" type="submit">Save skills</button>
        </form>
      </section>

      <section id="qualifications" className="card p-6">
        <h2 className="font-display text-2xl">Qualifications</h2>
        <div className="mt-3 space-y-2">
          {(profile.credentials ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-cream-50 px-3 py-2">
              <span>{item.qualificationName}</span>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            await api.post("/hairdressers/qualifications", {
              qualificationId: form.get("qualificationId") || undefined,
              qualificationName: form.get("qualificationName"),
              issuingOrganisation: form.get("issuingOrganisation"),
              credentialNumber: form.get("credentialNumber") || undefined
            });
            event.currentTarget.reset();
            setMessage("Qualification submitted for MMCollege review.");
            await load();
          }}
        >
          <select className="input" name="qualificationId">
            <option value="">Catalogue qualification</option>
            {qualifications.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <input className="input" name="qualificationName" placeholder="Qualification name" required />
          <input className="input" name="issuingOrganisation" placeholder="Issuing organisation" required />
          <input className="input" name="credentialNumber" placeholder="Credential number" />
          <button className="btn-primary md:col-span-2" type="submit">Add qualification</button>
        </form>
      </section>

      <section id="experience" className="card p-6">
        <h2 className="font-display text-2xl">Experience</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            await api.post("/hairdressers/experience", {
              employerName: form.get("employerName"),
              position: form.get("position"),
              startDate: form.get("startDate"),
              endDate: form.get("endDate") || undefined,
              description: form.get("description") || undefined
            });
            event.currentTarget.reset();
            await load();
          }}
        >
          <input className="input" name="employerName" placeholder="Salon / employer" required />
          <input className="input" name="position" placeholder="Position" required />
          <input className="input" type="date" name="startDate" required />
          <input className="input" type="date" name="endDate" />
          <textarea className="input md:col-span-2" name="description" placeholder="Description" />
          <button className="btn-primary md:col-span-2" type="submit">Add experience</button>
        </form>
      </section>

      <section id="portfolio" className="card p-6">
        <h2 className="font-display text-2xl">Portfolio</h2>
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            await api.post("/hairdressers/portfolio", {
              imageUrl: form.get("imageUrl"),
              title: form.get("title"),
              description: form.get("description") || undefined,
              category: form.get("category") || undefined
            });
            event.currentTarget.reset();
            await load();
          }}
        >
          <input className="input" name="imageUrl" placeholder="Image URL" required />
          <input className="input" name="title" placeholder="Title" required />
          <input className="input" name="category" placeholder="Category" />
          <textarea className="input" name="description" placeholder="Description" />
          <button className="btn-primary" type="submit">Add portfolio item</button>
        </form>
      </section>
    </div>
  );
}

function EmployerEditor({ onSaved }: { onSaved: () => Promise<void> }) {
  const { register, handleSubmit, reset } = useForm();
  const [message, setMessage] = useState("");

  useEffect(() => {
    void api.get("/auth/me").then(({ data }) => reset(data.user.employerProfile ?? {}));
  }, [reset]);

  return (
    <div>
      <h1 className="font-display text-4xl">Business profile</h1>
      {message ? <div className="mt-4"><Alert tone="success">{message}</Alert></div> : null}
      <form
        className="card mt-6 grid gap-3 p-6"
        onSubmit={handleSubmit(async (values) => {
          await api.put("/employers/profile", values);
          setMessage("Business profile saved.");
          await onSaved();
        })}
      >
        <input className="input" placeholder="Business name" {...register("businessName")} />
        <input className="input" placeholder="Location" {...register("location")} />
        <input className="input" placeholder="Website" {...register("website")} />
        <input className="input" placeholder="Business type" {...register("businessType")} />
        <input className="input" placeholder="Contact email" {...register("contactEmail")} />
        <textarea className="input min-h-28" placeholder="Description" {...register("description")} />
        <button className="btn-primary" type="submit">Save</button>
      </form>
    </div>
  );
}
