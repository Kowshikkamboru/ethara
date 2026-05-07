import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/DashboardClient";
import { SignOutButton } from "@/components/SignOutButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: session.user.id }, { members: { some: { id: session.user.id } } }],
    },
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const tasks = await prisma.task.findMany({
    where:
      session.user.role === Role.ADMIN
        ? {
            project: {
              OR: [{ ownerId: session.user.id }, { members: { some: { id: session.user.id } } }],
            },
          }
        : { assigneeId: session.user.id },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      project: {
        select: { id: true, name: true },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(165deg,#ecfeff_0%,#f8fafc_40%,#fefce8_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/75 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Team Task Manager
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Hi {session.user.name || session.user.email}
            </h1>
            <p className="text-sm text-slate-500">Role: {session.user.role}</p>
          </div>
          <SignOutButton />
        </header>

        <DashboardClient
          role={session.user.role}
          projects={projects}
          tasks={tasks.map((task) => ({
            ...task,
            dueDate: task.dueDate?.toISOString() ?? null,
          }))}
        />
      </div>
    </main>
  );
}
