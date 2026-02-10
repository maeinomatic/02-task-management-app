// dotenv is loaded centrally (e.g. in `src/index.ts`).
// Lazily import PrismaClient below only when needed to avoid import-time errors

const useInMemory = (process.env.USE_IN_MEMORY === 'true') || process.env.NODE_ENV === 'test';

console.log('[boardsRepository] useInMemory:', useInMemory, 'USE_IN_MEMORY env:', process.env.USE_IN_MEMORY);

type Board = { id: number; title: string; description?: string; createdAt?: Date };

let inMemoryBoards: Board[] = [];

const inMemoryImpl = {
  async getAll(): Promise<Board[]> {
    return inMemoryBoards;
  },
  async getById(id: string) {
    return inMemoryBoards.find(b => b.id === Number(id)) ?? null;
  },
  async create(payload: { title: string; description?: string }) {
    const id = Date.now();
    const board: Board = { id, title: payload.title, description: payload.description ?? '', createdAt: new Date() };
    inMemoryBoards.unshift(board);
    return board;
  },
  async delete(id: string) {
    inMemoryBoards = inMemoryBoards.filter(b => b.id !== Number(id));
  },
};

let pgImpl: any = null;
if (!useInMemory) {
  // Lazy-initialize Prisma with pg adapter
  async function getPrismaClient() {
    const [{ PrismaClient }, { PrismaPg }, { Pool }] = await Promise.all([
      import('@prisma/client'),
      import('@prisma/adapter-pg'),
      import('pg')
    ]);
    
    const connectionString = process.env.DATABASE_URL || 'postgresql://devuser:devpass@localhost:5432/taskdb';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    return { prisma, pool };
  }

  pgImpl = {
    async getAll() {
      const { prisma, pool } = await getPrismaClient();
      try {
        console.log('[boardsRepo] getAll: connecting to Prisma...');
        const result = await prisma.board.findMany({ orderBy: { createdAt: 'desc' } });
        console.log('[boardsRepo] getAll: success, found', result.length, 'boards');
        return result;
      } catch (err) {
        console.error('[boardsRepo] getAll error:', err);
        throw err;
      } finally {
        await prisma.$disconnect();
        await pool.end();
      }
    },
    async getById(id: string) {
      const { prisma, pool } = await getPrismaClient();
      try {
        return await prisma.board.findUnique({ where: { id: Number(id) } });
      } finally {
        await prisma.$disconnect();
        await pool.end();
      }
    },
    async create(payload: { title: string; description?: string }) {
      const { prisma, pool } = await getPrismaClient();
      try {
        return await prisma.board.create({ data: { title: payload.title, description: payload.description ?? null } });
      } finally {
        await prisma.$disconnect();
        await pool.end();
      }
    },
    async delete(id: string) {
      const { prisma, pool } = await getPrismaClient();
      try {
        return await prisma.board.delete({ where: { id: Number(id) } });
      } finally {
        await prisma.$disconnect();
        await pool.end();
      }
    },
  };
}

console.log('[boardsRepository] exporting', useInMemory ? 'IN-MEMORY' : 'POSTGRES', 'implementation');
export default (useInMemory ? inMemoryImpl : pgImpl);
