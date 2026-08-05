/* WARNING: This is a FRONTEND MOCK for UI demonstration only. In production, this MUST be replaced with a secure backend authentication provider like Supabase Auth. Never hardcode credentials in production frontend code. */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminLogin } from "@/lib/admin-auth.functions";
import { checkMockCredentials, setAdminAuthed } from "@/lib/admin-mock-auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign In — DZ Address Picker Dashboard" },
      {
        name: "description",
        content: "Sign in to the DZ Address Picker dashboard to review API traffic and widget usage.",
      },
      { property: "og:title", content: "Sign In — DZ Address Picker Dashboard" },
      {
        property: "og:description",
        content: "Sign in to the DZ Address Picker dashboard to review API traffic and widget usage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const serverLogin = useServerFn(adminLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);

    if (!checkMockCredentials(email, password)) {
      setError(true);
      return;
    }

    setLoading(true);
    // Also opens the real server session so dashboard analytics can be queried.
    try {
      await serverLogin({ data: { email, password } });
    } catch {
      /* dashboard falls back to its own empty state */
    }
    setAdminAuthed();
    setLoading(false);
    void navigate({ to: "/admin" });
  }

  const field =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

  return (
    <div
      dir="ltr"
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-[system-ui,Inter,sans-serif] antialiased"
    >
      <div className="mx-auto w-full max-w-md">
        <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold tracking-tighter text-black uppercase">Admin Access</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium leading-relaxed">Sign in to view the analytics dashboard.</p>


          <label className="mt-6 block text-xs font-medium text-gray-500" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1.5 ${field}`}
          />

          <label className="mt-4 block text-xs font-medium text-gray-500" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1.5 ${field}`}
          />

          {error && (
            <p role="alert" className="mt-3 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              Invalid email or password. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black p-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {loading ? "Signing in…" : "Sign In to Dashboard"}
          </button>

        </form>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-gray-500 transition hover:text-black">
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
