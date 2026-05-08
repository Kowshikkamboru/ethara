require('dotenv/config');

// Minimal JS Prisma config to avoid requiring TypeScript tooling during CI/builds.
module.exports = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
