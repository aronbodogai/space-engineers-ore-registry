import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { setHidden, deleteLocation } from "../locations/actions";
import ConfirmButton from "../../components/ConfirmButton";
import { formatDate } from "../../lib/format";

export default async function AdminContentPage({ searchParams }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";

  const supabase = await createClient();
  let query = supabase
    .from("locations")
    .select(
      "id, name, type, is_hidden, created_at, server:servers(name), submitter:profiles(username)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const safeQ = q.replace(/[,()%*\\]/g, " ").trim();
  if (safeQ) query = query.ilike("name", `%${safeQ}%`);

  const { data: locations } = await query;

  return (
    <div className="space-y-6">
      <form method="get" className="flex gap-2">
        <input
          className="input"
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
        />
        <button className="btn-primary shrink-0" type="submit">
          Search
        </button>
        {q && (
          <Link className="btn-ghost shrink-0" href="/admin">
            Clear
          </Link>
        )}
      </form>

      <p className="text-sm text-muted">
        Showing {locations?.length ?? 0} most recent
        {q ? ` matching “${q}”` : ""} (max 100).
      </p>

      <div className="space-y-2">
        {locations?.map((loc) => (
          <div
            key={loc.id}
            className="card flex flex-wrap items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  className="link font-semibold"
                  href={`/locations/${loc.id}`}
                >
                  {loc.name}
                </Link>
                <span className="badge">
                  {loc.type === "ore" ? "Ore" : "POI"}
                </span>
                {loc.is_hidden && (
                  <span className="badge text-amber-300">Hidden</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">
                {loc.server?.name ?? "—"} · by{" "}
                {loc.submitter?.username ?? "unknown"} ·{" "}
                {formatDate(loc.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link className="btn-ghost" href={`/locations/${loc.id}/edit`}>
                Edit
              </Link>
              <form action={setHidden}>
                <input type="hidden" name="id" value={loc.id} />
                <input
                  type="hidden"
                  name="hidden"
                  value={(!loc.is_hidden).toString()}
                />
                <button className="btn-ghost" type="submit">
                  {loc.is_hidden ? "Un-hide" : "Hide"}
                </button>
              </form>
              <form action={deleteLocation}>
                <input type="hidden" name="id" value={loc.id} />
                <ConfirmButton
                  message={`Delete “${loc.name}”? This cannot be undone.`}
                >
                  Delete
                </ConfirmButton>
              </form>
            </div>
          </div>
        ))}

        {(!locations || locations.length === 0) && (
          <p className="text-sm text-muted">No locations found.</p>
        )}
      </div>
    </div>
  );
}
