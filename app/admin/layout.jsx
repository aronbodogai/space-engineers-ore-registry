import { requireAdmin } from "../../lib/auth";
import AdminTabs from "./AdminTabs";

export const metadata = { title: "Admin — Ore & POI Registry" };

/** Guards every /admin route: only admins get past requireAdmin(). */
export default async function AdminLayout({ children }) {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">Admin</h1>
      <AdminTabs />
      <div className="mt-6">{children}</div>
    </main>
  );
}
