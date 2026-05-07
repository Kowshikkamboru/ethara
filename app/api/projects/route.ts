import { Role } from "@/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional(),
  memberIds: z.array(z.string().uuid()).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: session.user.id }, { members: { some: { id: session.user.id } } }],
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      members: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Admin role required." }, { status: 403 });
  }

  const parsed = createProjectSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid project payload." }, { status: 400 });
  }

  const memberIds = Array.from(new Set(parsed.data.memberIds ?? [])).filter(
    (id) => id !== session.user.id,
  );

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      ownerId: session.user.id,
      members: memberIds.length > 0 ? { connect: memberIds.map((id) => ({ id })) } : undefined,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      members: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
