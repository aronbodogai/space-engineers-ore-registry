import { createClient } from "../../../lib/supabase/server";
import CreateServerForm from "./CreateServerForm";
import { renameServer, deleteServer } from "./actions";
import SubmitButton from "../../../components/SubmitButton";
import ConfirmButton from "../../../components/ConfirmButton";

export default async function AdminServersPage() {
  const supabase = await createClient();
  const { data: servers } = await supabase
    .from("servers")
    .select("id, name, description, created_at, locations(count)")
    .order("name");

  return (
    <div className="space-y-8">
      <CreateServerForm />

      <section className="space-y-3">
        <h2 className="font-semibold">Servers ({servers?.length ?? 0})</h2>

        {(!servers || servers.length === 0) && (
          <p className="text-sm text-muted">No servers yet — add one above.</p>
        )}

        {servers?.map((s) => {
          const count = s.locations?.[0]?.count ?? 0;
          return (
            <div key={s.id} className="card space-y-4">
              <form action={renameServer} className="space-y-3">
                <input type="hidden" name="id" value={s.id} />
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    name="name"
                    defaultValue={s.name}
                    required
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input
                    className="input"
                    name="description"
                    defaultValue={s.description ?? ""}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {count} location{count === 1 ? "" : "s"}
                  </span>
                  <SubmitButton className="btn-ghost" pendingText="Saving…">
                    Save changes
                  </SubmitButton>
                </div>
              </form>

              <form action={deleteServer} className="border-t border-border pt-3">
                <input type="hidden" name="id" value={s.id} />
                <ConfirmButton
                  message={`Delete “${s.name}”? This permanently deletes the server and its ${count} location(s). This cannot be undone.`}
                >
                  Delete server
                </ConfirmButton>
              </form>
            </div>
          );
        })}
      </section>
    </div>
  );
}
