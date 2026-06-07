import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { requireUser, isAdmin } from "../../../../lib/auth";
import EditForm from "./EditForm";

export const metadata = { title: "Edit location — Ore & POI Registry" };

export default async function EditLocationPage({ params }) {
  const { id } = await params;
  const { user, profile } = await requireUser(`/locations/${id}/edit`);

  const supabase = await createClient();
  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!location) notFound();

  const canManage = location.submitted_by === user.id || isAdmin(profile);
  if (!canManage) redirect(`/locations/${id}`);

  const { data: servers } = await supabase
    .from("servers")
    .select("id, name")
    .order("name");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link className="link text-sm" href={`/locations/${id}`}>
        ← Back to location
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Edit location</h1>

      <div className="mt-6">
        <EditForm servers={servers ?? []} location={location} />
      </div>
    </main>
  );
}
