export function Alert({
  tone = "error",
  children
}: {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-cream-200 bg-cream-100 text-ink-900"
  };
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>;
}
