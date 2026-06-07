import Link from "next/link";
import { getCurrentUser, isAdmin } from "../lib/auth";

/**
 * Top navigation bar. Server Component — reads the session so it can show the
 * right links for visitors, members, and admins. Sign-out is handled by a small
 * client form posting to /auth/signout (added with the auth feature).
 */
export default async function Nav() {
  const { user, profile } = await getCurrentUser();
  const admin = isAdmin(profile);

  return (
    <header className="border-b border-[--color-border] bg-[--color-surface]/60 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[--color-accent]">
            SE
          </span>
          <span className="text-sm font-semibold">Ore &amp; POI Registry</span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <Link
            href="/locations"
            className="rounded-md px-3 py-1.5 text-[--color-muted] hover:text-[--color-text]"
          >
            Browse
          </Link>

          {user && (
            <Link
              href="/submit"
              className="rounded-md px-3 py-1.5 text-[--color-muted] hover:text-[--color-text]"
            >
              Submit
            </Link>
          )}

          {admin && (
            <Link
              href="/admin"
              className="rounded-md px-3 py-1.5 text-[--color-muted] hover:text-[--color-text]"
            >
              Admin
            </Link>
          )}

          {user ? (
            <Link href="/profile" className="btn-ghost ml-2">
              {profile?.username ?? "Account"}
            </Link>
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
