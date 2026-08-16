export function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">About</p>
      <h1 className="mt-3 font-display text-5xl">A professional register for the hair industry.</h1>
      <div className="mt-6 space-y-4 text-ink-700">
        <p>
          MM Connect is built for Marjorie Milner College, a Victorian Registered Training Organisation. It helps
          qualified hairdressers present their work and helps salons find people whose skills and credentials they can
          trust.
        </p>
        <p>
          This is not a social network, a booking calendar, or a student management system. The product is deliberately
          narrow: hairdresser to employer, with MMCollege as the verification authority.
        </p>
        <p>
          A qualification is shown as MMCollege Verified only when an administrator has recorded that decision in the
          database. Matching scores never change verification status.
        </p>
      </div>
    </main>
  );
}
