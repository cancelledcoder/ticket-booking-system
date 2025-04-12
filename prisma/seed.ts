const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Delete all existing seats
  await prisma.seat.deleteMany();

  // Create 80 seats
  const seats = Array.from({ length: 80 }, (_, i) => ({
    id: i + 1,
    isBooked: false,
  }));

  // Insert all seats
  await prisma.seat.createMany({
    data: seats,
  });

  console.log('Seeded database with 80 seats');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 