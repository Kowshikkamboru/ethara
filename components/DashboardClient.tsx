"use client";

import { TaskStatus } from "@prisma/client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type DashboardProject = {
  id: string;
  name: string;
  description: string | null;
  _count: { tasks: number };
};

type DashboardTask = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null;
  project: { id: string; name: string };
  assignee: { id: string; name: string | null; email: string } | null;
};

type DashboardUser = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "MEMBER";
};

type Props = {
  role: "ADMIN" | "MEMBER";
  projects: DashboardProject[];
  tasks: DashboardTask[];
};

export function DashboardClient({ role, projects: initialProjects, tasks: initialTasks }: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskProjectId, setTaskProjectId] = useState(initialProjects[0]?.id ?? "");
  const [projectMemberIds, setProjectMemberIds] = useState<string[]>([]);
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      if (role !== "ADMIN") {
        return;
      }

      const response = await fetch("/api/users", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { users: DashboardUser[] };
      setUsers(payload.users);
    }

    loadUsers();
  }, [role]);

  const summary = useMemo(() => {
    const now = new Date();
    const done = tasks.filter((task) => task.status === TaskStatus.DONE).length;
    const pending = tasks.filter((task) => task.status !== TaskStatus.DONE).length;
    const overdue = tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== TaskStatus.DONE,
    ).length;

    return { done, pending, overdue };
  }, [tasks]);

  async function refreshData() {
    const [projectsResponse, tasksResponse] = await Promise.all([
      fetch("/api/projects", { cache: "no-store" }),
      fetch("/api/tasks", { cache: "no-store" }),
    ]);

    const projectsPayload = (await projectsResponse.json()) as { projects: DashboardProject[] };
    const tasksPayload = (await tasksResponse.json()) as { tasks: DashboardTask[] };

    if (projectsResponse.ok) {
      setProjects(projectsPayload.projects);
      if (!taskProjectId && projectsPayload.projects[0]?.id) {
        setTaskProjectId(projectsPayload.projects[0].id);
      }
    }

    if (tasksResponse.ok) {
      setTasks(tasksPayload.tasks);
    }
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: projectName,
        description: projectDescription || undefined,
        memberIds: projectMemberIds,
      }),
    });

    setBusy(false);

    if (!response.ok) {
      setError("Unable to create project.");
      return;
    }

    setProjectName("");
    setProjectDescription("");
    setProjectMemberIds([]);
    await refreshData();
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription || undefined,
        projectId: taskProjectId,
        assigneeId: taskAssigneeId || undefined,
      }),
    });

    setBusy(false);

    if (!response.ok) {
      setError("Unable to create task.");
      return;
    }

    setTaskTitle("");
    setTaskDescription("");
    setTaskAssigneeId("");
    await refreshData();
  }

  function toggleProjectMember(memberId: string) {
    setProjectMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    setError(null);
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setError("Unable to update task status.");
      return;
    }

    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-cyan-50 p-5">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-3xl font-semibold text-slate-900">{summary.pending}</p>
        </article>
        <article className="rounded-2xl bg-emerald-50 p-5">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-3xl font-semibold text-slate-900">{summary.done}</p>
        </article>
        <article className="rounded-2xl bg-rose-50 p-5">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="text-3xl font-semibold text-slate-900">{summary.overdue}</p>
        </article>
      </section>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      {role === "ADMIN" ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <form className="rounded-2xl border border-slate-200 bg-white p-5" onSubmit={handleCreateProject}>
            <h2 className="text-lg font-semibold text-slate-900">Create project</h2>
            <div className="mt-3 space-y-3">
              <input
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Description"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
              <div className="space-y-2 rounded-xl border border-slate-100 p-3">
                <p className="text-sm font-medium text-slate-700">Add members</p>
                <div className="grid gap-2">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={projectMemberIds.includes(user.id)}
                        onChange={() => toggleProjectMember(user.id)}
                      />
                      <span>{user.name || user.email}</span>
                    </label>
                  ))}
                  {users.length === 0 ? (
                    <p className="text-xs text-slate-400">No users available yet.</p>
                  ) : null}
                </div>
              </div>
              <button
                disabled={busy}
                type="submit"
                className="rounded-xl bg-cyan-700 px-4 py-2 font-medium text-white transition hover:bg-cyan-600"
              >
                Add project
              </button>
            </div>
          </form>

          <form className="rounded-2xl border border-slate-200 bg-white p-5" onSubmit={handleCreateTask}>
            <h2 className="text-lg font-semibold text-slate-900">Create task</h2>
            <div className="mt-3 space-y-3">
              <input
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Description"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
              <select
                required
                value={taskProjectId}
                onChange={(e) => setTaskProjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <select
                value={taskAssigneeId}
                onChange={(e) => setTaskAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
              <button
                disabled={busy || projects.length === 0}
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
              >
                Add task
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="rounded-xl border border-slate-100 p-4">
              <h3 className="font-semibold text-slate-800">{project.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{project.description ?? "No description"}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                {project._count.tasks} tasks
              </p>
            </article>
          ))}
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500">No projects yet.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
        <div className="mt-3 space-y-3">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-800">{task.title}</p>
                <p className="text-sm text-slate-500">{task.project.name}</p>
                <p className="text-xs text-slate-400">
                  {task.assignee?.name || task.assignee?.email || "Unassigned"}
                </p>
              </div>

              <label className="text-sm text-slate-500">
                Status
                <select
                  className="ml-2 rounded-lg border border-slate-200 px-2 py-1 text-slate-700"
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                >
                  <option value={TaskStatus.TODO}>TODO</option>
                  <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
                  <option value={TaskStatus.DONE}>DONE</option>
                </select>
              </label>
            </article>
          ))}
          {tasks.length === 0 ? <p className="text-sm text-slate-500">No tasks available.</p> : null}
        </div>
      </section>
    </div>
  );
}
