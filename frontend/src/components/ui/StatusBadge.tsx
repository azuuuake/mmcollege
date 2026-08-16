import { credentialLabel } from "../../utils/labels";
import { classNames } from "../../utils/labels";

const styles: Record<string, string> = {
  PENDING: "bg-gold-400/20 text-ink-900",
  VERIFIED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-cream-200 text-ink-700",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  DRAFT: "bg-cream-200 text-ink-700",
  CLOSED: "bg-ink-950/10 text-ink-700"
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={classNames("badge", styles[status] ?? "bg-cream-200")}>{credentialLabel[status] ?? status}</span>;
}
