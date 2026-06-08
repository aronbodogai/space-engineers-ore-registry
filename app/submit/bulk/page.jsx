import Link from "next/link";
import { requireUser } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import BulkImportForm from "./BulkImportForm";

export const metadata = { title: "Bulk import — Ore & POI Registry" };

export default async function BulkImportPage() {
  const { profile } = await requireUser("/submit/bulk");

  const supabase = await createClient();
  const { data: servers } = await supabase
    .from("servers")
    .select("id, name")
    .order("name");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">Bulk import locations</h1>
      <p className="mt-1 text-sm text-muted">
        Paste a whole batch of GPS strings — one per line, straight from the
        game&apos;s GPS tab. We&apos;ll parse each one, guess the ore from the
        marker name, and let you review before publishing.{" "}
        <Link className="link" href="/submit">
          Just one? Use the single form →
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
          <BulkImportForm servers={servers} />
        </div>
      )}
    </main>
  );
}
