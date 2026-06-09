import Link from "next/link";
import { getCurrentUser, isAdmin } from "../lib/auth";
import Logo from "./Logo";

/**
 * Top navigation bar. Server Component — reads the session so it can show the
 * right links for visitors, members, and admins. Sign-out posts to the
 * /auth/signout route handler.
 */
export default async function Nav() {
  const { user, profile } = await getCurrentUser();
  const admin = isAdmin(profile);

  return (
    <header className="border-b border-border bg-surface/60 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="text-sm font-semibold">Ore &amp; POI Registry</span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <Link
            href="/locations"
            className="rounded-md px-3 py-1.5 text-muted hover:text-text"
          >
            Browse
          </Link>

          <Link
            href="/nearby"
            className="rounded-md px-3 py-1.5 text-muted hover:text-text"
          >
            Nearest
          </Link>

          {user && (
            <Link
              href="/submit"
              className="rounded-md px-3 py-1.5 text-muted hover:text-text"
            >
              Submit
            </Link>
          )}

          {admin && (
            <Link
              href="/admin"
              className="rounded-md px-3 py-1.5 text-muted hover:text-text"
            >
              Admin
            </Link>
          )}

          {user ? (
            <>
              <Link href="/profile" className="btn-ghost ml-2">
                {profile?.username ?? "Account"}
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-muted hover:text-text"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost ml-2">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
