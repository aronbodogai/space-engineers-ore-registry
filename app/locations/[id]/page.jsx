import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getCurrentUser, isAdmin } from "../../../lib/auth";
import { seColorToCss, formatCoords, formatDate } from "../../../lib/format";
import { typeLabel } from "../../../lib/constants";
import Stars from "../../../components/Stars";
import SubmitButton from "../../../components/SubmitButton";
import CopyGpsButton from "./CopyGpsButton";
import RatingWidget from "./RatingWidget";
import { setHidden, deleteLocation } from "../actions";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("name, type, resource")
    .eq("id", id)
    .maybeSingle();
  if (!data) return { title: "Location not found — Ore & POI Registry" };
  const kind = data.type === "ore" ? data.resource || "Ore" : "POI";
  return {
    title: `${data.name} (${kind}) — Ore & POI Registry`,
  };
}

export default async function LocationDetail({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, profile } = await getCurrentUser();

  const { data: loc } = await supabase
    .from("locations")
    .select("*, server:servers(name), submitter:profiles(username)")
    .eq("id", id)
    .maybeSingle();

  if (!loc) notFound();

  const { data: summary } = await supabase
    .from("location_ratings")
    .select("avg_score, rating_count")
    .eq("location_id", id)
    .maybeSingle();

  let myScore = 0;
  if (user) {
    const { data: mine } = await supabase
      .from("ratings")
      .select("score")
      .eq("location_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    myScore = mine?.score ?? 0;
  }

  const admin = isAdmin(profile);
  const owner = user?.id === loc.submitted_by;
  const canManage = owner || admin;
  const swatch = seColorToCss(loc.color);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link className="link text-sm" href="/locations">
        ← Back to browse
      </Link>

      {loc.is_hidden && (
        <p className="alert alert-warn mt-4">
          This location is hidden — only you and admins can see it.
        </p>
      )}

      <header className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {swatch && (
              <span
                className="inline-block h-5 w-5 shrink-0 rounded border border-border"
                style={{ background: swatch }}
                title={loc.color}
              />
            )}
            <h1 className="truncate text-2xl font-bold">{loc.name}</h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            {loc.server?.name ?? "Unknown server"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {loc.exposed && <span className="badge badge-exposed">Exposed</span>}
          {loc.size && <span className="badge badge-size">{loc.size}</span>}
          <span className="badge">{typeLabel(loc.type)}</span>
        </div>
      </header>

      {/* Coordinates + copy */}
      <section className="card mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label">Coordinates</p>
            <p className="font-mono text-sm">{formatCoords(loc.x, loc.y, loc.z)}</p>
          </div>
          <CopyGpsButton gps={loc.gps_raw} />
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-[#0d1626] p-3 font-mono text-xs text-muted">
          {loc.gps_raw}
        </pre>
      </section>

      {/* Meta */}
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        {loc.type === "ore" && loc.resource && (
          <Meta label="Resource" value={loc.resource} />
        )}
        {loc.planet && <Meta label="Planet" value={loc.planet} />}
        <Meta label="Submitted by" value={loc.submitter?.username ?? "unknown"} />
        <Meta label="Added" value={formatDate(loc.created_at)} />
      </dl>

      {loc.description && (
        <section className="mt-6">
          <h2 className="label">Description</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">{loc.description}</p>
        </section>
      )}

      {loc.image_url && (
        <section className="mt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={loc.image_url}
            alt={`Photo of ${loc.name}`}
            className="w-full rounded-xl border border-border"
          />
        </section>
      )}

      {/* Ratings */}
      <section className="card mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Rating</h2>
          <Stars
            value={summary?.avg_score ?? 0}
            count={summary?.rating_count ?? 0}
          />
        </div>

        <div className="mt-4 border-t border-border pt-4">
          {user ? (
            <RatingWidget locationId={loc.id} initialScore={myScore} />
          ) : (
            <p className="text-sm text-muted">
              <Link className="link" href={`/login?next=/locations/${loc.id}`}>
                Log in
              </Link>{" "}
              to rate this location.
            </p>
          )}
        </div>
      </section>

      {/* Owner / admin controls */}
      {canManage && (
        <section className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Link className="btn-ghost" href={`/locations/${loc.id}/edit`}>
            Edit
          </Link>

          {admin && (
            <form action={setHidden}>
              <input type="hidden" name="id" value={loc.id} />
              <input
                type="hidden"
                name="hidden"
                value={(!loc.is_hidden).toString()}
              />
              <button type="submit" className="btn-ghost">
                {loc.is_hidden ? "Un-hide" : "Hide"}
              </button>
            </form>
          )}

          <form action={deleteLocation}>
            <input type="hidden" name="id" value={loc.id} />
            <input type="hidden" name="redirectTo" value="/locations" />
            <SubmitButton confirm={`Delete “${loc.name}”? This cannot be undone.`}>
              Delete
            </SubmitButton>
          </form>
        </section>
      )}
    </main>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
