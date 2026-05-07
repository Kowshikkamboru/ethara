# Team Task Manager

Full-stack Next.js app with Prisma Postgres, NextAuth credentials auth, role-based access, and task/project APIs.

## Stack

- Next.js App Router + TypeScript
- Prisma ORM + Prisma Postgres
- NextAuth credentials authentication
- Tailwind CSS

## Local setup

1. Install dependencies

	npm install

2. Ensure environment variables exist in .env

	DATABASE_URL=...
	NEXTAUTH_SECRET=...
	NEXTAUTH_URL=http://localhost:3000

3. Apply migrations and seed

	npx prisma migrate dev
	npx prisma db seed

4. Run app

	npm run dev -- --webpack

## Deployment on Railway

1. Connect this repository to Railway as a new service.
2. Configure environment variables in Railway service settings:
	- DATABASE_URL
	- NEXTAUTH_SECRET
	- NEXTAUTH_URL (set to your Railway public URL)
3. Deploy from main branch.

Railway config is included in [railway.json](railway.json).

## Useful commands

- Build: npm run build
- Start: npm run start
- Lint: npm run lint
- Typecheck: npx tsc --noEmit
- Prisma Studio: npx prisma studio
- Verify DB connectivity: npx tsx scripts/verify-prisma.ts
