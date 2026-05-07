import { Role, TaskStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchTaskSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = patchTaskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update payload." }, { status: 400 });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      assigneeId: true,
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  if (session.user.role !== Role.ADMIN) {
    const disallowedKey = Object.keys(parsed.data).find((key) => key !== "status");
    if (disallowedKey) {
      return NextResponse.json(
        { error: "Members can only update task status." },
        { status: 403 },
      );
    }

    if (task.assigneeId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      dueDate:
        parsed.data.dueDate === null
          ? null
          : parsed.data.dueDate
            ? new Date(parsed.data.dueDate)
            : undefined,
      assigneeId: parsed.data.assigneeId,
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json({ task: updatedTask });
}
