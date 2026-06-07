import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import LocationCard from "../components/LocationCard";

const CARD_SELECT =
  "id, name, type, resource, planet, color, x, y, z, server_name, avg_score, rating_count";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: recent }, { data: top }] = await Promise.all([
    supabase
      .from("locations_with_stats")
      .select(CARD_SELECT)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("locations_with_stats")
      .select(CARD_SELECT)
      .eq("is_hidden", false)
      .gt("rating_count", 0)
      .order("avg_score", { ascending: false })
      .order("rating_count", { ascending: false })
      .limit(6),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Space Engineers
      </p>
      <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">
        Ore &amp; POI Registry
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        A community registry of ore deposits and points of interest, searchable
        by in-game GPS coordinates. Submit a location, find what others have
        charted, and rate the best spots.
      </p>

      <form method="get" action="/locations" className="mt-6 flex max-w-xl gap-2">
        <input
          className="input"
          name="q"
          placeholder="Search by name or description…"
          aria-label="Search locations"
        />
        <button type="submit" className="btn-primary shrink-0">
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/locations" className="btn-ghost">
          Browse all
        </Link>
        <Link href="/submit" className="btn-ghost">
          Submit a location
        </Link>
      </div>

      {top && top.length > 0 && (
        <LocationSection title="Top rated" href="/locations?sort=rating" items={top} />
      )}

      {recent && recent.length > 0 ? (
        <LocationSection title="Recently added" href="/locations" items={recent} />
      ) : (
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
      )}
    </main>
  );
}

function LocationSection({ title, href, items }) {
  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link className="link text-sm" href={href}>
          See all →
        </Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>
    </section>
  );
}

function Feature({ title, body }) {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}
