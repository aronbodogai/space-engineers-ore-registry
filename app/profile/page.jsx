import Link from "next/link";
import { requireUser } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import { deleteLocation } from "../locations/actions";
import Stars from "../../components/Stars";
import ConfirmButton from "../../components/ConfirmButton";
import { formatDate } from "../../lib/format";

export const metadata = { title: "Your profile — Ore & POI Registry" };

export default async function ProfilePage() {
  const { user, profile } = await requireUser("/profile");

  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("locations_with_stats")
    .select(
      "id, name, type, resource, planet, server_name, is_hidden, created_at, avg_score, rating_count"
    )
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">Your profile</h1>

      <section className="card mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">{profile?.username ?? "—"}</p>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge capitalize">{profile?.role ?? "member"}</span>
            <form action="/auth/signout" method="post">
              <button className="btn-ghost" type="submit">
                Log out
              </button>
            </form>
          </div>
        </div>
        {profile?.banned && (
          <p className="alert alert-error mt-4">
            Your account is banned from submitting.
          </p>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">
            Your submissions ({locations?.length ?? 0})
          </h2>
          <Link className="btn-primary" href="/submit">
            Submit a location
          </Link>
        </div>

        {!locations || locations.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            You haven&apos;t submitted any locations yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {locations.map((loc) => (
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
                    {loc.server_name}
                    {loc.resource ? ` · ${loc.resource}` : ""}
                    {loc.planet ? ` · ${loc.planet}` : ""} ·{" "}
                    {formatDate(loc.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Stars value={loc.avg_score} count={loc.rating_count} />
                  <Link className="btn-ghost" href={`/locations/${loc.id}/edit`}>
                    Edit
                  </Link>
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
          </div>
        )}
      </section>
    </main>
  );
}
