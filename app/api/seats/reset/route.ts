import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Update all seats to not booked
    await prisma.seat.updateMany({
      data: {
        isBooked: false
      }
    });

    // Return the updated seats
    const seats = await prisma.seat.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'All seats have been reset to available',
      seats 
    });
  } catch (error) {
    console.error('Error resetting seats:', error);
    return NextResponse.json(
      { error: 'Failed to reset seats' },
      { status: 500 }
    );
  }
} 