"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const payload = (await response.json()) as { error?: string };

    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Could not create your account.");
      return;
    }

    router.push("/login");
  }

  return (
    <form
      className="w-full max-w-md space-y-4 rounded-2xl border border-amber-100 bg-white/95 p-8 shadow-lg shadow-amber-100"
      onSubmit={onSubmit}
    >
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Create account
      </h1>
      <p className="text-sm text-slate-500">Start as a MEMBER. Admins can be promoted in DB.</p>

      <label className="block text-sm font-medium text-slate-700">
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-amber-400 transition focus:ring"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-amber-400 transition focus:ring"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Password (8+ chars)
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-amber-400 transition focus:ring"
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
        {loading ? "Creating..." : "Create account"}
      </button>

      <p className="text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-amber-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
