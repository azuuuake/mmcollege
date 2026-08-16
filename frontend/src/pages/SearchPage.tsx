import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { HairdresserCard } from "../components/HairdresserCard";
import { EmptyState } from "../components/ui/EmptyState";
import { Loading } from "../components/ui/Loading";
import { Alert } from "../components/ui/Alert";
import api from "../services/api";
import type { HairdresserProfile, Paginated, Qualification, Skill } from "../types";
import { useNavigate } from "react-router-dom";

export function SearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [result, setResult] = useState<Paginated<HairdresserProfile> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    skillIds: "",
    qualificationId: "",
    minExperience: "",
    availability: "",
    employmentType: "",
    verified: "",
    page: 1
  });

  async function load(page = filters.page) {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/hairdressers", {
        params: {
          location: filters.location || undefined,
          skillIds: filters.skillIds || undefined,
          qualificationId: filters.qualificationId || undefined,
          minExperience: filters.minExperience || undefined,
          availability: filters.availability || undefined,
          employmentType: filters.employmentType || undefined,
          verified: filters.verified || undefined,
          page
        }
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void api.get("/skills").then(({ data }) => setSkills(data.items));
    void api.get("/qualifications").then(({ data }) => setQualifications(data.items));
    void load(1);
    // Initial catalogue + first search only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl">Find professionals</h1>
      <p className="mt-2 text-sm text-ink-700">Search is database-backed. Filters query PostgreSQL, not the browser.</p>
      <form
        className="card mt-6 grid gap-3 p-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          void load(1);
        }}
      >
        <input className="input" placeholder="Location (e.g. Melbourne)" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <select className="input" value={filters.skillIds} onChange={(e) => setFilters({ ...filters, skillIds: e.target.value })}>
          <option value="">Any skill</option>
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>{skill.name}</option>
          ))}
        </select>
        <select className="input" value={filters.qualificationId} onChange={(e) => setFilters({ ...filters, qualificationId: e.target.value })}>
          <option value="">Any qualification</option>
          {qualifications.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select className="input" value={filters.minExperience} onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}>
          <option value="">Any experience</option>
          <option value="1">1+ years</option>
          <option value="2">2+ years</option>
          <option value="5">5+ years</option>
        </select>
        <select className="input" value={filters.availability} onChange={(e) => setFilters({ ...filters, availability: e.target.value })}>
          <option value="">Any availability</option>
          <option value="IMMEDIATE">Immediate</option>
          <option value="TWO_WEEKS">2 weeks</option>
          <option value="ONE_MONTH">1 month</option>
          <option value="FLEXIBLE">Flexible</option>
        </select>
        <select className="input" value={filters.employmentType} onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}>
          <option value="">Any employment type</option>
          <option value="FULL_TIME">Full time</option>
          <option value="PART_TIME">Part time</option>
          <option value="CASUAL">Casual</option>
          <option value="CONTRACT">Contract</option>
        </select>
        <select className="input" value={filters.verified} onChange={(e) => setFilters({ ...filters, verified: e.target.value })}>
          <option value="">Any verification</option>
          <option value="true">MMCollege verified</option>
        </select>
        <button className="btn-primary" type="submit">Search</button>
      </form>
      {error ? <div className="mt-4"><Alert>{error}</Alert></div> : null}
      {loading ? <Loading /> : result?.items.length ? (
        <>
          <p className="mt-6 text-sm text-ink-500">{result.total} professionals</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {result.items.map((profile) => (
              <HairdresserCard
                key={profile.id}
                profile={profile}
                onContact={
                  user?.role === "EMPLOYER"
                    ? () => navigate(`/professionals/${profile.id}`, { state: { contact: true } })
                    : undefined
                }
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState title="No matching professionals" body="Try a broader location or fewer filters." />
        </div>
      )}
    </main>
  );
}
