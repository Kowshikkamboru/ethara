import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/RegisterForm";
import { authOptions } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#fef3c7_8%,transparent_45%),radial-gradient(circle_at_bottom_right,#bae6fd_8%,transparent_45%)]" />
      <RegisterForm />
    </main>
  );
}
