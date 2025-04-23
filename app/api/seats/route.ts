import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching seats from database...');
    
    const seats = await prisma.seat.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    console.log(`Found ${seats.length} seats`);

    if (!seats.length) {
      // If no seats exist, create 80 seats
      console.log('No seats found, creating initial seats...');
      const seatsToCreate = Array.from({ length: 80 }, (_, i) => ({
        id: i + 1,
        isBooked: false,
      }));

      await prisma.seat.createMany({
        data: seatsToCreate,
      });

      console.log('Created 80 initial seats');
      return NextResponse.json(seatsToCreate);
    }

    return NextResponse.json(seats);
  } catch (error) {
    console.error('Error in seats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or create seats' },
      { status: 500 }
    );
  }
}

export async function resetSeats() {
  try {
    await prisma.seat.updateMany({
      data: { isBooked: false },
    });
    console.log('All seats have been reset to available.');
  } catch (error) {
    console.error('Error resetting seats:', error);
  }
} 