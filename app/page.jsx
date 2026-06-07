import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[--color-accent]">
        Space Engineers
      </p>
      <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
        Ore &amp; POI Registry
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[--color-muted]">
        A community registry of ore deposits and points of interest, searchable
        by in-game GPS coordinates. Submit a location, find what others have
        charted, and rate the best spots.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/locations" className="btn-primary">
          Browse locations
        </Link>
        <Link href="/submit" className="btn-ghost">
          Submit a location
        </Link>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        <Feature
          title="Paste a GPS string"
          body="Copy a location straight from the game. We parse the name and X/Y/Z automatically."
        />
        <Feature
          title="Search by world"
          body="Coordinates are scoped per server, with filters for type, resource, and planet."
        />
        <Feature
          title="Rated by players"
          body="One rating per player per spot, so the best deposits rise to the top."
        />
      </div>
    </main>
  );
}

function Feature({ title, body }) {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[--color-muted]">{body}</p>
    </div>
  );
}
