export const availabilityLabel: Record<string, string> = {
  IMMEDIATE: "Available immediately",
  TWO_WEEKS: "Available in 2 weeks",
  ONE_MONTH: "Available in 1 month",
  FLEXIBLE: "Flexible start"
};

export const employmentTypeLabel: Record<string, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CASUAL: "Casual",
  CONTRACT: "Contract",
  APPRENTICESHIP: "Apprenticeship"
};

export const employmentStatusLabel: Record<string, string> = {
  EMPLOYED: "Currently employed",
  SEEKING: "Seeking work",
  OPEN_TO_OPPORTUNITIES: "Open to opportunities",
  NOT_LOOKING: "Not looking"
};

export const credentialLabel: Record<string, string> = {
  PENDING: "Pending",
  VERIFIED: "MMCollege Verified",
  REJECTED: "Rejected",
  EXPIRED: "Expired"
};

export function fullName(first?: string, last?: string) {
  return `${first ?? ""} ${last ?? ""}`.trim();
}

export function yearRange(start?: string | null, end?: string | null) {
  if (!start) return "";
  const from = new Date(start).getFullYear();
  const to = end ? new Date(end).getFullYear() : "Present";
  return `${from} - ${to}`;
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
