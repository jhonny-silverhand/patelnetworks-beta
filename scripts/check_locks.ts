import { prisma } from '../src/server/db';

async function checkLocks() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT pid, now() - query_start AS duration, state, query
    FROM pg_stat_activity
    WHERE state != 'idle' AND pid != pg_backend_pid();
  `);
  console.log('Active queries & locks:', result);
}

checkLocks().finally(() => prisma.$disconnect());
