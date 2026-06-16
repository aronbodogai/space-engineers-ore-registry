import { createClient } from "../../../lib/supabase/server";
import { requireAdmin } from "../../../lib/auth";
import { setRole, setBanned } from "./actions";
import SubmitButton from "../../../components/SubmitButton";
import { formatDate } from "../../../lib/format";

export default async function AdminUsersPage() {
  const { user: me } = await requireAdmin();

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, username, role, banned, created_at, locations(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{users?.length ?? 0} users</p>

      {users?.map((u) => {
        const count = u.locations?.[0]?.count ?? 0;
        const isMe = u.id === me.id;
        return (
          <div
            key={u.id}
            className="card flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{u.username}</span>
                <span className="badge capitalize">{u.role}</span>
                {u.banned && <span className="badge text-red-300">Banned</span>}
                {isMe && <span className="badge text-accent">You</span>}
              </div>
              <p className="mt-1 text-xs text-muted">
                {count} submission{count === 1 ? "" : "s"} · joined{" "}
                {formatDate(u.created_at)}
              </p>
            </div>

            {!isMe && (
              <div className="flex items-center gap-2">
                <form action={setRole}>
                  <input type="hidden" name="id" value={u.id} />
                  <input
                    type="hidden"
                    name="role"
                    value={u.role === "admin" ? "member" : "admin"}
                  />
                  <button className="btn-ghost" type="submit">
                    {u.role === "admin" ? "Demote to member" : "Promote to admin"}
                  </button>
                </form>

                <form action={setBanned}>
                  <input type="hidden" name="id" value={u.id} />
                  <input
                    type="hidden"
                    name="banned"
                    value={(!u.banned).toString()}
                  />
                  {u.banned ? (
                    <button className="btn-ghost" type="submit">
                      Unban
                    </button>
                  ) : (
                    <SubmitButton
                      confirm={`Ban ${u.username} from submitting?`}
                    >
                      Ban
                    </SubmitButton>
                  )}
                </form>
              </div>
            )}
          </div>
        );
      })}

      {(!users || users.length === 0) && (
        <p className="text-sm text-muted">No users yet.</p>
      )}
    </div>
  );
}
