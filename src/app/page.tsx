import { ThemeToggle } from "@/components/layout/theme-toggle";
import { money } from "@/lib/utils";

const tones = [
  { label: "Placed", tone: "bg-tone-pending text-tone-pending-foreground" },
  { label: "Confirmed", tone: "bg-tone-info text-tone-info-foreground" },
  { label: "Paid", tone: "bg-tone-progress text-tone-progress-foreground" },
  { label: "Picked up", tone: "bg-tone-success text-tone-success-foreground" },
  { label: "Returned", tone: "bg-tone-neutral text-tone-neutral-foreground" },
  { label: "Cancelled", tone: "bg-tone-danger text-tone-danger-foreground" },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-primary">GearUp</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
            Rent sports &amp; outdoor gear instantly
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Browse gear from trusted local providers, pick your dates, and pay
            securely.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <button className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:opacity-90">
          Browse gear
        </button>
        <button className="rounded-lg border border-border px-5 py-2.5 font-medium transition-colors hover:bg-muted">
          Become a provider
        </button>
      </div>

      <div className="mt-12 flex flex-wrap gap-2">
        {tones.map((item) => (
          <span
            key={item.label}
            className={`rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}
          >
            {item.label}
          </span>
        ))}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Camping tent", "Mountain bike", "Kayak"].map((name, index) => (
          <div
            key={name}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Available from trusted providers
            </p>
            <p className="mt-4 font-semibold tabular-nums text-primary">
              {money(24.5 * (index + 1))}
              <span className="text-muted-foreground"> / day</span>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
