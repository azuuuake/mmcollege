export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p className="py-16 text-center text-sm text-ink-500">{label}</p>;
}
