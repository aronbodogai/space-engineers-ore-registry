import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import SignupForm from "./SignupForm";

export const metadata = { title: "Sign up — Ore & POI Registry" };

export default async function SignupPage() {
  const { user } = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Create an account</h1>
      <p className="mt-1 text-sm text-muted">
        Submit and rate locations once you&apos;re signed in.
      </p>

      <div className="card mt-6">
        <SignupForm />
      </div>

      <p className="mt-4 text-sm text-muted">
        Already have an account?{" "}
        <Link className="link" href="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}
