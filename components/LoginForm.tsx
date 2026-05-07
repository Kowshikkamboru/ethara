"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      className="w-full max-w-md space-y-4 rounded-2xl border border-cyan-100 bg-white/95 p-8 shadow-lg shadow-cyan-100"
      onSubmit={onSubmit}
    >
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Welcome back
      </h1>
      <p className="text-sm text-slate-500">Sign in to manage projects and tasks.</p>

      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-400 transition focus:ring"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Password
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-400 transition focus:ring"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-cyan-700 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
