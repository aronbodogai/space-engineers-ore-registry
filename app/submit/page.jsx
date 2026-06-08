import Link from "next/link";
import { requireUser } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import SubmitForm from "./SubmitForm";

export const metadata = { title: "Submit a location — Ore & POI Registry" };

export default async function SubmitPage() {
  const { profile } = await requireUser("/submit");

  const supabase = await createClient();
  const { data: servers } = await supabase
    .from("servers")
    .select("id, name")
    .order("name");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">Submit a location</h1>
      <p className="mt-1 text-sm text-muted">
        Paste a GPS string straight from the game — we&apos;ll parse the name and
        coordinates. Your submission is published immediately.{" "}
        <Link className="link" href="/submit/bulk">
          Got a batch? Bulk-import many at once →
        </Link>
      </p>

      {profile?.banned ? (
        <p className="alert alert-error mt-6">
          Your account is currently banned from submitting.
        </p>
      ) : !servers || servers.length === 0 ? (
        <p className="alert alert-warn mt-6">
          No servers exist yet. An admin needs to add a server / world before
          locations can be submitted.
        </p>
      ) : (
        <div className="mt-6">
          <SubmitForm servers={servers} />
        </div>
      )}
    </main>
  );
}
