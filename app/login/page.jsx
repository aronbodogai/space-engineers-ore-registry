import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Log in — Ore & POI Registry" };

export default async function LoginPage({ searchParams }) {
  const { user } = await getCurrentUser();
  if (user) redirect("/");

  const sp = await searchParams;
  const next = typeof sp?.next === "string" ? sp.next : "/";

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-muted">Welcome back, engineer.</p>

      <div className="card mt-6">
        <LoginForm next={next} />
      </div>

      <p className="mt-4 text-sm text-muted">
        No account?{" "}
        <Link className="link" href="/signup">
          Sign up
        </Link>
      </p>
    </main>
  );
}
