import { Link } from "react-router-dom";
import type { HairdresserProfile } from "../types";
import { fullName } from "../utils/labels";
import { StatusBadge } from "./ui/StatusBadge";

export function HairdresserCard({
  profile,
  onContact
}: {
  profile: HairdresserProfile;
  onContact?: () => void;
}) {
  const verified = profile.verified || profile.credentials?.some((item) => item.status === "VERIFIED");
  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start gap-4">
        <img
          src={profile.profilePhotoUrl ?? `https://api.dicebear.com/9.x/notionists/svg?seed=${profile.id}`}
          alt=""
          className="h-16 w-16 rounded-full bg-cream-100 object-cover"
        />
        <div className="min-w-0">
          <h3 className="truncate font-display text-2xl leading-none">{fullName(profile.firstName, profile.lastName)}</h3>
          <p className="mt-1 text-sm text-ink-700">{profile.professionalTitle ?? "Hair professional"}</p>
          <p className="text-sm text-ink-500">{profile.location ?? "Location not listed"}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {verified ? <StatusBadge status="VERIFIED" /> : <StatusBadge status="PENDING" />}
        <span className="badge bg-cream-100 text-ink-700">{profile.yearsOfExperience}+ years</span>
        {profile.profileCompletion !== undefined ? (
          <span className="badge bg-cream-100 text-ink-700">{profile.profileCompletion}% complete</span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(profile.skills ?? []).slice(0, 4).map((item) => (
          <span key={item.skill.id} className="badge bg-cream-50 text-ink-700">
            {item.skill.name}
          </span>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <Link className="btn-secondary flex-1" to={`/professionals/${profile.id}`}>
          View profile
        </Link>
        {onContact ? (
          <button className="btn-primary flex-1" type="button" onClick={onContact}>
            Contact
          </button>
        ) : null}
      </div>
    </article>
  );
}
