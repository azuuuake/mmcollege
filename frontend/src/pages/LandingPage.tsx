import { Link } from "react-router-dom";

const steps = [
  { title: "Create a professional profile", body: "Share your experience, skills, and the work you are proud of." },
  { title: "Verify your credentials", body: "Upload qualifications for review by MMCollege administrators." },
  { title: "Connect with the right salon", body: "Employers search verified professionals and start a conversation." }
];

export function LandingPage() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Connect. Showcase. Grow.</p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            Connect skilled hair professionals with the right opportunities.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-700">
            Create a professional profile, showcase your qualifications and experience, and connect with employers
            looking for skilled hair professionals.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" to="/register?role=HAIRDRESSER">
              I&apos;m a Hairdresser
            </Link>
            <Link className="btn-secondary" to="/register?role=EMPLOYER">
              I&apos;m an Employer
            </Link>
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="bg-ink-950 px-6 py-8 text-cream-50">
            <p className="text-sm uppercase tracking-[0.2em] text-gold-400">MMCollege verified</p>
            <h2 className="mt-3 font-display text-4xl">Trusted credentials, not a social feed.</h2>
            <p className="mt-4 text-cream-200">
              Qualifications are marked verified only after an authorised MMCollege administrator reviews them.
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-cream-200 bg-white text-center">
            {[
              ["Hairdressers", "Profiles"],
              ["Salons", "Hiring"],
              ["Credentials", "Reviewed"]
            ].map(([label, value]) => (
              <div key={label} className="px-3 py-5">
                <p className="font-display text-2xl">{value}</p>
                <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-4xl">How MM Connect works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="card p-6">
                <p className="text-sm font-semibold text-rose-600">0{index + 1}</p>
                <h3 className="mt-3 font-display text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-700">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
