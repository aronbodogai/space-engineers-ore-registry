import Link from "next/link";
import LocationCard from "../../components/LocationCard";
import LocationFilters from "./LocationFilters";
import { getServers, getBrowseLocations, PAGE_SIZE } from "../../lib/queries";

export const metadata = {
  title: "Browse locations — Ore & POI Registry",
  description:
    "Search and filter Space Engineers ore deposits and points of interest by world, type, resource, planet, and rating.",
};

// Note: search runs server-side and lives in the URL so listings stay
// crawlable and shareable (SPEC §2 SEO goal). Turnstile bot-protection is
// applied to the write/auth flows (submit, login, signup) rather than gating
// every GET search, which would break SEO and shareable links.

export default async function LocationsPage({ searchParams }) {
  const sp = await searchParams;
  const str = (v) => (typeof v === "string" ? v : "");
  const params = {
    q: str(sp.q),
    server: str(sp.server),
    type: str(sp.type),
    resource: str(sp.resource),
    planet: str(sp.planet),
    minRating: str(sp.minRating),
    sort: str(sp.sort) || "newest",
    page: Math.max(1, parseInt(str(sp.page), 10) || 1),
  };

  const [servers, { locations, count, error }] = await Promise.all([
    getServers(),
    getBrowseLocations(params),
  ]);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Browse locations</h1>
        <Link className="btn-ghost" href="/submit">
          Submit a location
        </Link>
      </div>

      <div className="mt-6">
        <LocationFilters servers={servers ?? []} params={params} />
      </div>

      {error && (
        <p className="alert alert-error mt-6">
          Couldn&apos;t load locations: {error}
        </p>
      )}

      {!error && (
        <>
          <p className="mt-6 text-sm text-muted">
            {total} location{total === 1 ? "" : "s"} found
          </p>

          {locations && locations.length > 0 ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((loc) => (
                <LocationCard key={loc.id} loc={loc} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              No locations match your filters.
            </p>
          )}

          {totalPages > 1 && (
            <Pagination
              page={params.page}
              totalPages={totalPages}
              params={params}
            />
          )}
        </>
      )}
    </main>
  );
}

function Pagination({ page, totalPages, params }) {
  const href = (p) => {
    const u = new URLSearchParams();
    if (params.q) u.set("q", params.q);
    if (params.server) u.set("server", params.server);
    if (params.type) u.set("type", params.type);
    if (params.resource) u.set("resource", params.resource);
    if (params.planet) u.set("planet", params.planet);
    if (params.minRating) u.set("minRating", params.minRating);
    if (params.sort && params.sort !== "newest") u.set("sort", params.sort);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/locations?${s}` : "/locations";
  };

  return (
    <nav className="mt-8 flex items-center justify-center gap-3 text-sm">
      {page > 1 ? (
        <Link className="btn-ghost" href={href(page - 1)}>
          ← Prev
        </Link>
      ) : (
        <span className="btn-ghost pointer-events-none opacity-50">← Prev</span>
      )}
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link className="btn-ghost" href={href(page + 1)}>
          Next →
        </Link>
      ) : (
        <span className="btn-ghost pointer-events-none opacity-50">Next →</span>
      )}
    </nav>
  );
}
