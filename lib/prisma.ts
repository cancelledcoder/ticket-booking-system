import { PrismaClient, Prisma } from '@prisma/client';

const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: [
    { emit: 'stdout', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
  errorFormat: 'pretty',
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaClientOptions);
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient(prismaClientOptions);
  }
  prisma = (global as any).prisma;
}

// Log all database operations in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}

export { prisma }; 