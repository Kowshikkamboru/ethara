import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Role, TaskStatus } from "../generated/prisma/enums";
import { Pool } from "pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@ethara.dev" },
    update: { name: "Admin User", role: Role.ADMIN },
    create: {
      email: "admin@ethara.dev",
      password: "seed_password_replace_me",
      name: "Admin User",
      role: Role.ADMIN,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@ethara.dev" },
    update: { name: "Member User", role: Role.MEMBER },
    create: {
      email: "member@ethara.dev",
      password: "seed_password_replace_me",
      name: "Member User",
      role: Role.MEMBER,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Sprint Launch",
      description: "Initial seeded project",
      ownerId: admin.id,
      members: {
        connect: [{ id: member.id }],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Create API routes",
        description: "Implement project and task route handlers",
        status: TaskStatus.IN_PROGRESS,
        projectId: project.id,
        assigneeId: admin.id,
      },
      {
        title: "Design dashboard cards",
        description: "Build pending, completed, and overdue cards",
        status: TaskStatus.TODO,
        projectId: project.id,
        assigneeId: member.id,
      },
      {
        title: "Deploy to Railway",
        description: "Set env vars and verify production",
        status: TaskStatus.TODO,
        projectId: project.id,
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
