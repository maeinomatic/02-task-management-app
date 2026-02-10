import { PrismaClient } from '@prisma/client';

const databaseUrl = 'postgresql://devuser:devpass@localhost:5432/taskdb';

console.log('Testing Prisma connection with URL:', databaseUrl);

const prisma = new PrismaClient({});

try {
  const result = await prisma.$queryRaw`SELECT 1 as test`;
  console.log('✓ Prisma connected successfully! Result:', result);
  const boards = await prisma.board.findMany();
  console.log('✓ Found', boards.length, 'boards');
} catch (error) {
  console.error('✗ Prisma connection failed:');
  console.error('  Error message:', error?.message);
  console.error('  Error code:', error?.code);
  console.error('  Full error:', error);
} finally {
  await prisma.$disconnect();
}
